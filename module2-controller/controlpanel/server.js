// set up ======================================================================
var express  = require('express'),
	fs = require('fs');
var app = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var logfmt = require("logfmt");
app.use(logfmt.requestLogger());
//var util = require('util');
var f = require("./functions.js");


// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = 'mongodb://localhost/opinionmining';

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
});


// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Connected to: ' + uristring);
  }
});

// define model ================================================================
var Topic = mongoose.model('Topic', {
	text : String
});

var Record = mongoose.model('Record', {
	tag : String,
	polarity: Number,
	message: String,
	noun_phrases: [String],
	subjectivity: Number
});

// routes ======================================================================

/*searches for tweets on twitter*/
	app.post('/api/tweets', function(req, res) {
		var topic = req.body.keyword;
		f.getTweetsByREST('https://api.twitter.com/1.1/search/tweets.json?lang=en&q='+topic, function(data) {

		  data.statuses.forEach(function(tweet) {
		  	 //console.log("Tweet : "+tweet.text);

		        f.calcSentiment(tweet.text, function(result) {
		          //console.log("Tweet : "+tweet.text);
		          console.log(result);
		          rec = result[0];
		          Record.create({tag: topic, polarity: rec.polarity, message: rec.stripped, noun_phrases: rec.noun_phrases, subjectivity: rec.subjectivity}, function(err, rec) {
					if (err) res.send(err);
					});
		        });
		    });
		  res.json('Tweet count :'+data.statuses.length);
		});

	});

	/*searches for posts on Facebook*/

	app.post('/api/fbposts', function(req, res) {

		var topic = req.body.keyword;
		f.getFacebookPosts({type:'post', q: topic}, function(result) {
			for (item in result) {
				var msg = result[item].message;
				//console.log(result[item].from.name+" : "+msg);

				f.calcSentiment(msg, function(result) {
		          //console.log("Post : "+msg);
		          console.log(result);
		          rec = result[0];
		          Record.create({tag: msg, polarity: rec.polarity, message: rec.stripped, noun_phrases: rec.noun_phrases, subjectivity: rec.subjectivity}, function(err, rec) {
					if (err) res.send(err);
					});
		        });
			}


		});
		res.json('Posts sent');
	});

	/*searches for reviews on IMDB*/

	app.post('/api/imdbreviews', function(req, res) {

		var topic = req.body.keyword;
		f.getMovReviews(topic, function(result) {

		var reviews = result.reviews;
			for (item in reviews) {
				console.log(reviews[item].critic+" : "+reviews[item].quote);
				var msg = reviews[item].quote;
				f.calcSentiment(msg, function(result) {
		          //console.log("Post : "+msg);
		          console.log(result);
		          rec = result[0];
		          Record.create({tag: msg, polarity: rec.polarity, message: rec.stripped, noun_phrases: rec.noun_phrases, subjectivity: rec.subjectivity}, function(err, rec) {
					if (err) res.send(err);
					});
		        });
			}
			res.json('Reviews count : '+reviews.length);
		});
	});

	// get all topics
	app.get('/api/topics', function(req, res) {
		Topic.find(function(err, topics) {
			if (err) res.send(err)
			res.json(topics); // return all topics in JSON format
		});
	});

	//get count of records of a tag
	app.get('/api/records', function(req, res) {
		Record.find({tag: req.params.tag},function(err, records) {
			if (err) res.send(err)
			res.json(records.length); // return all topics in JSON format
		});
	});

	// get topic by id
	app.get('/api/topics/:topic_id', function(req, res) {

		Topic.find({
			_id : req.params.topic_id
		}, function(err, topic) {

			if (err) res.send(err);
			res.json(topic); // return all topics in JSON format
		});
	});

	// create topic and send back all topics after creation
	app.post('/api/topics', function(req, res) {

		Topic.create({
			text : req.body.keyword
		}, function(err, topic) {
			if (err) res.send(err);

			Topic.find(function(err, topics) {
				if (err) res.send(err)
				res.json(topics);
			});
		});

	});


	// delete a topic
	app.delete('/api/topics/:topic_id', function(req, res) {
		Topic.remove({
			_id : req.params.topic_id
		}, function(err, topic) {
			if (err) res.send(err);

			Topic.find(function(err, topics) {
				if (err)
					res.send(err)
				res.json(topics);
			});
		});
	});

	// application -------------------------------------------------------------
	app.get('/viz', function(req, res) {
		res.sendfile('./public/vizualisation.html'); 
	});

	app.get('/viz/vizdata', function(req, res) {
		res.json({
 "name": "flare",
 "children": [
  {
   "name": "analytics",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "size": 3938},
      {"name": "CommunityStructure", "size": 3812},
      {"name": "HierarchicalCluster", "size": 6714},
      {"name": "MergeEdge", "size": 743}
     ]
    }]}]}); 
	});

	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); 
	});




// listen (start app with node server.js) ======================================
var port = Number(process.env.PORT || 8080);
app.listen(port, function() {
  console.log("Listening on " + port);
});

