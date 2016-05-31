'use strict';

/**
 * @ngdoc function
 * @name atheistengineergithubioApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the atheistengineergithubioApp
 */
angular.module('atheistengineergithubioApp')
  .controller('TwitterCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.timelines = {
        'me': ['My Tweets', '737369040692367360'],
        'celebrities': ['Atheist Celebrities', '737415513077362688'],
        'evolution': ['Evolution', '737416906966204416'],
        'organizations': ['Organizations', '737415726059917316'],
        'podcasts': ['Smart Podcasts', '737412950714134528'],
        'space': ['Space Content', '737415216791707648'],
        'science-deniers': ['Science Deniers', "737409885277683716"], 
        'scientists': ['Scientists', '737412701144666112'],
    };
    var this_ref = $routeParams.ref;
    if ($scope.timelines[this_ref] === undefined) {
        this_ref = 'me';                                                                                                                
    }
    $scope.timeline_id = $scope.timelines[this_ref][1];
	$scope.isActive = function (ref) { 
        return ref === this_ref;
    };
    
  }]);


/*                                                                                                                                                                                                                                                                                                                                                                                                              
<a class="twitter-timeline" href="https://twitter.com/AtheistEngineer/lists/podcasts" data-widget-id="737409885277683716">Tweets from https://twitter.com/AtheistEngineer/lists/podcasts</a>
*/