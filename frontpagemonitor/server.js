var express = require('express');
var client = require('twilio')('account id', 'secret');
var http = require('http');
var app = express();

var currentPlace = -1;
var currentViews = -1;
var nextMilestone = -1;

var redditFrontPage = {
  host: "www.reddit.com",
  port: 80,
  path: '/.json',
  method: 'GET'
};

var youtubeVideoAPILink = {
  host: "gdata.youtube.com",
  port: 80,
  path: '/feeds/api/videos/GXTLVQ1eiik?v=2&alt=json',
  method: 'GET'
};

function sendMessage(number, msg) {
  client.sendMessage({
    to: number, 
    from: '+12014398113',
    body: msg
  }, function(err, responseData) {
    // bleh
  });
}

setInterval(checkYoutube, 1000 * 120)

function checkYoutube() {
  var req = http.request(youtubeVideoAPILink, function(res) {
    var data = ""
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {
        var json = JSON.parse(data);
        var entry = json["entry"];
        var views = entry["yt$statistics"]["viewCount"];
        if (views > nextMilestone && nextMilestone != -1) {
          console.log("Passed the milestone of " + nextMilestone + ".  (" + (new Date()) + ")");

          sendMessage("+1blahblahblah", "The Julian video just passed " + nextMilestone + " views. (" + views + ")");

          nextMilestone = nextMilestone += 10000;
          console.log("Next milestone: " + nextMilestone);
        }
        if (views != currentViews && currentViews != -1) {
          console.log("View count updated. Now at " + views);
        }
        currentViews = views;
        if (nextMilestone == -1) {
          nextMilestone = Math.ceil(views / 100000) * 100000;
          console.log("Lets get started... Setting the milestone to " + nextMilestone);
        }
    })
  });
  req.end();
}

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

checkYoutube();
app.listen(8080);
