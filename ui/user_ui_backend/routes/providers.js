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

            if (!user) {
                throw "User not found";
            }

            const job = user.jobs_created.find(job => job.unique_id === job_id);

            if (!job) {
                throw "Job not found";
            }

            const provider = job.providers_assigned.find(provider => provider.provider_id === providerId);

            if (!provider) {
                throw "Provider not found";
            }
            provider.status = 'completed';
            await user.save();
        }

        await Provider.findOneAndUpdate(
            find_schema,
            provider_update_command
        )

        // Complete user billing. Non-race (I think)?        
        const user = await User.findById(job_userid)

        if (!user) {
            throw "User not found";
        }

        const job = user.jobs_created.find(job => job.unique_id === job_id);

        if (!job) {
            throw "Job not found";
        }

        // Update the job cost
        job.job_cost = job.job_cost + pcu_increment;


        // Check if all providers have completed the job
        const allProvidersCompleted = job.providers_assigned.every(provider => provider.status === 'completed');
        if (allProvidersCompleted) {
            // Update job running status and termination time
            last_time_end = req.body.time_end;
            for (const provider of job.providers_assigned) {
                const provider_entry = await Provider.findById(provider.provider_id);
                if (!provider_entry) {
                    throw "Provider not found";
                }
                const provider_job_entry = provider_entry.jobs_running.find(job_running => job_running.jobID === job_id);
                if (!provider_job_entry) {
                    throw "Provider job not found";
                }
                last_time_end = Math.max(last_time_end, provider_job_entry.time_end)
            }
            console.log('Completing job with ID', job_id, 'and user', job_userid, 'with time_end', last_time_end)

            job.running = false;
            job.termination_time = last_time_end;

            // Finish user billing
            console.log('Billing user', job_userid, 'for job', job_id, 'with cost', job.job_cost);
            user.available_pcu_count -= job.job_cost;
        }

        await user.save();

    } catch (err) {
        console.error("Error in Query for /provider/update: " + err);
        res.sendStatus(500);
    }
    res.sendStatus(200);
})


router.get('/provider/dashboard-info', checkAuth, async (req, res) => {
    try {
        const provider = await Provider.findOne({ '_id': req.userData.userId });
        if (!provider) {
            throw "Provider not found";
        }

        // TODO(andy) this should probably be cached and updated, instead of recomputing every time.
        totalPcuConsumed = provider.jobs_running.reduce((total, job) => total + (job.pcu_consumed || 0), 0)

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(
            {
                provider_duration: provider.provider_duration,
                pcu_contributed: totalPcuConsumed,
                reliability_score: provider.reliability,
            }
        ));
    } catch (err) {
        console.error(err)
        res.sendStatus(500);
    }
})

// This technically doesn't align with `/provider/reward`, since the lifetime duration of the Provider is different from
// the duration for each job (which is what `/provider/job-summary` uses)
function calculate_reward(PCU, duration) {
    value_pcu = locals.pcu_cost
    value_duration = 1.0 / 3600
    return PCU * value_pcu + duration * value_duration
}

function calculate_lottery(PCU, duration) {
    lottery_pcu = 2
    lottery_duration = 10.0 / 3600
    return lottery_pcu * PCU + lottery_duration * duration
}

router.get('/provider/rewards', checkAuth, async (req, res) => {
    try {
        const provider = await Provider.findOne({ '_id': req.userData.userId });
        if (!provider) {
            throw "Provider not found";
        }

        // TODO(andy) this should probably be cached and updated, instead of recomputing every time.
        totalPcuConsumed = provider.jobs_running.reduce((total, job) => total + (job.pcu_consumed || 0), 0)
        // TODO(andy) - incorporate reliability into rewards calculation
        console.log('reward for provider with total PCU', totalPcuConsumed, 'and duration', provider.provider_duration, 'is', calculate_reward(totalPcuConsumed, provider.provider_duration))
        total_reward = calculate_reward(totalPcuConsumed, provider.provider_duration)
        lottery_reward = calculate_lottery(totalPcuConsumed, provider.provider_duration)
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(
            {
                lottery_entries: lottery_reward,
                total_reward: total_reward,
            }
        ));
    } catch (err) {
        console.error(err)
        res.sendStatus(500);
    }
})


router.get('/provider/job-summary', checkAuth, async (req, res) => {
    try {
        const provider = await Provider.findOne({ '_id': req.userData.userId });
        if (!provider) {
            throw "Provider not found";
        }

        let sortedJobs = provider.jobs_running.sort((a, b) => b.time_start - a.time_start);
        let recentJobs = sortedJobs.slice(0, 5);
        let jobSummaries = recentJobs.map(job => {
            return {
                job_id: job.jobID,
                time_start: job.time_start,
                reward: calculate_reward(job.pcu_consumed, (job.time_end ? job.time_end - job.time_start : Date.now() - job.time_start) / 1000),
            }
        })
        console.log('job summary', jobSummaries)

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(jobSummaries));
    } catch (err) {
        console.error(err)
        res.sendStatus(500);
    }
})



router.post('/provider/update-duration', checkAuth, async (req, res) => {
    try {
        if (!req.body.provider_duration) {
            throw "No provider_duration field in request body";
        }
        const provider = await Provider.findOne({ '_id': req.userData.userId });
        if (!provider) {
            throw "Provider not found"
        }
        provider.provider_duration = req.body.provider_duration;
        await provider.save();
        res.sendStatus(200);

    } catch (err) {
        console.error(err)
        res.sendStatus(500);
    }
})

module.exports = router;