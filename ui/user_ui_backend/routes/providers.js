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
provider_id: string
job_id: string
job_userid: string
pcu_increment: Number
time_end: Optional[Number], in Unix time
*/
router.post('/provider/update', async (req, res) => {
    /* This is insecure for now. Ideally every daemon is linked up with the JWT and reports its own metrics, but only the head node runs the metrics agent for now. */
    console.log("Received update provider request: " + JSON.stringify(req.body));
    try {
        const providerId = req.body.provider_id;
        const job_id = req.body.job_id;
        const pcu_increment = req.body.pcu_increment;
        const job_userid = req.body.job_userid;
        const find_schema = {
            '_id': providerId,
            'jobs_running.jobID': job_id,
        }

        provider_update_command = {
            $inc: { 'jobs_running.$.pcu_consumed': pcu_increment }
        }
        if (req.body.time_end) {
            const time_end = req.body.time_end;
            provider_update_command['$set'] = { 'jobs_running.$.time_end': time_end }

            const user_provider_find_schema = {
                '_id': job_userid,
                'jobs_created.unique_id': job_id,
                // 'jobs_created.providers_assigned.provider_id': providerId
            }

            // Update the provider status. Non-race, so don't need `findOneAndUpdate` here.
            const user = await User.findOne(user_provider_find_schema);
            if (user) {
                const job = user.jobs_created.find(job => job.unique_id === job_id);
                if (job) {
                    const provider = job.providers_assigned.find(provider => provider.provider_id === providerId);
                    if (provider) {
                        provider.status = 'completed';
                        await user.save();
                    }
                }
            }
        }


        const update = await Provider.findOne(find_schema)
        console.log(update)

        await Provider.findOneAndUpdate(
            find_schema,
            provider_update_command
        )


        // Complete user billing. Non-race (I think)?        
        const user = await User.findById(job_userid)
        if (user) {
            const job = user.jobs_created.find(job => job.unique_id === job_id);
            const allProvidersCompleted = job.providers_assigned.every(provider => provider.status === 'completed');
            if (allProvidersCompleted) {
                console.log('Completing job with ID', job_id, 'and user', job_userid)
                job.running = false;
                console.log('Billing user', job_userid, 'for job', job_id, 'with cost', job.job_cost);
                user.available_pcu_count -= job.cpu_count;
                await user.save();
            }
        }

    } catch (err) {
        console.error("Error in Query for /provider/update: " + err);
        res.sendStatus(500);
    }
    res.sendStatus(200);
})

module.exports = router;