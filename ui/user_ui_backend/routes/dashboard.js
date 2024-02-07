const express = require('express')
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const locals = require('../app.locals.js')
const User = require(locals.models + '/user');
const checkAuth = require(locals.scripts + '/checkAuth');

router.get('/profile', checkAuth, (req, res) => {
    res.json({ authenticated : true });
});

router.get('/clusters', checkAuth, async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const user = new User({email : email, username : username, password : password});
      const registeredUser = await User.register(user, password);
      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });
