var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var http = require('http');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var MICROSOFT_APP_ID = '99ffde50-d6f9-4853-b744-c251e7255df0';
var MICROSOFT_APP_PASSWORD = 'XOjg6LtgkryrBgBBz5knuJr';
var LYFT_CLIENT_ID = 'FByyis93GEZR';
var LYFT_CLIENT_SECRET = 'SANDBOX-FZXmjNuivSq8cIqRCVQgg5SST8jzYAOz';

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

server.get('/link', function (req, res) {
    data = {
        "grant_type": "authorization_code",
        "code":"sxWDUZePueytFnd5"
    };

    var auth = new Buffer(LYFT_CLIENT_ID + ':' + LYFT_CLIENT_SECRET).toString('base64');

    headers = {
        'Content-type': "application/json",
        'Authorization': 'Basic ' + auth
    };

    // Configure the request
    var options = {
        url: 'https://api.lyft.com/oauth/token',
        method: 'POST',
        headers: headers,
        form: data,
        json:true

    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body)
        }
        if (body.error == 'invalid_grant'){

        }

    })
})

server.get('/get', function (req, res) {
    getUser()
})

server.get('/book', function (req, res) {

    /*
    curl -X POST -H "Content-Type: application/json" \
     --user "<client_id>:<client_secret>" \
     -d '{"grant_type": "authorization_code", "code": "<authorization_code>"}' \
     'https://api.lyft.com/oauth/token'


     curl -X POST -H "Authorization: Bearer <access_token> " \
     -H "Content-Type: application/json" \
     -d '' \
     'https://api.lyft.com/v1/rides'
     */
    data = {
        "ride_type" : "lyft",
        "origin" : {
            "lat" : 37.77663,
            "lng" : -122.39227
        },
        "destination" : {
            "lat" : 37.771,
            "lng" : -122.39123,
            "address" : "Mission Bay Boulevard North"
        }
    };

    var auth = new Buffer("WqmG5ZFDEOcpITyiIKQWrpyVLO8zmHCnx7y4qsadBC8MQI+zeJYaY59BKSWK1UlDVd1XvaqUrNdyjJmx3r5S9TWf2aWTFRrxgT5WHzcCRUystMYdHswCIOE=").toString('base64');

    headers = {
        'Content-type': "application/json",
        'Authorization': 'Basic ' + auth
    };

    // Configure the request
    var options = {
        url: 'https://api.lyft.com/oauth/token',
        method: 'POST',
        headers: headers,
        form: data,
        json:true

    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body)
        }
        if (body.error == 'invalid_grant'){

        }

    })
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
                    session.dialogData.location = results[1]
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
                session.dialogData.destinationAddress = session.dialogData.input;
                session.dialogData.destination = session.dialogData.location;
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
                    session.dialogData.location = results[1]
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
                session.dialogData.sourceAddress = session.dialogData.input;
                session.dialogData.source = session.dialogData.location;
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
        session.send(session, "We need the access code for us to add your lyft account");
        builder.Prompts.text(session, "Do you have an acces token from Lyft");
    },
    function (session,results) {
        if (!cancel(session, results)) {
            const ans = results.response

            if (String(ans)[0].toLowerCase() == 'y') {
                builder.Prompts.text(session, "Please enter the acces token from Lyft");
            }
            else {
                session.endDialog('We need the token. Please start over...');
            }
        }
    },
    function (session,results) {
        if (!cancel(session, results)) {
            session.dialogData.access_code = results.response;

            getLyft(session, function(results, status) {
                if (results == 'OK'){
                    session.endDialog("Great! Added your account...")
                }
                else{
                    session.endDialog("Invalid/Expired Access Code");
                }
            });
        }
    }
]);


var flatfile = require('flat-file-db');
var db = flatfile('my.db');

function addUser(access_token, refersh_token){
    db.on('open', function() {
        db.put('manish', {
            access_token: access_token,
            refresh_token: refersh_token
        });
        console.log(db.get('manish'))
    });
}

function getUser() {
    var db = flatfile.sync('my.db');
    console.log(db.get('manish'))
}

function bookRide() {

}

function getLyft(session, callback){
    try{

        data = {
            "grant_type": "authorization_code",
            "code": session.dialogData.access_code
        }

        var auth = new Buffer(LYFT_CLIENT_ID + ':' + LYFT_CLIENT_SECRET).toString('base64');

        headers = {
            'Content-type': "application/json",
            'Authorization': 'Basic ' + auth
        };

        // Configure the request
        var options = {
            url: 'https://api.lyft.com/oauth/token',
            method: 'POST',
            headers: headers,
            form: data,
            json:true

        };

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body

                db.addUser(body.access_token, body.refresh_token);
                callback('OK', message = {
                    'access_token': body.access_token,
                    'refresh_token': body.refresh_token,
                });
            }
            if (body.error == 'invalid_grant'){
                callback('error', message = {
                    'message': body.error_description
                });
            }

        })
    }
    catch(err){
        session.endDialog('Something went wrong. Please try again.')
    }

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
                const loc = json.results[a].geometry.location
                results.push(loc.lat + ',' + loc.lng);
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