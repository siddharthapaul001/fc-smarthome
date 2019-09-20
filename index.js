const express = require('express');
const path = require('path');
const dbController = require('./utils/dbcontroller');
const secret = require('./secrets/googleoauth');

const app = express();

var commonHeaders = {
    'Content-Type': 'application/json'
}

app.use('/', express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res)=>{
//     res.writeHead(200, {
//         ...commonHeaders
//     })

//     res.end(JSON.stringify({
//         status: 200
//     }));
// });


app.listen( process.env.PORT || 5000, () => console.log('running...'));