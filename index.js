var express = require('express');
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