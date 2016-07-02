'use strict';

/**
 * @ngdoc overview
 * @name atheistengineergithubioApp
 * @description
 * # atheistengineergithubioApp
 *
 * Main module of the application.
 */
var config = {
  apiKey: "AIzaSyBL9UCwkTeWzbPazNed-bkPQpx1_imxz84",
  authDomain: "graphical-reasoner.firebaseapp.com",
  databaseURL: "https://graphical-reasoner.firebaseio.com",
  storageBucket: "graphical-reasoner.appspot.com",
};
firebase.initializeApp(config);

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
    'firebase'
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
      .when('/reason', {
        templateUrl: 'views/reason.html',
        controller: 'ReasonCtrl',
        controllerAs: 'reason',
        reloadOnSearch: false,
        resolve: {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": ["Auth", function(Auth) {
            // $requireSignIn returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Auth.$requireSignIn();
          }]
        }
      })
      .when('/reason/:slug', {
        templateUrl: 'views/reason.html',
        controller: 'ReasonCtrl',
        controllerAs: 'reason',
        reloadOnSearch: false,
        resolve: {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": ["Auth", function(Auth) {
            // $requireSignIn returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Auth.$requireSignIn();
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }).run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
