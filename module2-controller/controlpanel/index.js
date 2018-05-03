
var f = require("./functions.js");
//var util = require('util');


//search tweets on twitter
f.getTweetsByREST('https://api.twitter.com/1.1/search/tweets.json?q=ronaldo&lang=en', function(data) {

  data.statuses.forEach(function(tweet) {
        f.getSentiment(tweet, function(result) {
          console.log("Tweet : "+tweet.text);
          console.log("Result : "+result);
        });
    });
});



//search facebook posts
f.getFacebookPosts({type:'post', q: 'beer'}, function(result) {
	for (item in result) {
		console.log(result[item].from.name+" : "+result[item].message);
	}
	 
});


//Search the movie, 
f.getMovReviews("Her", function(result) {

		var reviews = result.reviews;
		for (item in reviews) {
			console.log(reviews[item].critic+" : "+reviews[item].quote);
		}

});


