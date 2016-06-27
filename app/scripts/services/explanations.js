'use strict';

// From: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
angular.module('atheistengineergithubioApp.services')
.factory('BayesModel', ['$resource', function($resource) {
  return $resource('/bayes_models/:slug.json');
}]);
