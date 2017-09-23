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