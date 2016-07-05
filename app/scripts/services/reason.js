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
.factory("ReasonFactory", ["$firebaseObject", "$q", function($firebaseObject, $q) {
  return $firebaseObject.$extend({
    getOwnerProfile: function() {
      var defer = $q.defer();

      this.$loaded().then(function(self){
        if (self.owner === undefined) {
          console.log('Owner undefined', self);
          defer.resolve(undefined);
          return
        }
        var owner = firebase.database().ref("users").child(self.owner);
        defer.resolve($firebaseObject(owner));
      });
      return defer.promise;
    },
    isEditable: function() {
      return this.owner === firebase.auth().currentUser.uid;
    }
  });
}])
.factory("Reason", ["ReasonFactory", "$q",
  function(ReasonFactory, $q) {
    return function(name) {
      var slug = slugify(name);
      // Get a reference to the "reasons" list.
      var reasons = firebase.database().ref("reasons");

      // We're going to defer our answer because we must.
      var defer = $q.defer();

      // This is something like a "Get or Create" implementation.
      var q = reasons.orderByChild("slug").equalTo(slug).limitToFirst(1)//.$loaded();
      q.once("value", function(val){
        /* Handle authentication nicely.
        */
        if (val.exists()){
          console.log("Value Exists", val)
          val.forEach(function(r){
            var ref = ReasonFactory(r.ref);
            defer.resolve(ref);
            return;
          })
        } else {
          console.log("No Value")
          var myUserId = firebase.auth().currentUser.uid;
          if(myUserId === undefined) {
            console.log('Unknown User.')
          } else {
            console.log("Logged in as " + myUserId );
          }
          var reason = reasons.push();
          reason.set({
              'name': name,
              'slug': slug,
              'owner': myUserId,
              'created': new Date().toString()
            });
          defer.resolve(ReasonFactory(reason));
        }
      });
      return defer.promise;
    }
  }
]);

/*.factory('Claim', ['$resource', function($resource) {
  return $resource('/bayes_models/:slug.json');
}]);
*/
