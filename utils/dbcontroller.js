const mongoDB = require('mongodb');
const mongoClient = mongoDB.MongoClient;

const user = 'sid-smarthome', pass = 'cP7LXMiTmpgapt2o';
let db;

function antiXSS(str) {
    if (typeof str === 'string') {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace('\"', '&#039');
    }
    return str;
}

function sanitizeParams(obj, allowedKeys) {
    let sanitizedObj = {};
    allowedKeys.forEach(key => {
        if (obj[key]) {
            if (key === '_id') {
                sanitizedObj[key] = mongoDB.ObjectID(obj[key]);
            } else {
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
            //users.createIndex('googleId', { unique: true });
            users.createIndex('email', { unique: true });
            console.log('db initiated');
        } else {
            console.log(err);
        }
    });

function getUser(user, cb, isGuest) {
    let updateUser = user,
        allowedParams = ['googleId', 'fullName', 'name', 'email', 'dp'];
    if (isGuest) {
        // console.log(user);
        updateUser = { email: user.email };
        allowedParams = ['name', 'email'];
    }
    db.collection('users').findOneAndUpdate({ $or: [{ googleId: user.googleId }, { email: user.email }] }, { $set: updateUser },
        { returnOriginal: false },
        (err, data) => {
            console.log(err, data);
            if (data && !data["value"]) {
                db.collection('users').insertOne(sanitizeParams(user, allowedParams), { returnOriginal: false }, (err, insertedData) => {
                    cb(err, insertedData.ops[0]);
                });
            } else {
                cb(err, data["value"]);
            }
        });
}

function getProfile(userIds, cb) {
    db.collection('users').find({
        _id: { $in: userIds.map(id => mongoDB.ObjectID(id)) }
    }).project({ name: 1, email: 1, dp: 1 }).toArray((err, res) => {
        cb(err, { guests: res });
    });
}

function addRoom(roomData, cb) {
    db.collection('rooms').insertOne(sanitizeParams(roomData, ['roomName', 'roomIcon', 'owner', 'guests', 'lastUpdated']), { returnOriginal: false }, (err, insertedData) => {
        cb(err, insertedData.ops[0]);
    });
}

function removeRoom(roomData, cb) {
    db.collection('rooms').deleteOne(sanitizeParams(roomData, ['_id', 'owner']), (err, data) => {
        if (data && data["result"] && data["result"]["n"] > 0) {
            db.collection('devices').deleteMany({ roomId: roomData._id });
        }
        cb(err, data["result"]);
    })
}

function getRoomsByUser(userId, lastUpdated, cb) {
    db.collection('rooms').find({ $or: [{ owner: userId, lastUpdated: { $gt: lastUpdated } }, { guests: userId, lastUpdated: { $gt: lastUpdated } }] }).toArray((err, data) => {
        cb(err, data);
    });
}

function addDevice(userId, deviceData, cb) {
    let lt = (new Date()).getTime();
    db.collection('rooms').findOneAndUpdate(sanitizeParams({ _id: deviceData.roomId, owner: userId }, ['_id', 'owner']), { $set: { lastUpdated: lt } }, { returnOriginal: false }, (err, data) => {
        if (data && data["value"]) {
            //userId is the owner of the room. so can add device to the room
            deviceData['lastUpdated'] = lt;
            db.collection('devices').insertOne(sanitizeParams(deviceData, ['deviceName', 'deviceType', 'roomId', 'wattage', 'range', 'steps', 'value', 'lastUpdated']), { returnOriginal: false }, (err, newDevice) => {
                cb(err, newDevice.ops[0]);
            });
        }
    });
}

function getDeviceListByRoom(userId, roomId, lt, cb) {
    db.collection('rooms').findOne({ $or: [{ _id: mongoDB.ObjectID(roomId), owner: userId }, { _id: mongoDB.ObjectID(roomId), guests: userId }] }, (err, roomFound) => {
        if (roomFound) {
            db.collection('devices').find({ roomId, lastUpdated: { $gt: lt } }).toArray((err, devices) => {
                cb(err, { code: 200, devices });
            });
        } else {
            cb(err, { code: 403 });
        }
    });
}

function removeDevice(userId, roomId, deviceId, cb) {
    let lt = (new Date()).getTime();
    db.collection('rooms').findOneAndUpdate({ _id: mongoDB.ObjectID(roomId), owner: userId }, { $set: { lastUpdated: lt, lastRemoved: lt } }, { returnOriginal: false }, (err, roomFound) => {
        if (roomFound && roomFound["value"]) {
            db.collection('devices').deleteOne({ _id: mongoDB.ObjectID(deviceId), roomId: roomId }, (err, res) => {
                cb(err, res["result"]);
            });
        } else {
            cb(err, { code: 403 });
        }
    });
}

function setDeviceStatus(userId, deviceInfo, cb) {
    let roomId = deviceInfo.roomId,
        lt = (new Date()).getTime();
    db.collection('rooms').findOneAndUpdate({ $or: [{ _id: mongoDB.ObjectID(roomId), owner: userId }, { _id: mongoDB.ObjectID(roomId), guests: userId }] }, { $set: { lastUpdated: lt } }, { returnOriginal: false }, (err, roomFound) => {
        if (roomFound && roomFound["value"]) {
            db.collection('devices').findOneAndUpdate({ _id: mongoDB.ObjectID(deviceInfo._id), roomId: roomId }, { $set: { value: +deviceInfo.value, lastUpdated: lt } }, { returnOriginal: false }, (err, deviceData) => {
                cb(err, { code: 200, "device": deviceData["value"] });
            });
        } else {
            cb(err, { code: 403 });
        }
    });
}

function getDevice(userId, roomId, deviceId, cb) {
    db.collection('rooms').findOne({ $or: [{ _id: mongoDB.ObjectID(roomId), owner: userId }, { _id: mongoDB.ObjectID(roomId), guests: userId }] }, (err, data) => {
        if (data) {
            db.collection('devices').findOne({ _id: mongoDB.ObjectID(deviceId), roomId: roomId }, (err, deviceData) => {
                cb(err, deviceData);
            });
        }
    });
}

function addGuest(userId, roomId, guest, cb) {
    getUser(guest, (err, user) => {
        db.collection('rooms').findOneAndUpdate({ _id: mongoDB.ObjectID(roomId), owner: userId }, { $set: { lastUpdated: (new Date()).getTime() }, $addToSet: { guests: user._id.toString() } }, { returnOriginal: false }, (err, roomFound) => {
            if (roomFound && roomFound["value"]) {
                cb(err, roomFound);
            } else {
                cb(err, { code: 403 });
            }
        });
    }, true);
}

function removeGuest(userId, roomId, guestId, cb) {
    db.collection('rooms').findOneAndUpdate({ _id: mongoDB.ObjectID(roomId), owner: userId }, { $set: { lastUpdated: (new Date()).getTime() }, $pull: { guests: guestId } }, { returnOriginal: false }, (err, roomFound) => {
        if (err) {
            cb(err, {code: 500});
        } else {
            if (roomFound && roomFound["value"]) {
                cb(err, roomFound["value"]);
            } else {
                cb(err, { code: 403 });
            }
        }
    });
}

module.exports = { mongoClient, getUser, addRoom, removeRoom, getRoomsByUser, addDevice, removeDevice, getDeviceListByRoom, setDeviceStatus, getDevice, addGuest, removeGuest, getProfile };