const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const User = require(locals.models + '/user');
const checkAuth = require(locals.scripts + '/checkAuth');


router.get('/clusters', checkAuth, async (req, res) => {
    await User.findOne({'email' : req.userData.email}).exec(async (err, doc) => {
        if (err) {
            console.error("Error in Query for /clusters: " + err);
            res.sendStatus(500);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(
                {
                    clusters_created : doc.clusters_created
                }
            ));
        }
    });
  });
