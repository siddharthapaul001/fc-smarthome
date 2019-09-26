const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const path = require('path');
const dbController = require('./utils/dbcontroller');
const secret = require('./secrets/googleoauth');

const app = express();

var commonHeaders = {
    'Content-Type': 'application/json'
}

passport.use(new GoogleStrategy({
    clientID: secret.GOOGLE_CLIENT_ID,
    clientSecret: secret.GOOGLE_SECRET,
    callbackURL: "/auth"
},
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

app.use(passport.initialize());
app.use(session({
    secret: 'hoyHoyyyyyyH0yyYyyy@y!!!',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/assets', express.static(path.join(__dirname, 'html/assets')));

app.get('/test', (req, res) => {
    res.end(JSON.stringify(req.session.user));
})

app.get('/', (req, res) => {
    if(req.session.user && req.session.user.googleId){
        res.sendFile(path.join(__dirname, 'html/index.html'));
    }else{
        res.redirect('/login');
    }
});

app.get('/login', passport.authenticate('google', { scope: ['email', 'profile'], prompt : "select_account" }));

app.get('/auth', passport.authenticate('google'), (req, res) => {
    req.session.user = {
        googleId: req.user.id,
        fullName: req.user.displayName,
        name: req.user.name['givenName'],
        email: req.user.emails[0].value,
        dp: req.user.photos[0].value
    }
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.end('You are successfully logged out');
        //res.redirect('https://accounts.google.com/logout');
    });
})

// app.get('/', (req, res)=>{
//     res.writeHead(200, {
//         ...commonHeaders
//     })

//     res.end(JSON.stringify({
//         status: 200
//     }));
// });


app.listen(process.env.PORT || 5000, () => console.log('running...'));