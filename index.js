var flock = require('flockos');
var config = require('./config.js');
var express = require('express');
var fs = require('fs');

flock.appId = config.appId;
flock.appSecret = config.appSecret;
// flock.baseUrl = config.baseUrl;
var app = express();



// Listen for events on /events, and verify event tokens using the token verifier.
app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);
app.get('/home', function(req, res) {
    res.send('Thank You for registering with us!');
});
app.get('/', function(req, res) {
    res.send('Flock');
});

// Read tokens from a local file, if possible.
var tokens;
try {
    tokens = require('./tokens.json');
} catch (e) {
    tokens = {};
}

// save tokens on app.install
flock.events.on('app.install', function (event, callback) {
    tokens[event.userId] = event.token;    
    callback(null, {});
});


// delete tokens on app.uninstall
flock.events.on('app.uninstall', function (event, callback) {
    delete tokens[event.userId];
    callback(null, {});
});



flock.events.on('client.slashCommand', function (event, callback) {
    var name = event.name;
    var userId = event.userId;
    var userName = event.userName;
    var chat = event.chat;
    var chatName = event.chatName;
    var command = event.command;
    var text = event.text;
    var textArray = text.split(" ");
    var time = Number(textArray[0]);
    textArray[0] = "";
    textArray.splice(0, 1);
    var commandText = textArray.join(" ");
    setTimeout(function() {
        flock.callMethod('chat.sendMessage', tokens[event.userId], {
                to: chat,
                text: commandText 
            }, function (error, response) {
                if(!error) {
                    console.log(response);
                } else {
                    console.log('error while sending chat sendMessage');
                }
            });
    }, time); 
    callback(null, {
        "text": "Setting a reminder for " + time + " milliseconds!"
    });
});

flock.callMethod('roster.listContacts', "996f4684-30b6-4f48-8e64-5d60aa6c872f", {
});


flock.events.on('chat.receiveMessage', function(event, callback) {
    var fromId = event.message.from;
    var toId = event.message.to;  //bot identifier
    var text = event.message.text;

    //applly logic for sending text





    flock.callMethod('chat.sendMessage', config.botToken, {
        to: fromId,
        text: "ya wait for a minute",
        attachments: 
        [
            {
                "title":"attachment title",
                "description":"attachment description",
                "views": {
                    "image": {
                        "original": {
                            "src": "https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/mugshot%202016/76061_1to1_mf_batman_336.png?l.r2=-798905063",
                            "width": 400
                        }
                    }
                    // ,
                    // "html": { 
                    //     "inline": "<html><head></head><body bgcolor='red'></body></html>", 
                    //     "width": 400, 
                    //     "height": 400 
                    // }
                    // ,
                    // "flockml": "<flockml>Hello World</flockml>"
                },
                "buttons": [{
                    "name": "View",
                    "icon": "https://cdn3.iconfinder.com/data/icons/faticons/32/view-01-128.png",
                    "action": { "type": "openWidget", "desktopType": "modal", "mobileType": "modal", "url": "<action url>" },
                    "id": "viewButton"
                }, {
                    "name": "Help",
                    "icon": "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-help-circled-128.png",
                    "action": { "type": "openWidget", "desktopType": "sidebar", "mobileType": "modal", "url": "<action url>" },
                    "id": "helpButton"
                }]
            }
        ]
    }, function(error, response) {
        if(error) {
            console.log(error);
        }
    });
    callback(null, {});
});








// Start the listener after reading the port from config
var port = config.port || 3000;
app.listen(port, function () {
    console.log('Listenineg on port: ' + port);
});

// exit handling -- save tokens in token.js before leaving
process.on('SIGINT', process.exit);
process.on('SIGTERM', process.exit);
process.on('exit', function () {
    fs.writeFileSync('./tokens.json', JSON.stringify(tokens));
});




































// flock.events.on('client.slashCommand', function (event, callback) {
//     // handle slash command event here

//     // invoke the callback to send a response to the event
//     callback(null, { text: 'Received your command' });
// });

// flock.callMethod('chat.sendMessage', token, {
//     to: 'u:wufu4udrcewerudu',
//     text: 'hello'
// }, function (error, response) {
//     if (!error) {
//         console.log(response);
//     }
// });