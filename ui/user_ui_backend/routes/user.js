const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const User = require(locals.models + '/user');
const checkAuth = require(locals.scripts + '/checkAuth');


/* ENV variables */
const secretKey = process.env.SECRET_KEY;

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({email : email, username : username, password : password});
    const registeredUser = await User.register(user, password);
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    passport.authenticate("user", function (err, user, info) {
      if (err) {
        res.json({ success: false, message: err });
      }
      else {
        if (!user) {
          res.status(401).json({ success: false, message: "username or password incorrect" });
        }
        else {
          const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: "1h" });
          res.status(200).json({ success: true, message: "Authentication successful", token: token });
        }
      }
    })(req, res);

  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;