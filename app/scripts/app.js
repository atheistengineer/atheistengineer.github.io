'use strict';

/**
 * @ngdoc overview
 * @name atheistengineergithubioApp
 * @description
 * # atheistengineergithubioApp
 *
 * Main module of the application.
 */
angular
  .module('atheistengineergithubioApp', [
    'ngAnimate',
    'ngtweet',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngVis',
    'ui.bootstrap',
    'xeditable',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/twitter', {
        templateUrl: 'views/twitter.html',
        controller: 'TwitterCtrl',
        controllerAs: 'twitter'
      })
      .when('/Bayesian/:slug', {
        templateUrl: 'views/Bayesian.html',
        controller: 'BayesianCtrl',
        controllerAs: 'bayesian',
        reloadOnSearch: false
      })
      .otherwise({
        redirectTo: '/'
      });
  }).run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
