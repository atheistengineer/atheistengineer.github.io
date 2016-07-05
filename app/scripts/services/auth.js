'use strict';

angular.module('atheistengineergithubioApp')
.factory("Auth", ["$firebaseAuth", 'FUser',
  function($firebaseAuth, FUser) {
    var fbo = $firebaseAuth();
    fbo.$onAuthStateChanged(function(firebaseUser) {
        FUser(firebaseUser);
    });
    return fbo;
  }
])

// From: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
.factory("FUser", ["$firebaseObject",
  function($firebaseObject) {
    return function(user) {
      if (user === null) {
        return null;
      }
      // create a reference to the database where we will store our data
      //var randomId = Math.round(Math.random() * 100000000);
      var ref = firebase.database().ref().child("users");
      var userRef = ref.child(user.uid);
      userRef.set({
        'displayName': user.displayName,
        'photoUrl': user.photoURL,
        'lastLogin': {
            ".sv": "timestamp"
        }
      });

      // return it as a synchronized object
      return $firebaseObject(userRef);
    }
  }
]);
        /*ref.child('users').child(firebaseUser.uid).set({
          'lastLogin': (new Date())
        })*/


/*.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("home");
    }
  });
}]);;

*/
