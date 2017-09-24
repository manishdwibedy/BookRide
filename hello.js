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
var LYFT_CLIENT_SECRET = 'FZXmjNuivSq8cIqRCVQgg5SST8jzYAOz';

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

USER_TOKEN = "";
REFRESH_TOKEN = ""
RIDE_ID = ""
SOURCE = ""
DESTINATION = ""
CLASS = ""
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

server.get('/refresh', function (req, res) {
    refresh();
})

function refresh() {
    data = {
        "grant_type": "refresh_token",
        "refresh_token":REFRESH_TOKEN
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
        USER_TOKEN = body.access_token
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body)
        }
        if (body.error == 'invalid_grant'){

        }

    })
}
server.get('/book', function (req, res) {
    data = {
        "ride_type" : "lyft_line",
        "origin.lat" : 37.771,
        "origin.lng" : -122.39423,

        "destination" : {
            "lat" : 37.771,
            "lng" : -122.39123,
            "address" : "Mission Bay Boulevard North"
        }
    };

    // var auth = new Buffer(USER_TOKEN).toString('base64');

    headers = {
        'Content-type': "application/json",
        'Authorization': 'Bearer ' + USER_TOKEN
    };

    // Configure the request
    var options = {
        url: 'https://api.lyft.com/v1/rides',
        method: 'POST',
        headers: headers,
        form: data,
        json: true

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
        // getUser();
        refresh()
        // Prompt for title

        if (RIDE_ID.length > 0){
            session.endDialog();
        }
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
                // session.send("OK. Setting the destination as " + session.dialogData.destinationAddress);
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
                session.send("Please 'quit' to cancel the ride or chooose the following to select the ride type.")
                builder.Prompts.text(session, "Please select one of the class to book - Lyft Line, Lyft, Lyft Plus, Lyft Premier, Lyft Lux or Lyft Lux SUV.");
            }
            else{
                session.endDialog('start over...');
            }

        }
    },
    function (session, results) {
        if (!cancel(session, results)) {
            var confirmation = String(results.response)

            switch (confirmation){
                case 'line':
                    CLASS = "lyft_line"
                    break
                case 'lyft':
                    CLASS = "lyft"
                    break
                case 'plus':
                    CLASS = "lyft_plus"
                    break
                case 'premier':
                    CLASS = "lyft_premier"
                    break
                case 'lux':
                    CLASS = "lyft_lux"
                    break
                case 'luxsuv':
                    CLASS = "lyft_luxsuv"
                    break
                default:
                    CLASS = 'lyft'
            }

            bookLyft(session, function(status) {
                if (status == 'done'){
                    session.send("Type 'status' to get the status of your ride.");
                    session.endDialog("Great. I am booking a ride for you.");

                    setTimeout(function(){
                        getLyftDetail(session, function (ride) {
                            if(ride == "OK"){

                            }
                            session.endDialog();
                        })
                    }, 1000);
                }
                else{
                    session.endDialog("Error occurred");
                }

            });
        }
    },
    function (session, results, next) {
        if (!cancel(session, results)) {
            session.dialogData.confirmation = results.response;
            if (String(results.response).toLowerCase() == "OK") {
                bookLyft(session, function(status) {
                    if (status == 'done'){
                        session.send("Type 'status' to get the status of your ride.");
                        session.endDialog("Great. I am booking a ride for you.");

                        setTimeout(function(){
                            getLyftDetail(session, function (ride) {
                                if(ride == "OK"){

                                }
                                session.endDialog();
                            })
                        }, 1000);
                    }
                    else{
                        session.endDialog("Error occurred");
                    }
                });



            }
            else {
                session.endDialog("OK. Cancelling the request.");
            }
        }
    },
]);

// Add intent handlers
dialog.matches('Status', [
    function (session) {
        // Resolve and store any entities passed from LUIS.
        // var appliance = builder.EntityRecognizer.findEntity(args.entities, 'Appliance');
        // session.dialogData.appliance = appliance;
        // getUser();
        getLyftDetail(session, function(status) {

        })

    }
]);

dialog.matches('AddLyft', [
    function (session) {
        getLyftAccess(session);
        session.send(session, "We need the access code for us to add your lyft account");
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

dialog.matches('status', [
    function (session) {
        getLyftDetail(session);
    }
]);

dialog.matches('cancel', [
    function (session) {
        cancelLyft(session, function() {
            session.endDialog('Your ride has been cancel');
        })

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
    user = db.get('manish')

    USER_TOKEN = user['access_token']
    REFRESH_TOKEN = user['refresh_token']
}

function bookRide() {

}

function bookLyft(session, callback){

    const source = session.dialogData.source.split(',')
    const destination = session.dialogData.destination.split(',')

    data = {
        "ride_type" : CLASS,
        "origin.lat" : parseFloat(source[0]),
        "origin.lng" : parseFloat(source[1]),

        "destination" : {
            "lat" : parseFloat(destination[0]),
            "lng" : parseFloat(destination[1]),
            "address" : session.dialogData.destinationAddress
        }
    };

    // var auth = new Buffer(USER_TOKEN).toString('base64');

    headers = {
        'Content-type': "application/json",
        'Authorization': 'Bearer ' + USER_TOKEN
    };

    // Configure the request
    var options = {
        url: 'https://api.lyft.com/v1/rides',
        method: 'POST',
        headers: headers,
        form: data,
        json: true

    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            // Print out the response body
            RIDE_ID = body.ride_id
            callback('done')
        }
        if (body.error == 'invalid_grant'){
            callback('error')
        }
    })
}

function getLyftDetail(session, callback){
    try{
        headers = {
            'Content-type': "application/json",
            'Authorization': 'Bearer ' + USER_TOKEN
        };


        // Configure the request
        var options = {
            url: 'https://api.lyft.com/v1/rides/' + RIDE_ID,
            method: 'GET',
            headers: headers,
            form: data,
            json:true

        };

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                const driver = body.driver;
                const vehicle = body.vehicle;
                const origin = body.origin;


                if (driver != null && vehicle != null && origin != null){
                    session.send('Your driver '+ driver.first_name + ' is coming to pick up in' + (origin.eta_seconds / 60) + ' minutes.');
                    session.send('You can contact the driver at ' + driver.phone_number);
                    callback('OK')
                }

            }
            if (body.error == 'invalid_grant'){
                callback('error');
            }

        })
    }
    catch(err){
        session.endDialog('Something went wrong. Please try again.')
    }

}

function cancelLyft(session, callback){
    try{
        headers = {
            'Content-type': "application/json",
            'Authorization': 'Bearer ' + USER_TOKEN
        };

        if (RIDE_ID.length == 0){
            session.send('No current ride available');
        }
        else{
            // Configure the request
            var options = {
                url: 'https://api.lyft.com/v1/rides/' + RIDE_ID + '/cancel',
                method: 'POST',
                headers: headers,
                form: data,
                json:true

            };

            // Start the request
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 204) {
                    // Print out the response body
                    RIDE_ID = "";
                    callback('OK')
                }
            })
        }

    }
    catch(err){
        session.endDialog('Something went wrong. Please try again.')
    }

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

                addUser(body.access_token, body.refresh_token);

                USER_TOKEN = body.access_token
                REFRESH_TOKEN = body.refresh_token
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
    builder.Prompts.text(session, "Do you have an acces token from Lyft");
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
    if (String(results.response).toLowerCase() == 'quit'){
        session.endDialog("OK. Cancelling the request.");
        return true
    }
    return false
}

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only book rides."));