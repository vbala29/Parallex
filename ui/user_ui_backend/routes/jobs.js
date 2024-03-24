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

var config = JSON.parse(fs.readFileSync(__dirname + '/../../../config/config.json', 'utf8'));

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
    config.ip_addresses.command_server + ":" + config.ports.command_server,
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

async function updateProvider(providerID, jobID, userID, time_start) {
    console.log("updateProvider called with " + providerID + " " + jobID + " " + userID)
    // Find the provider and add the new job to the runningJobs array
    try {
        await Provider.findOneAndUpdate(
            { '_id': providerID },
            { $push: { jobs_running: { jobID: jobID, userID: userID, time_start: time_start } } },
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

        console.log('cpu count', cpu_count, 'memory count', memory_count)

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
                console.log('sending job request')
                console.log(client)
                console.log(client.sendJob)
                job_request = {
                    clientIP: String(dummyIP),
                    jobID: String(uniqueID),
                    jobUserID: String(req.userData.userId),
                    cpuCount: Number(cpu_count),
                    memoryCount: Number(memory_count),
                }
                console.log('request', job_request)
                new Promise((resolve, reject) => client.sendJob(
                    job_request,
                    (err, job_spec) => {
                        if (err) {
                            console.log('errored on command', err)
                            reject(err);
                        } else {
                            resolve(job_spec);
                        }
                    }
                )).then(async (job_spec) => {
                    console.log('got job spec', job_spec)
                    head_node_ip = job_spec.headProvider.providerIP;

                    if (head_node_ip.toLowerCase().includes("invalid")) {
                        throw new Error("Invalid head node IP");
                    }

                    console.log("Head node ip: " + head_node_ip);
                    var head_node_url = "http://" + head_node_ip + ":" + config.ports.ray_dashboard;

                    providers_assigned = [
                        {
                            provider_id: job_spec.headProvider.providerID,
                            status: "pending"
                        },
                        ...(job_spec.providers ? job_spec.providers.map(provider => {
                            return {
                                provider_id: provider.providerID,
                                status: "pending"
                            }
                        }) : [])
                    ]
                    job_creation_time = Date.now();
                    // Update Jobs DB
                    await doc.jobs_created.push(
                        {
                            name: uniqueID,
                            url: head_node_url,
                            running: true,
                            creation_time: job_creation_time,
                            cpu_count: cpu_count,
                            memory_count: memory_count,
                            unique_id: uniqueID,
                            job_cost: 0,
                            providers_assigned: providers_assigned
                        });
                    await doc.save();
                    console.log('created jobs')

                    // Assume for now that time `time_start` of a Provider is the same as the job creation time. Eventually this will not be the case
                    // once we have a feedback mechanism from Ray
                    await updateProvider(job_spec.headProvider.providerID, uniqueID, req.userData.userId, job_creation_time);

                    if (job_spec.providers > 0) {
                        await Promise.all(job_spec.providers.map(provider =>
                            updateProvider(provider.providerID, uniqueID, req.userData.userId, job_creation_time)
                        ));
                    }

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
        var total_job_durations = 0.0;
        var completed_job_count = 0;
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
            total_cost += job.job_cost;
            if ('termination_time' in job && job.termination_time) {
                time_used = job.termination_time - job.creation_time;
                total_job_durations += time_used;
                console.log('found termination time in', job, 'with time used', time_used)
                console.log('total_job_durations', total_job_durations)
                completed_job_count++;
            }
        }


        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                one_month_job_count: one_month_counter,
                total_cost: total_cost,
                avg_duration: (total_job_durations / completed_job_count) / ms_in_one_minute,
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
    console.log("in buy pcu")
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