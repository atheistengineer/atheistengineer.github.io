'use strict';

/**
 * @ngdoc function
 * @name atheistengineergithubioApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the atheistengineergithubioApp
 */
angular.module('atheistengineergithubioApp')
  .controller('TwitterCtrl', function ($scope, $location, $routeParams) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.ref=$routeParams.ref;
	$scope.isActive = function (ref) { 
        return ref === $routeParams.ref;
    };
    
  });
