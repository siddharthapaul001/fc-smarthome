const apiRouter = require('express').Router();

var commonHeaders = {
    'Content-Type': 'application/json'
}

// const session = require('express-session');

// apiRouter.use(session({
//     secret: 'hoyHoyyyyyyH0yyYyyy@y!!!',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));

// API CODES --> 200 OK, 401 UNAUTHORIZED MEANS REDIRECT TO LOGIN PAGE, 403 FORBIDDEN MEANS MAY LOGGED IN BUT DOESN'T ALLOWED TO PERFORM THE TASK

apiRouter.get('/getprofile', (req, res) => {
    let statusCode = 401;
    console.log(req.session.user);
    if (req.session.user && req.session.user._id) {
        statusCode = 200;
    }
    res.writeHead(statusCode, {
        ...commonHeaders
    });
    res.end(JSON.stringify(req.session.user));
})

module.exports = apiRouter;