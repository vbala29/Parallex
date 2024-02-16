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
    const form = formidable.formidable({ multiples: false });

    form.parse(req, (err, fields, files) => {
        if (err) {
          return res.status(500).json({ error: 'Error parsing form data' });
        }
        console.log(files);
        console.log(fields);
        // Check if a file was uploaded
        if (!files) {
          return res.status(400).json({ error: 'No file uploaded' });
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
            res.status(200).json({ message: 'Zip file extracted successfully' });
          })
          .on('error', (err) => {
            console.error('Error extracting zip file:', err);
            res.status(500).json({ error: 'Error extracting zip file' });
          });
      });
    // const name = req.query.name;
    // const cpu_count = req.query.cpu_count;
    // const memory_count = req.query.memory_count;
    // console.log(req.body)
    // console.log(req.files)
    // source = req.files[0]
    // await extract(source, { dir: "/" })
    // console.log('Extraction complete')
    // var head_node_ip = null;

    // await User.findOne({'email' : req.userData.email}).then (async (err, doc) => {
    //     if (err) {
    //         console.error("Error in PUT for /create-job: " + err);
    //         res.sendStatus(500);
    //     } else {
    //         var dummyIP = "8.8.8.8"; //Ipv4 Google DNS
    //         // client.sendJob({
    //         //     clientIP : dummyIP, 
    //         //     cpuCount : cpu_count, 
    //         //     memoryCount : memory_count
    //         // }, function(err, head_node) {
    //         //     if (err) {
    //         //         console.error("Error in PUT for /create-job: " + err);
    //         //         res.sendStatus(500)
    //         //     } else {
    //         //         head_node_ip = head_node.headIP
    //         //     }
    //         // });
            
    //         // if (head_node_ip) {
    //         //     var head_node_url = "http://" + head_node_ip + ":8625";
    //         //     await doc.jobs_created.push(
    //         //         {
    //         //             name : name, 
    //         //             url : "http://" + head_node_ip + ":8625", 
    //         //             running : false,
    //         //             creation_time : Date.now(), 
    //         //             termination_time : null, 
    //         //             cpu_count : cpu_count,
    //         //             memory_count : memory_count
    //         //         });
                
    //         //     //aqmp.push_job(name, head_node_url)
    //         //     res.sendStatus(201);
    //         // } else {
    //         //     res.sendStatus(500)
    //         // }
    //         res.sendStatus(201);
    //     }
    // });
});

module.exports = router;