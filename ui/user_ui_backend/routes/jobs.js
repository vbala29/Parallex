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
  "localhost:50051",
  grpc.credentials.createInsecure()
);

/* Routes */

router.get('/job-list', checkAuth, async (req, res) => {
    await User.findOne({'email' : req.userData.email}).exec(async (err, doc) => {
        if (err) {
            console.error("Error in Query for /job-list: " + err);
            res.sendStatus(500);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(
                {
                    jobs_created : doc.jobs_created
                }
            ));
        }
    });
  });

router.put('/create-job', checkAuth, async (req, res, next) => {
    const name = req.query.name;
    const cpu_count = req.query.cpu_count;
    const memory_count = req.query.memory_count;
    const form = formidable.formidable({ multiples: false });

    new Promise ((resolve, reject) => form.parse(req, async (err, fields, files) => {
        if (err) {
            reject("Error parsing form data")
            return;
        }

        // Check if a file was uploaded
        if (!files) {
            console.log('No file uploaded');
            reject('No file uploaded');
            return;
        }
    
        const zipFilePath = files.file[0].filepath;

        const extractionPath = './extracted/' + files.file[0].originalFilename;
    
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

        await User.findOne({'email' : req.userData.email}).then (async (err, doc) => {
            if (err) {
                console.error("Error in PUT for /create-job: " + err);
               // res.sendStatus(500).end();
            } else {
                var dummyIP = "8.8.8.8"; //Ipv4 Google DNS
                new Promise ((resolve, reject) => client.sendJob(
                    {
                        clientIP : dummyIP, 
                        cpuCount : cpu_count, 
                        memoryCount : memory_count
                    }, 
                    (err, head_node) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(head_node.headIP);
                        }
                    }
                )).then(async (head_node_ip) => {
                    var head_node_url = "http://" + head_node_ip + ":8625";
                    await doc.jobs_created.push(
                        {
                            name : name, 
                            url : "http://" + head_node_ip + ":8625", 
                            running : false,
                            creation_time : Date.now(), 
                            termination_time : null, 
                            cpu_count : cpu_count,
                            memory_count : memory_count
                        });
                    
                    aqmp.make_job_submission_request(name, head_node_url)
                    res.sendStatus(201);
                }).catch((err) => {
                    console.error("Error in PUT for /create-job @ gRPC: " + err);
                    res.sendStatus(500).end();
                })
            }
        });
    }).catch((err) => {
        console.err(err);
    })
    
});

module.exports = router;