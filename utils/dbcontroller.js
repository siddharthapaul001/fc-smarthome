const mongoDB = require('mongodb');
const mongoClient = mongoDB.MongoClient;

const user = 'sid-smarthome', pass = 'cP7LXMiTmpgapt2o';
let db;

function antiXSS(str) {
    if(typeof str === 'string'){
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace('\"', '&#039');
    }
    return str;
}

function sanitizeParams(obj, allowedKeys) {
    let sanitizedObj = {};
    allowedKeys.forEach(key => {
        if (obj[key]) {
            if(key === '_id'){
                sanitizedObj[key] = mongoDB.ObjectID(obj[key]);
            }else{
                sanitizedObj[key] = antiXSS(obj[key]);
            }
        }
    });
    return sanitizedObj;
}

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
            console.log('db initiated');
        } else {
            console.log(err);
        }
    });

function getUser(user, cb) {
    db.collection('users').findOneAndUpdate({ googleId: user.googleId }, { $set: user },
        { new: true },
        (err, data) => {
            if (!data["value"]) {
                db.collection('users').insertOne(user, { new: true }, (err, insertedData) => {
                    cb(err, insertedData.ops[0]);
                });
            } else {
                cb(err, data["value"]);
            }
        });
}

function addRoom(roomData, cb) {
    db.collection('rooms').insertOne(sanitizeParams(roomData, ['roomName', 'roomIcon', 'owner', 'guests', 'lastUpdated']), { new: true }, (err, insertedData) => {
        cb(err, insertedData.ops[0]);
    });
}

function removeRoom(roomData, cb){
    db.collection('rooms').deleteOne(sanitizeParams(roomData, ['_id', 'owner']), (err, data) => {
        cb(err, data["result"]);
    })
}

function getRoomsByUser(userId, lastUpdated, cb) {
    db.collection('rooms').find({$or: [{owner: userId, lastUpdated: {$gt: lastUpdated}}, {guests: userId, lastUpdated: {$gt: lastUpdated}}]}).toArray((err, data) => {
        cb(err, data);
    });
}


module.exports = { mongoClient, getUser, addRoom, removeRoom, getRoomsByUser};