const mongoDB = require('mongodb');
const mongoClient = mongoDB.MongoClient;

const user = 'sid-smarthome', pass = 'cP7LXMiTmpgapt2o';
let db;

mongoClient.connect('mongodb+srv://' + user + ':' + pass + '@sidsmarthome-jxheb.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err, client) => {
        if (!err) {
            db = client.db('test');
            let users = db.collection('users');
            users.createIndex('googleId', { unique: true });
            users.createIndex('email', { unique: true });
        }
    });

function getUser(user, cb) {
    db.collection('users').findOneAndUpdate({ googleId: user.googleId }, {$set: user},
    {new: true},
    (err, data) => {
        if (!data) {
            db.collection('users').insertOne(user, (err, insertedData) => {
                cb(err, insertedData.ops[0]);
            });
        } else {
            cb(err, data["value"]);
        }
    });
}


module.exports = { mongoClient, getUser };