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

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

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
            session.dialogData.destination = results.response;
            session.send("OK. Setting the destination as " + session.dialogData.destination);
            builder.Prompts.text(session, 'Where should the starting point be?');
        }
    },
    function (session, results) {
        if (!cancel(session, results)) {
            session.dialogData.source = results.response;
            session.send("OK. Setting the starting point as " + session.dialogData.source);
            builder.Prompts.text(session, "Should I go ahead and book the ride");
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

function cancel(session, results) {
    if (String(results.response).toLowerCase() == 'cancel'){
        session.endDialog("OK. Cancelling the request.");
        return true
    }
    return false
}
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only book rides."));