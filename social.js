// class Social {
//     fb() {
//         return 'fb';
//     }
// }
//
// module.exports = Social;

// WORKING
// exports.hello = function() {
//     return "Hello";
// }


// WORKING
// module.exports.add = (a,b) => a+b
class Social {
    fb(){



        var a = '<html><body><script>\n' +
        '  window.fbAsyncInit = function() {\n' +
        '    FB.init({\n' +
        '      appId            : 266956353815192,\n' +
        '      autoLogAppEvents : true,\n' +
        '      xfbml            : true,\n' +
        '      version          : \'v2.10\'\n' +
        '    });\n' +
        '    FB.AppEvents.logPageView();\n' +
        '  };\n' +
        '\n' +
        '  (function(d, s, id){\n' +
        '     var js, fjs = d.getElementsByTagName(s)[0];\n' +
        '     if (d.getElementById(id)) {return;}\n' +
        '     js = d.createElement(s); js.id = id;\n' +
        '     js.src = "//connect.facebook.net/en_US/sdk.js";\n' +
        '     fjs.parentNode.insertBefore(js, fjs);\n' +
        '   }(document, \'script\', \'facebook-jssdk\'));\n' +
        '</script>\n' +

        '<div id="shareBtn" class="btn btn-success clearfix">Share Dialog</div>' +

        "\n" +
        "        <p>The Share Dialog enables you to share links to a person's profile without them having to use Facebook Login. <a href=\"https://developers.facebook.com/docs/sharing/reference/share-dialog\">Read our Share Dialog guide</a> to learn more about how it works.</p>\n" +
        "\n" +
        "        <script>\n" +
        "        document.getElementById('shareBtn').onclick = function() {\n" +
        "                FB.ui({\n" +
        "                    display: 'popup',\n" +
        "                    method: 'share',\n" +
        "                    href: 'http://instagram.com/know.india',\n" +
        "                }, function(response){});\n" +
        "            }\n" +
        "            </script></body></html>";

        return a;

    }

}

module.exports = new Social();