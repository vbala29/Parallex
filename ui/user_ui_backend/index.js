const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const User = require('./models/user')
const LocalStrategy = require('passport-local')
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path')
const app = express()
const session = require('express-session') //Adds to req param
//Cross origin resource sharing needed for front end to access express backend at different domain
const cors = require('cors'); 

/* ENV variables */
const secretKey = process.env.SECRET_KEY;

/* Middleware */
app.use(express.urlencoded({extended : true})) //Use extended true b/c qs library has more security. 
app.use(session({secret: secretKey, resave: false, saveUninitialized: false}))
app.use(express.static('public')); //Serve CSS and JS statics
app.use(express.text()) //Parses text/
app.use(express.json()) //Middleware to parse application/json body
app.use(cors({
    origin: '*'
})); //Allow cross origin resource sharing so front end can access express routes


/* Routes */
const userRoutes = require('./routes/user')

/* MongoDB */

mongoose.connect('mongodb://localhost:27017/parallex-login', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind("parallex-login database connection error:"))
db.once("open", () => {
    console.log("parallex-login database connected")
})

/* Express App Setup */

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '/views'))

/* Passport */

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

/* Main Logic */
app.use('/', userRoutes);

app.get('/', async (req, res) => {
    res.send('Hello World!')
});

/* Error Routes */
app.all('*', (req, res, next) => {
   res.sendStatus(404);
})


/* HTTPS Setup */ 

var key = fs.readFileSync(path.join(__dirname, '/certs/localhost-key.pem'), 'utf8');
var cert = fs.readFileSync(path.join(__dirname, '/certs/localhost.pem'), 'utf8');

var options = {
  key: key,
  cert: cert
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);
httpServer.listen(8080, () => {
    console.log("HTTP Server starting...");
});

httpsServer.listen(8443, () => {
    console.log("HTTPS Server starting...");
});
