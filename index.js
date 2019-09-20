var express = require('express');
const app = express();

var commonHeaders = {
    'Content-Type': 'application/json'
}

app.get('/', (req, res)=>{
    res.writeHead(200, {
        ...commonHeaders
    })

    res.write(JSON.stringify({
        'status': 200
    }))

    res.end();
});


app.listen( process.env.PORT || 5000, () => console.log('running...'));