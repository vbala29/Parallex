const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const User = require(locals.models + '/user');
const checkAuth = require(locals.scripts + '/checkAuth');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var aqmp = require(locals.aqmp + "/aqmp");
const formidable = require('formidable');
const fs = require('fs');
const unzipper = require('unzipper');
const { v4: uuidv4 } = require('uuid');
const Provider = require('../models/provider.js');

/* gRPC protos */
var PROTO_PATH = '/../../../protos/user.proto';
// Suggested options for similarity to existing grpc.load behavior
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

var packageDefinition = protoLoader.loadSync(__dirname + PROTO_PATH)
const job = grpc.loadPackageDefinition(packageDefinition).job.Job;
const client = new job(
    "172.17.207.62:50051",
    grpc.credentials.createInsecure()
);

/* Routes */

router.get('/job-list', checkAuth, async (req, res) => {
    await User.findOne({ '_id': req.userData.userId }).exec().then((async (doc) => {
        if (!doc) {
            throw "Undefined Document Error";
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                jobs_created: doc.jobs_created
            }
        ));

    })).catch((err) => {
        console.error("Error in Query for /job-list: " + err);
        res.sendStatus(500);
    });
});

async function updateProvider(providerID, jobID, userID) {
    console.log("updateProvider called with " + providerID + " " + jobID + " " + userID)
    // Find the provider and add the new job to the runningJobs array
    try {
        await Provider.findOneAndUpdate(
            { '_id': providerID },
            { $push: { jobs_running: { jobID: jobID, userID: userID } } },
            { new: true, useFindAndModify: false }
        );

    } catch (err) {
        console.error("Error in Query for /create-job: " + err);
    }
}


router.put('/create-job', checkAuth, async (req, res, next) => {
    const form = formidable.formidable({ multiples: false });
    const uniqueID = uuidv4();

    new Promise((resolve, reject) => form.parse(req, async (err, fields, files) => {
        if (err) {
            reject("Error parsing form data")
            return;
        }

        cpu_count = fields.cpu_count[0]
        memory_count = fields.memory_count[0]

        // Check if a file was uploaded
        if (!files.file) {
            reject('No file uploaded');
            return;
        }

        const zipFilePath = files.file[0].filepath;

        const extractionPath = './extracted/' + uniqueID;

        // Create directory to extract files if it doesn't exist
        if (!fs.existsSync(extractionPath)) {
            fs.mkdirSync(extractionPath);
        }

        // Extract the zip file
        fs.createReadStream(zipFilePath)
            .pipe(unzipper.Extract({ path: extractionPath }))
            .on('finish', () => {
                resolve('Zip file extracted successfully');
            })
            .on('error', (err) => {
                reject('Error extracting zip file: ' + err);
            });

    })).then(async (msg) => {
        console.log(msg);
        console.log("lookup user with username: " + req.userData.username)
        User.findOne({ '_id': req.userData.userId }).exec().then((doc) => {
            if (!doc) {
                throw "Undefined Document Error";
            } else {
                var dummyIP = "8.8.8.8"; //Ipv4 Google DNS
                new Promise((resolve, reject) => client.sendJob(
                    {
                        clientIP: dummyIP,
                        cpuCount: cpu_count,
                        memoryCount: memory_count
                    },
                    (err, job_spec) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(job_spec);
                        }
                    }
                )).then(async (job_spec) => {
                    head_node_ip = job_spec.headProvider.providerIP;

                    if (head_node_ip.toLowerCase().includes("invalid")) {
                        throw new Error("Invalid head node IP");
                    }

                    console.log("Head node ip: " + head_node_ip);
                    var head_node_url = "http://" + head_node_ip + ":8265";
                    // var head_node_url = "http://127.0.0.1:8265"

                    // Update Jobs DB
                    await doc.jobs_created.push(
                        {
                            name: uniqueID,
                            url: head_node_url,
                            running: false,
                            creation_time: Date.now(),
                            cpu_count: cpu_count,
                            memory_count: memory_count,
                            unique_id: uniqueID,
                            job_cost: 0,
                            providers_assigned: [
                                {
                                    provider_id: job_spec.headProvider.providerID,
                                    status: "pending"
                                },
                                ...job_spec.providers.map(provider => {
                                    return {
                                        provider_id: provider.providerID,
                                        status: "pending"
                                    }
                                })
                            ]
                        });
                    await doc.save();
                    console.log('created jobs')

                    await updateProvider(job_spec.headProvider.providerID, uniqueID, req.userData.userId);

                    await Promise.all(job_spec.providers.map(provider =>
                        updateProvider(provider.providerID, uniqueID, req.userData.userId)
                    ));

                    // Send job submission request to head node
                    aqmp.make_job_submission_request(uniqueID, head_node_url)
                    res.sendStatus(201);
                }).catch((err) => {
                    console.error("Error in PUT for /create-job: " + err);
                    res.sendStatus(500).end();
                })
            }
        });
    }).catch((err) => {
        console.error("Error in PUT for /create-job: " + err);
        res.sendStatus(500);
    })

});

router.get('/dashboard-info', checkAuth, async (req, res) => {
    await User.findOne({ '_id': req.userData.userId }).exec().then(async (doc) => {
        if (!doc) {
            throw "Undefined Document Error";
        }

        var one_month_counter = 0;
        var total_cost = 0;
        var total_job_durations = 0;
        var job_list = doc.jobs_created;
        const ms_in_one_minute = 6000;

        var d = new Date();
        d.setMonth(d.getMonth() - 1);
        var one_month_prior_epoch_ms = d.getTime();

        for (var job of job_list) {
            if (job.creation_time > one_month_prior_epoch_ms) {
                // Within the one month interval so add to counter
                one_month_counter++;
            }
            console.log(job)
            total_cost += job.job_cost;
            if ('termination_time' in job) {
                total_job_durations += job.termination_time - job.creation_time;
            }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                one_month_job_count: one_month_counter,
                total_cost: total_cost,
                avg_duration: (total_job_durations / job_list.length) / ms_in_one_minute,
                avg_cost: total_cost / job_list.length,
            }
        ));
    }).catch((err) => {
        console.error("Error in Query for /dashboard-info: " + err);
        res.sendStatus(500);
    })
})

router.get('/available-pcu-count', checkAuth, async (req, res) => {
    await User.findOne({ '_id': req.userData.userId }).exec().then(async (doc) => {
        if (!doc) {
            throw "Undefined Document Error";
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                available_pcu_count: doc.available_pcu_count
            }
        ));
    })
})

router.post('/buy-pcu', checkAuth, async (req, res) => {
    console.log(req)
    await User.findOneAndUpdate(
        { '_id': req.userData.userId },
        { $inc: { available_pcu_count: req.body.pcu_bought } }
    ).exec().then(
        async (user) => {
            res.sendStatus(200);
        }
    ).catch((err) => {
        console.error("Error in Query for /buy-pcu: " + err);
        res.sendStatus(500);
    })
})


module.exports = router;