var express = require('express');
var client = require('twilio')('other key', 'api key');
var http = require('http');
var app = express();
var currentPlace = -1

var redditFrontPage = {
  host: "www.reddit.com",
  port: 80,
  path: '/.json',
  method: 'GET'
};

function sendMessage(number, msg) {
  client.sendMessage({
    to: number, 
    from: '+number',
    body: msg
  }, function(err, responseData) {
  });
}

setInterval(checkFrontPage, 1000 * 10)

function checkFrontPage() {
  var req = http.request(redditFrontPage, function(res) {
    var data = ""
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {

        var json = JSON.parse(data);
        var array = json["data"]["children"];
        if (data.indexOf("fokerpace2000") == -1) {
          console.log("Booted off the front page.  Womp womp womp (at " + new Date() + ")");
          process.exit(code=0);
        }

        for (var i = 0; i < array.length; i++) {
          if (array[i]["data"]["author"] === "fokerpace2000") {
            if (i < currentPlace) {
              console.log("POST MOVED UP! Now #" + (i + 1));
              sendMessage("+1blahblahblah", "Reddit Alert: The Julian post moved up on the front page.  Now #" + (i + 1))
            } else if (i > currentPlace) {
              if (currentPlace != -1)
                console.log("POST MOVED DOWN! Now #" + (i + 1));
            }
            currentPlace = i
          }
        }


    })
  });
  req.end();
}

checkFrontPage();
app.listen(8080);
