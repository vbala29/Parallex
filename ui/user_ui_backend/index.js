const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const User = require('./models/user')
const LocalStrategy = require('passport-local')
const https = require('https');
const http = require('http');
const app = express()
const session = require('express-session') //Adds to req param
//Cross origin resource sharing needed for front end to access express backend at different domain
const cors = require('cors'); 

/* ENV variables */
const port = process.env.PORT || 8000;
const httpsUse = process.env.HTTPS === 'true';
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

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, function () {
    var server = httpsUse ? https.createServer(app) : http.createServer(options, app);
    console.log("Server starting. Port: " + port + " Protocol: " + `${httpsUse ? 'HTTPS' : 'HTTP'}`);
    return server.listen.apply(server, arguments)
}) 
