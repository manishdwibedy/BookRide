/*-----------------------------------------------------------------------------
A simple "Hello World" bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');


////
var ngrok = '74249d3f';
URL = 'http://' + ngrok + '.ngrok.io/try';
////
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: '348a27a1-84b2-4533-a984-fa2cb9d5898a',
    appPassword: 'NJbPtFQ6DFixkMasdFe7ijf'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var model = 'https://api.projectoxford.ai/luis/v1/application?id=10c76d78-ac03-4030-b196-4a24ed51ceac&subscription-key=136451a11017458d9e59cbfe7293fb4f';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', dialog);

// Add intent handlers
dialog.matches('TurnOn', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var appliance = builder.EntityRecognizer.findEntity(args.entities, 'Appliance');
        session.dialogData.appliance = appliance;

        // Prompt for title
        if (!appliance) {
            builder.Prompts.text(session, 'Which appliance do you want me to turn on?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var confirmation_msg = "Turning on the ";
        var appliance = session.dialogData.appliance;
        if (results.response) {
            appliance = results.response;
            confirmation_msg += appliance
        }
        else{
            confirmation_msg += appliance.entity;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (!appliance) {
            builder.Prompts.text(session, 'Which appliance do you want me to turn on?');
        } else {


            if (session.userData[appliance.entity] == 'ON'){
                session.send("It's already on.");
            }
            else{
                var propertiesObject = {'number':1};

                request({url:URL, qs:propertiesObject}, function(err, response, body) {
                    if(err) { console.log(err); return; }
                    console.log("Get response: " + response.statusCode);
                });
                session.userData[appliance.entity] = "ON";
                session.send(confirmation_msg);
            }
        }
    }
]);

dialog.matches('TurnOff', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var appliance = builder.EntityRecognizer.findEntity(args.entities, 'Appliance');
        session.dialogData.appliance = appliance;

        // Prompt for title
        if (!appliance) {
            builder.Prompts.text(session, 'Which appliance do you want me to turn off?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var confirmation_msg = "Turning off the ";
        var appliance = session.dialogData.appliance;

        if (results.response) {
            appliance = results.response;
            confirmation_msg += appliance
        }
        else{
            confirmation_msg += appliance.entity;
        }


        // Prompt for time (title will be blank if the user said cancel)
        if (!appliance) {
            builder.Prompts.text(session, 'Which appliance do you want me to turn on?');
        } else {
            if (session.userData[appliance.entity] == 'OFF'){
                session.send("It's already off.")
            }
            else{
                var propertiesObject = {'number':2};
                request({url:URL, qs:propertiesObject}, function(err, response, body) {
                    if(err) { console.log(err); return; }
                    console.log("Get response: " + response.statusCode);
                });
                session.userData[appliance.entity] = "OFF"
                session.send(confirmation_msg);
            }


        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only create & delete alarms."));