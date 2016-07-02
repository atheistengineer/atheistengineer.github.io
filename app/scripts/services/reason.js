'use strict';

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// From: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
angular.module('atheistengineergithubioApp')
.factory("Reason", ["$firebaseObject",
  function($firebaseObject) {
    return function(title, owner) {
      // create a reference to the database where we will store our data
      //var randomId = Math.round(Math.random() * 100000000);
      var ref = firebase.database().ref().child("reasons").push();
      ///var claimRef = ref.child(slugify(title));
      ref.name=title

      // return it as a synchronized object
      return $firebaseObject(ref);
    }
  }
]);

/*.factory('Claim', ['$resource', function($resource) {
  return $resource('/bayes_models/:slug.json');
}]);
*/
