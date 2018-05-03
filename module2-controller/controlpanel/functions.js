var http = require('http');
var request = require('request');
var fs = require("fs");
var OAuth = require('oauth');
var datum = require('datumbox').factory("247037fb0d191ae468ed13fa7e02ab50");
var FacebookSearch = require('facebook-search');
var fb = new FacebookSearch('363555700421168', 'ed9ac951c0f286562b521a92ee3686b1');
var rottenAPI = require("rotten-tomatoes-api")('j6ahmr555pen2ybkb7nsxbb9');
	
	//twitter configuration
	var config = JSON.parse(fs.readFileSync('appconfig/config.json'));
	var twitter = config.twitter;
	var oauth = new OAuth.OAuth(
	      twitter.requestTokenLink,
	      twitter.accessTokenLink,
	      twitter.consumerKey,
	      twitter.consumerSecret,
	      '1.0A',
	      null,
	      'HMAC-SHA1'
	    );

function getTweetsByREST(url, callback) {
	oauth.get(url,
    	twitter.accessToken,
    	twitter.accessSecret,
    	function (e, data, res){
        	if (e) return console.error(e);   
        	var data = JSON.parse(data); 
        	callback(data);
    	});    
}

/*function getSentiment(doc, callback) {
        		datum.twitterSentimentAnalysis(doc, function(err, result) {
			    	if ( err ) return console.log(err);
			    	callback(result);
			    	
				});      	
}*/

function calcSentiment(doc, cb) {

	request.post(
    'http://127.0.0.1:8000/api',
    { form: { text: doc } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(body);
        }
    }
);

}

function getFacebookPosts(searchQ, callback) {
	fb.search(searchQ, function(err,res) {

		if ( err ) return console.log(err);
		callback(res);

		fb.next(function(err, res) {
		    if ( err ) return console.log(err);
			callback(res);
		});

	});
}

//from rooten tomatoes
function getMovReviews(movie, callback) {
	rottenAPI.movieSearch({q:movie, page_limit:1}, function(err,res){
		if (err) console.log(err);

		//select the first result and find its reviews
		var movie_id = res.movies[0].id;
		rottenAPI.movieReviews({id:movie_id, review_type:"top_critic", page_limit:5}, function(err,res){
		if (err) console.log(err);
		callback(res);
	});
		
	});

}

module.exports.getTweetsByREST = getTweetsByREST;
//module.exports.getSentiment = getSentiment;
module.exports.getFacebookPosts = getFacebookPosts;
module.exports.getMovReviews = getMovReviews;
module.exports.calcSentiment = calcSentiment;