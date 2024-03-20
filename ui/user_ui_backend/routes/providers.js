const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const Provider = require(locals.models + '/provider');
const checkAuth = require(locals.scripts + '/checkAuth');


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
                    const token = jwt.sign({ userId: provider._id, username: provider.username }, secretKey, { expiresIn: "1h" });
                    res.status(200).json({ success: true, message: "Authentication successful", token: token });
                }
            }
        })(req, res);

    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

module.exports = router;