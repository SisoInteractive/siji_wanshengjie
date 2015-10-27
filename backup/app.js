var express = require('express'),
    app = express(),
    MongoClient = require('mongodb');
var server = require("http").Server(app);
var socket = require("socket.io").listen(server);

//server.listen(89, '120.26.48.94');
server.listen(1243);
console.log('Server running at 120.0.0.1:1243');

//  connect to mongo
MongoClient.connect('mongodb://localhost:27017/siji_wanshengjie', function (err, db) {
    if (err) throw err;
	console.log('connected to mongo..');

    /** socket on */
    // Run the server
    init();

    // Initialization
    function init() {
        setEventHandlers();
    }

    // Event handlers
    function setEventHandlers() {
        // Socket.IO
        socket.on("connection", onSocketConnection);
    }


    // New socket connection
    function onSocketConnection(socket) {
        console.log('Someone comes here!!!!');

        //  on saveImage
        socket.on('saveImage', onSaveImageHandler);

        function onSaveImageHandler (data) {
            var that = this;

            console.log('someone save he\'s image.');

            //  update visitedNumber
            db.collection('visitedNumber').update({"visitedNumber": {$exists: 1}}, {$inc: {"visitedNumber": 1}});
            db.collection('numberOfSavedImages:').update({"numberOfSavedImages:": {$exists: 1}}, {$inc: {"numberOfSavedImages:": 1}});
            db.collection('saveImages').update({'saveImages': {$exists:1}}, {$set: data});

            //  send result to client
            that.emit('saveImageResult', { result: true });
        }

        //  on get image
        socket.on('getImage', onGetImageHandler);

        function onGetImageHandler (imgID) {
            var that = this;

            console.log('some request image.');

            // query image
            var queryObj = {};
            queryObj[imgID] = {$exists:1};

            var productObj = { _id:0 };
            productObj[imgID] = 1;

            db.collection('saveImages').find(queryObj, productObj).toArray(function (err, docs) {
                //console.log(docs);

                try {
                    if (docs) {
                        //  return image
                        console.log('send image back to client.');
                        that.emit('returnImage', {result: docs[0][imgID]});
                    }
                } catch (err) {
                    that.emit('returnImage', {result: false});
                }
            });

        }
    }
});
