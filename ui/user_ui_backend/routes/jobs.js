const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const User = require(locals.models + '/user');
const checkAuth = require(locals.scripts + '/checkAuth');

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

router.put('/create-job', checkAuth, async (req, res) => {
    const name = req.query.name;
    const cpu_count = req.query.cpu_count;
    const memory_count = req.query.memory_count;
    
    await User.findOne({'email' : req.userData.email}).exec(async (err, doc) => {
        if (err) {
            console.error("Error in PUT for /create-job: " + err);
            res.sendStatus(500);
        } else {
            await doc.jobs_created.push({})
            res.sendStatus(201)
        }
    });
});


