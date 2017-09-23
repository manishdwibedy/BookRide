var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var MICROSOFT_APP_ID = '99ffde50-d6f9-4853-b744-c251e7255df0';
var MICROSOFT_APP_PASSWORD = 'XOjg6LtgkryrBgBBz5knuJr';
var LYFT_CLIENT_ID = 'FByyis93GEZR';
var LYFT_CLIENT_SECRET = 'FZXmjNuivSq8cIqRCVQgg5SST8jzYAOz';

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

server.get('/lyft', function (req, res) {
    var query = req.query().split('&')

    var code = query[0].split('=')[1]
    res.send('Hello World!')
})

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector);


var model = 'https://api.projectoxford.ai/luis/v1/application?id=16572d27-33f9-4dfe-94cf-9b0d4baff598&subscription-key=136451a11017458d9e59cbfe7293fb4f';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', dialog);

// Add intent handlers
dialog.matches('StartRide', [
    function (session) {
        // Resolve and store any entities passed from LUIS.
        // var appliance = builder.EntityRecognizer.findEntity(args.entities, 'Appliance');
        // session.dialogData.appliance = appliance;

        // Prompt for title
        builder.Prompts.text(session, 'Sure. Where to do you want to go?');

    },
    function (session, results) {
        if (!cancel(session, results)){
            session.dialogData.input = results.response;
            getAddress(String(results.response), function(results, status) {
                // use the return value here instead of like a regular (non-evented) return value

                if (status == "OK"){
                    session.send("Got the destination as " + results[0]);
                    session.send("Press ok to accept and anything else to abort.");
                    builder.Prompts.text(session, 'Is this the destination correct?');
                }
                else{
                    session.endDialog('start over...');
                }
            });
        }
    },
    function (session, results) {
        if (!cancel(session, results)) {
            var confirmation = String(results.response)
            if (confirmation.toUpperCase() == "OK") {
                session.dialogData.destination = session.dialogData.input;
                session.send("OK. Setting the destination as " + session.dialogData.destination);
                builder.Prompts.text(session, "OK. Where should I set the pick up point?");
                //builder.Prompts.text(session, "Should I go ahead and book the ride");
            }
            else{
                session.endDialog('start over...');
            }

        }
    },
    function (session, results) {
        if (!cancel(session, results)){
            session.dialogData.input = results.response;
            getAddress(String(results.response), function(results, status) {
                // use the return value here instead of like a regular (non-evented) return value

                if (status == "OK"){
                    session.send("Got the pickup point as " + results[0]);
                    session.send("Press ok to accept and anything else to abort.");
                    builder.Prompts.text(session, 'Is this the pickup correct?');
                }
                else{
                    session.endDialog('start over...');
                }
            });
        }
    },
    function (session, results) {
        if (!cancel(session, results)) {
            var confirmation = String(results.response)
            if (confirmation.toUpperCase() == "OK") {
                session.dialogData.source = session.dialogData.input;
                session.send("OK. Setting the pickup point as " + session.dialogData.source);
                builder.Prompts.text(session, "Should I go ahead and book the ride");
            }
            else{
                session.endDialog('start over...');
            }

        }
    },
    function (session, results) {
        if (!cancel(session, results)) {
            session.dialogData.confirmation = results.response;
            try {
                var confirmation = String(results.response)
                if (confirmation.toUpperCase() == "OK") {
                    session.endDialog("Great. I am booking a ride for you.");
                }
                else {
                    builder.Prompts.text(session, "Oh. Should I cancel the ride. Say OK to book or anything other than that to cancel the request");
                }
            }
            catch (err) {
                builder.Prompts.text(session, "Oh. Should I cancel the ride. Say OK to book or anything other than that to cancel the request");
            }
        }
    },
    function (session, results, next) {
        if (!cancel(session, results)) {
            session.dialogData.confirmation = results.response;
            if (results.response == "OK") {
                session.endDialog("Great. I am booking a ride for you.");
            }
            else {
                session.endDialog("OK. Cancelling the request.");
            }
        }
    }
]);

dialog.matches('AddLyft', [
    function (session) {
        getLyftAccess(session);

    },
    function (session) {
        builder.Prompts.text(session, "Please give the access code for us to add your lyft account");
    },
    function (session) {
        session.dialogData.access_code = results.response;

        builder.Prompts.text(session, "Please give the access code for us to add your lyft account");
    }
]);

function getLyft(){
    headers = {
        'Content-Type': 'application/json',
    }

    data = '{"grant_type": "authorization_code", "code": "<authorization_code>"}'

    requests.post('http://This', headers=headers, data=data, auth=('', '<client_secret>'))

}
function getLyftAccess(session) {

    var url = "https://api.lyft.com/oauth/authorize?client_id=FByyis93GEZR&scope=public%20profile%20rides.read%20rides.request%20offline&state=a&response_type=code"

    session.send("You need to add the lyft account");
    session.send(url)
}

function getAddress(query, callback){
    request('https://maps.googleapis.com/maps/api/geocode/json?address=' + query + '&key=AIzaSyA3NVLELHjx96HuG6XlCHWPbzzzf6BBS3s', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body)

            var status = json['status'];
            var results = [];
            for (a in json.results){
                results.push(json.results[a].formatted_address);
            }
            callback(results, status)
        }
    })
}
function cancel(session, results) {
    if (String(results.response).toLowerCase() == 'cancel'){
        session.endDialog("OK. Cancelling the request.");
        return true
    }
    return false
}
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only book rides."));