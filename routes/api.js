const apiRouter = require('express').Router();
const { getUser, addRoom, removeRoom, getRoomsByUser, addDevice, removeDevice, getDeviceListByRoom, setDeviceStatus, getDevice } = require('../utils/dbcontroller');

var commonHeaders = {
    'Content-Type': 'application/json'
}

const roomIcons = ['001-wardrobe.png', '012-rack.png', '025-closet.png', '041-chandelier.png', 'bed.png', 'dog.png', 'mirror.png', 'window.png',
    '002-tv-table.png', '015-desk-1.png', '029-double-bed.png', '044-bunk-bed.png', 'bookcase.png', 'door-1.png', 'shower.png',
    '007-sofa.png', '018-mirror.png', '031-cupboard-1.png', '048-cupboard.png', 'cactus.png', 'door.png', 'television.png',
    '010-shelves.png', '021-lamp.png', '035-cabinet.png', '049-table.png', 'computer.png', 'living-room.png', 'window-1.png']

// const session = require('express-session');

// apiRouter.use(session({
//     secret: 'hoyHoyyyyyyH0yyYyyy@y!!!',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));

// API CODES --> 200 OK, 401 UNAUTHORIZED MEANS REDIRECT TO LOGIN PAGE, 403 FORBIDDEN MEANS MAY LOGGED IN BUT DOESN'T ALLOWED TO PERFORM THE TASK

function sendHeaders(req, res) {
    let statusCode = 401;
    if (req.session.user && req.session.user._id) {
        statusCode = 200;
    }
    res.writeHead(statusCode, {
        ...commonHeaders
    });
    return statusCode === 200;
}

apiRouter.get('/getprofile', (req, res) => {
    if(sendHeaders(req, res)){
        res.end(JSON.stringify(req.session.user));
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.post('/rooms/add', (req, res) => {
    let allOk = true, msg = '';
    // if(sendHeaders(req, res)){
    //     req.body
    // }
    //checks to do
    if (!req.body.roomName || req.body.roomName.length === 0) {
        allOk = false;
        msg += 'Room name not provided.';
    }
    if (!req.body.roomIcon || !roomIcons.includes(req.body.roomIcon)){
        allOk = false;
        msg += 'Incorrect room icon specified';
    }
    if(sendHeaders(req, res) && allOk){
        let roomData = req.body;
        roomData['owner'] = req.session.user._id;
        roomData['guests'] = [];
        roomData['lastUpdated'] = (new Date()).getTime();
        addRoom(roomData, (err, data) => {
            if(err){
                console.log(err);   
            }
            res.end(JSON.stringify(data));
        })
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.post('/rooms/remove', (req, res) => {
    if(sendHeaders(req, res)){
        req.body.owner = req.session.user._id;
        removeRoom(req.body, (err, data) => {
            res.end(JSON.stringify({nRemoved: data["n"]}));
        })
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.get('/rooms/list', (req, res) => {
    if(sendHeaders(req, res)){
        getRoomsByUser(req.session.user._id, +req.query.lt, (err, data) => {
            res.end(JSON.stringify(data));
        })
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.post('/devices/add', (req, res)=> {
    if(sendHeaders(req, res)){
        addDevice(req.session.user._id, req.body, (err, newDevice) => {
            console.log(err);
            res.end(JSON.stringify(newDevice));
        });
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.get('/devices/list/:roomId', (req, res) => {
    if(sendHeaders(req, res)){
        let roomId = req.params.roomId;
        getDeviceListByRoom(req.session.user._id, roomId, (err, devices) => {
            console.log(err);
            res.end(JSON.stringify(devices));
        });
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.post('/devices/status/:roomId/:deviceId', (req, res) => {
    if(sendHeaders(req, res) && +req.body.value >= 0){
        let deviceInfo = { 
            _id: req.params.deviceId,
            roomId: req.params.roomId,
            value: +req.body.value
        };
        setDeviceStatus(req.session.user._id, deviceInfo, (err, device) => {
            res.end(JSON.stringify(device));
        });
    }else{
        res.end(JSON.stringify({}));
    }
});

apiRouter.get('/devices/status/:roomId/:deviceId', (req, res) => {
    if(sendHeaders(req, res)){
        let deviceId = req.params.deviceId,
        roomId = req.params.roomId;
        getDevice(req.session.user._id, roomId, deviceId, (err, device) =>{
            res.end(JSON.stringify(device));
        });
    }else{
        res.end(JSON.stringify({}));
    }
});

module.exports = { apiRouter, getUser };