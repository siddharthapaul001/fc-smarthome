const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const path = require('path');
// const { getUser } = require('./utils/dbcontroller');
const secret = require('./secrets/googleoauth');
const {apiRouter, getUser} = require('./routes/api');

const app = express();

passport.use(new GoogleStrategy({
    clientID: secret.GOOGLE_CLIENT_ID,
    clientSecret: secret.GOOGLE_SECRET,
    callbackURL: "/auth"
},
    function (accessToken, refreshToken, profile, done) {
        let user = {
            googleId: profile.id,
            fullName: profile.displayName,
            name: profile.name['givenName'],
            email: profile.emails[0].value,
            dp: profile.photos[0].value
        };
        getUser(user, (err, data) => {
            return done(null, data);
        });
    }
));
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

app.use(bodyParser.json());

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
    if (req.session.user && req.session.user.googleId) {
        res.sendFile(path.join(__dirname, 'html/index.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/login', passport.authenticate('google', { scope: ['email', 'profile'], prompt: "select_account" }));

app.get('/auth', passport.authenticate('google'), (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.end('You are successfully logged out');
        //res.redirect('https://accounts.google.com/logout');
    });
})

app.use('/api', apiRouter);

app.listen(process.env.PORT || 5000, () => console.log('running...'));