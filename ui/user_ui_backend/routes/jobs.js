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
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

/* Routes */

router.get('/job-list', checkAuth, async (req, res) => {
    await User.findOne({'email' : req.userData.email}).exec().then((async (doc) => {
        if (!doc) {
            throw "Undefined Document Error";
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                jobs_created : doc.jobs_created
            }
        ));

    })).catch((err) => {
        console.error("Error in Query for /job-list: " + err);
        res.sendStatus(500);
    });
  });

router.put('/create-job', checkAuth, async (req, res, next) => {
    var cpu_count = 1 ;
    var memory_count = 2048; 
    const form = formidable.formidable({ multiples: false });
    const uniqueID = uuidv4();

    console.log("Request with cpu_count of: " + cpu_count)

    new Promise ((resolve, reject) => form.parse(req, async (err, fields, files) => {
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

        User.findOne({'email' : req.userData.email}).exec().then((doc) => {
            if (!doc) {
                throw "Undefined Document Error";
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
                    console.log("Head node ip: " + head_node_ip)
                    var head_node_url = "http://" + head_node_ip + ":8265";
                    // var head_node_url = "http://127.0.0.1:8265"
                    await doc.jobs_created.push(
                        {
                            name : uniqueID, 
                            url : head_node_url, 
                            running : false,
                            creation_time : Date.now(), 
                            termination_time : null, 
                            cpu_count : cpu_count,
                            memory_count : memory_count,
                            unique_id : uniqueID
                        });
                    await doc.save();
                    
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

module.exports = router;