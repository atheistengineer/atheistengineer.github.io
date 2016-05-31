'use strict';

/**
 * @ngdoc function
 * @name atheistengineergithubioApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the atheistengineergithubioApp
 */
angular.module('atheistengineergithubioApp')
  .controller('HeaderCtrl', ['$scope', '$location', function ($scope, $location) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
	$scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };

  }]);
