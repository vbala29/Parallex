const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const Provider = require(locals.models + '/provider');
const checkAuth = require(locals.scripts + '/checkAuth');
const User = require(locals.models + '/user');


/* ENV variables */
const secretKey = process.env.SECRET_KEY;

router.post('/provider/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body)

        const provider = new Provider({ email: email, username: username, password: password });
        const registeredProvider = await Provider.register(provider, password);
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/provider/login', async (req, res) => {
    try {
        passport.authenticate("provider", function (err, provider, info) {
            if (err) {
                res.json({ success: false, message: err });
            }
            else {
                if (!provider) {
                    res.status(401).json({ success: false, message: "username or password incorrect" });
                }
                else {
                    const token = jwt.sign({
                        /*Required to keep as userId to match `checkAuth.js`*/
                        userId: provider._id,
                        username: provider.username
                    }, secretKey, { expiresIn: "1h" });
                    res.status(200).json({ success: true, message: "Authentication successful", token: token });
                }
            }
        })(req, res);

    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

/*
Requires:
job_id: Number
job_userid: Number
pcu_increment: Number
time_end: Optional[Number], in Unix time
*/
router.post('/provider/update', checkAuth, async (req, res) => {

    try {
        const providerId = req.userData.userId;
        const job_id = req.body.job_id;
        const pcu_increment = req.body.pcu_increment;
        const job_userid = req.body.job_userid;
        const find_schema = {
            '_id': providerId,
            'jobs_running.user': job_user,
            'jobs_running.id': job_id,
        }

        provider_update_command = {
            $inc: { 'jobs_running.$.pcu_consumed': pcu_increment }
        }
        if (req.body.time_end) {
            const time_end = req.body.time_end;
            provider_update_command[$set] = { 'jobs_running.$.time_end': time_end }
        }

        await Provider.findOneAndUpdate(
            find_schema,
            provider_update_command,
        )

        const user_find_schema = {
            '_id': job_userid,
            'jobs_created.unique_id': job_id
        }

        const user = await User.findById(userId)
        const allProvidersCompleted = user.jobs_created.every(job =>
            job.providers_assigned.every(provider => provider.status === 'completed')
        );

        user_update_command = {
            $inc: { 'jobs_created.$.job_cost': pcu_increment }
        }

        if (allProvidersCompleted) {
            user_update_command[$set] = { 'jobs_created.$.running': false }
        }

        await User.findOneAndUpdate(
            user_find_schema,
            user_update_command
        )
    } catch (err) {
        console.error("Error in Query for /provider/update: " + err);
        res.sendStatus(500);
    }
    res.sendStatus(200);
})

module.exports = router;