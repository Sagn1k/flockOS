var flock = require('flockos');
var config = require('./config.js');
var express = require('express');
var fs = require('fs');

flock.appId = config.appId;
flock.appSecret = config.appSecret;
flock.baseUrl = config.baseUrl;
var app = express();

// Listen for events on /events, and verify event tokens using the token verifier.
app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);
app.get('/home', function(req, res) {
    res.send('Thank You for registering with us!');
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

// Start the listener after reading the port from config
var port = config.port || 3000;
app.listen(port, function () {
    console.log('Listening on port: ' + port);
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