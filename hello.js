var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var http = require('http');
var express = require('express');
var app = express();
var social = require('./social.js');  // This will load your fitness module

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 5000, function () {
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

server.get('/fb', function (req, res) {

    const fb = social.fb();

    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(fb);
    res.end();


})
server.get('/lyft', function (req, res) {
    var query = req.query().split('&')

    var code = query[0].split('=')[1]
    // res.send('Hello World!')

    getLyft(code, function(results, status) {

        var info = '';
        if (results == 'OK'){
            //session.endDialog("Great! Added your account...")
            //res.send("Great! Added your account...")
            info = "Great! You are all set to book a ride now..";
        }
        else{
            "Great! Added your account..."
            info = "Invalid/Expired Access Code";
            // res.send();
            //session.endDialog("Invalid/Expired Access Code");
        }

        var body = '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head>\n' +
            '    <meta charset="utf-8">\n' +
            '    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
            '    <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
            '    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->\n' +
            '    <title>Bootstrap 101 Template</title>\n' +
            '\n' +
            '\n' +
            '    <!-- Latest compiled and minified CSS -->\n' +
            '    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\n' +
            '\n' +
            '    <!-- Optional theme -->\n' +
            '    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">\n' +
            '\n' +
            '    <!-- Latest compiled and minified JavaScript -->\n' +
            '    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>\n' +
            '    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->\n' +
            '    <!-- WARNING: Respond.js doesn\'t work if you view the page via file:// -->\n' +
            '    <!--[if lt IE 9]>\n' +
            '    <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>\n' +
            '    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>\n' +
            '    <![endif]-->\n' +
            '</head>\n' +
            '<body>\n' +
            '<div class="jumbotron" style="text-align: center">\n' +
            '    <h1 >Ride Bot</h1>\n' +
            '    <p> ' + info + '</p>\n' +
            '    <p>\n' +
            '        <a class="btn btn-primary btn-lg" href="#" role="button" onclick="window.close();">Learn more</a>\n' +
            '    </p>\n' +
            '</div>\n' +
            '\n' +
            '<!-- jQuery (necessary for Bootstrap\'s JavaScript plugins) -->\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>\n' +
            '<!-- Include all compiled plugins (below), or include individual files as needed -->\n' +
            '<script src="js/bootstrap.min.js"></script>\n' +
            '</body>\n' +
            '</html>';
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/html'
        });
        res.write(body);
        res.end();
    });
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

server.get('/estimate', function (req, res) {
    getEstimate();
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
                    session.send("Say OK to accept or anything else to cancel.");
                    builder.Prompts.text(session, 'Is the destination correct?');
                }
                else{
                    session.endDialog('Starting over...');
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
                builder.Prompts.text(session, "OK. Where should I set the pickup point?");
                //builder.Prompts.text(session, "Should I go ahead and book the ride");
            }
            else{
                session.endDialog('Starting over...');
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
                    session.send("Say OK to accept or anything else to cancel.");
                    builder.Prompts.text(session, 'Is the pickup point correct?');
                }
                else{
                    session.endDialog('Starting over...');
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
                session.send("Say 'quit' to cancel the ride or choose the following to select the ride type.")
                builder.Prompts.text(session, "Please select one of the ride types to book - Lyft Line, Lyft, Lyft Plus, Lyft Premier, Lyft Lux or Lyft Lux SUV.");
            }
            else{
                session.endDialog('Starting over...');
            }

        }
    },
    function (session, results) {
        if (!cancel(session, results)) {
            var confirmation = String(results.response)

            switch (confirmation.toLowerCase()){
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

            // getEstimate(session, function(){
            //
            // });
            bookLyft(session, function(status) {
                if (status == 'done'){
                    session.send("Great. I am booking a ride for you.")
                    session.endDialog("Say 'status' to learn more about your ride.")

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
                        session.send("Great. I am booking a ride for you.")
                        session.endDialog("Say 'status' to learn more about your ride.")

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
        session.endDialog('We need the token. Please start over...');
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
            session.endDialog('Your ride has been cancelled.');
        })

    }
]);

var flatfile = require('flat-file-db');
var db = flatfile('my.db');

function addUser(access_token, refresh_token){
    db.on('open', function() {
        db.put('manish', {
            access_token: access_token,
            refresh_token: refresh_token
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

function getEstimate(session, callback){

    var source, destination;
    if (session == null){
        source = "34.010891,-118.291892"
        destination = "34.025963, -118.284229"

        headers = {
            'Content-type': "application/json",
            'Authorization': 'Bearer +fDKPbE7Vrsg3jIpDtoXhwpxonK2cvWcy0sPf53EcNroLPK1vnblQI5fIARbZ8w51Yuv5SIb6ISFMimeUkBU6bUx1VPV+sK4K5cK1HRA0mFu6MmnOVsSNHg='
        };
    }
    else{
        source = session.dialogData.source.split(',')
        destination = session.dialogData.destination.split(',')

        headers = {
            'Content-type': "application/json",
            'Authorization': 'Bearer ' + USER_TOKEN
        };
    }
    // data = {
    //     "ride_type" : CLASS,
    //     "origin.lat" : parseFloat(source[0]),
    //     "origin.lng" : parseFloat(source[1]),
    //
    //     "destination" : {
    //         "lat" : parseFloat(destination[0]),
    //         "lng" : parseFloat(destination[1]),
    //         "address" : session.dialogData.destinationAddress
    //     }
    // };

    // var auth = new Buffer(USER_TOKEN).toString('base64');



    // Configure the request
    var options = {
        url: 'https://api.lyft.com/v1/cost?start_lat=' + source[0] + '&start_lng=' + source[1] +
        '&end_lat=' + destination[0] + '&end_lng=' + destination[1],
        method: 'GET',
        headers: headers,
        // form: data,
        json: true

    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
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
                    session.send('Your driver, '+ driver.first_name + ', is coming to pick you up in ' + (origin.eta_seconds / 60) + ' minutes.');
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
            session.send('No rides currently available.');
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

function getLyft(code, callback){
    try{

        data = {
            "grant_type": "authorization_code",
            "code": code
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

    session.send("You need to add your Lyft account.");
    session.send(url)
    session.endDialog("Add your account to link the lyft account with us");
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