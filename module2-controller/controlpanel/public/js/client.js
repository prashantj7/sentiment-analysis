var dashboard = angular.module('opinionmining-dashboard', []);

function mainController($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all topics and show them
	$http.get('/api/topics')
		.success(function(data) {
			$scope.topics = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createTopic = function() {

		$http.post('/api/topics', $scope.formData)
			.success(function(data) {
				//$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.topics = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a topic after checking it
	$scope.deleteTopic = function(id) {
		$http.delete('/api/topics/' + id)
			.success(function(data) {
				$scope.topics = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// view a topic by id
	$scope.viewTopic = function(id) {
		$http.get('/api/topics/' + id)
			.success(function(data) {
				$scope.topic = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});

	};

	/*Fetches data from Twitter and Facebook, updates progress bar*/

	$scope.fetchTwFb = function() {
		if($scope.formData.keyword == '') return;

		$scope.progress = {};
		$scope.progresscnt = 0;
		$scope.fetchTw();
		$scope.createTopic();
	};

	/*Fetches data from Twitter, IMDB and Facebook, updates progress bar*/
	$scope.fetchTwFbImdb = function() {
		if($scope.formData.keyword == '') return;

		$scope.fetchTwFb();
		$scope.fetchImdb();
		
	}

	$scope.fetchTw = function() {
		$scope.progress.statusMsg = 'Requesting tweets from Twitter...';
		$scope.progresscnt +=10;
		$scope.progress.status = $scope.progresscnt + '%';
		
		$http.post('/api/tweets', $scope.formData)
		.success(function(data) {
			console.log(data);
			$scope.progress.statusMsg = 'Tweets recieved...';
			$scope.progresscnt +=10;
			$scope.progress.status = $scope.progresscnt + '%';

			$scope.fetchFb();
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	}

	$scope.fetchFb = function() {
		$scope.progress.statusMsg = 'Requesting posts from Facebook...';
		$http.post('/api/fbposts', $scope.formData)
		.success(function(data) {
			console.log(data);
			$scope.progress.statusMsg = 'Facebook Posts recieved...';
			$scope.progresscnt +=10;
			$scope.progress.status = $scope.progresscnt + '%';
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	}

	$scope.fetchImdb = function() {
		$scope.progress.statusMsg = 'Requesting reviews from IMDB...';
		$http.post('/api/imdbreviews', $scope.formData)
		.success(function(data) {
			console.log(data);
			$scope.progress.statusMsg = 'IMDB reviews recieved...';
			$scope.progresscnt +=10;
			$scope.progress.status = $scope.progresscnt + '%';
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	}

}
