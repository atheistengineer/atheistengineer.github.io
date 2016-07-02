'use strict';
/* global $ */ // For jslint.
/**
 * @ngdoc function
 * @name atheistengineergithubioApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the atheistengineergithubioApp
 */

/* Data structure of a node is something like:
 Claim
 Description
 P(True) [table]
 Dependent claims
 Links
 If there's one dependency, the truth becomes a 2-vector:
   - P(Claim|dependency is true)
   - P(Claim|dependency is false)

 If there's two dependencies, the truth becomes a 4-vector:
              D1  D2
   - P(Claim| T   T )
   - P(Claim| T   F )
   - P(Claim| F   T )
   - P(Claim| F   F )

 In the general case the length of the truth vector goes as 2^N where N
 is the number of edges which connect to the node.  Question is: Do I want
 to implement something this complex or just implement probability of the
 target node truth if the independent node is true vs valse, storing this
 2-element truth table on the edge?
 */
angular.module('atheistengineergithubioApp')
  .controller('ReasonCtrl', ['$scope', '$routeParams', '$location', '$firebaseArray',
  '$firebaseObject', 'Auth', 'Reason', 'VisDataSet', 'Firebase',
  function ($scope, $routeParams, $location, $firebaseArray,
            $firebaseObject, Auth, Reason, VisDataSet, Firebase) {

    $scope.auth = Auth;
    $scope.firebaseUser =  {}
    // From https://github.com/firebase/angularfire/blob/master/docs/quickstart.md
    var ref = firebase.database().ref();
    // var array = $firebaseArray(ref);
      // download the data into a local object
    //var graph = $firebaseObject(ref.child("claims").child('single-claim'));
    var graph = Reason('', $scope.auth.uid)
    $scope.graph = {
      'owner': $scope.auth.uid
    };

    // synchronize the object with a three-way data binding
    // click on `index.html` above to see it used in the DOM!
    graph.$bindTo($scope, "graph");


    // any time auth state changes, add the user data to scope
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      console.log("User Auth State Changed", firebaseUser);
      if (firebaseUser !== null) {
        if ($scope.graph.owner === undefined) {
          console.log('Updated graph owner')
          $scope.graph.owner = firebaseUser.uid;
        }
      }
      $scope.firebaseUser = firebaseUser;
    });

    var nodes = new VisDataSet();
    var edges = new VisDataSet();

    // When nodes or edges change, update $scope.graph appropriately.
    nodes.on('*', function() {
      $scope.graph.nodes = nodes.get();
    });
    edges.on('*', function() {
      $scope.graph.edges = edges.get();
    });

    $scope.graphOptions = {
      'interaction': {
        'selectConnectedEdges': false,
        'hover': false
      },
      'nodes': {
        'shape': 'box'
      }
    };
    $scope.graphData = {
      nodes: nodes,
      edges: edges
    };

    $scope.updateNode = function(node){
      $scope.graphData.nodes.update(node);
    };

    $scope.selectedNodes = [];
    $scope.selectedEdges = [];

    $scope.supportingNodes = [];
    $scope.supportedNodes = [];
    $scope.selectedNodeObjects = [];

    $scope.supportingNode = [];
    $scope.supportedNode = [];

    $scope.search = function(query){
      $location.search(query);
    };

    /* This function is called when something on the graph is selected. It
     updates the data models in angular to match the data in the graph.
    */
    function graphSelect(ev, noapply){
      if (ev.nodes === undefined) {
        ev.nodes = [];
      }
      $scope.selectedNodes = ev.nodes;
      $scope.selectedNodeObjects = $scope.graphData.nodes.get(ev.nodes);

      if (ev.edges === undefined){
        ev.edges = [];
      }
      $scope.selectedEdges = ev.edges;
      $scope.selectedEdgeObjects = $scope.graphData.edges.get(ev.edges);

      $location.search({edge:ev.edges, node:ev.nodes});

      if (ev.edges.length > 0){
          $scope.supportedNode = $scope.graphData.nodes.get(ev.edges[0].to);
          $scope.supportingNode = $scope.graphData.nodes.get(ev.edges[0].from);
      }

      if (ev.nodes.length > 0) {
        /* Update SupportingNodes */
        var supporting_edges = $scope.graphData.edges.get({
          filter: function (item) {
            return (ev.nodes.indexOf(item.to.toString()) >= 0);
          }
        });

        var from_ids = $.map(supporting_edges, function(e){return e.from;});
        $scope.supportingNodes = $scope.graphData.nodes.get(from_ids);

        /* Update SupportedNodes */
        var supported_edges = $scope.graphData.edges.get({
          filter: function (item) {
            return (ev.nodes.indexOf(item.from.toString()) >= 0);
          }
        });

        var to_ids = $.map(supported_edges, function(e){return e.to;});
        $scope.supportedNodes = $scope.graphData.nodes.get(to_ids);
      } else {
        $scope.supportedNodes = [];
        $scope.supportingNodes = [];
      }

      if(noapply !== true) {
        $scope.$apply();
      }
    }

    $scope.removeEdge = function(edge){
      $scope.graphData.edges.remove(edge.id);
      graphSelect({nodes:[], edges:[]}, true);
    };

    $scope.removeNode = function(node){
      $scope.graphData.nodes.remove(node.id);
      var bad_edges = $scope.graphData.edges.get({
        filter: function (item) {
          return (item.to === node.id) || (item.from === node.id);
        }});
      $scope.graphData.edges.remove(bad_edges);
      graphSelect({nodes:[], edges:[]}, true);
    };

  $scope.createNode = function()  {
    var node_id = $scope.graphData.nodes.add({'label': 'New Node'});
    $scope.select({'node':node_id});
  };

  $scope.createEdge = function(from, to)  {
    var node_id = $scope.graphData.edges.add({'arrows': 'to', 'from': from.id, 'to': to.id});
    $scope.showEdgeTarget=false;
    return node_id;
  };

  $scope.showEdgeTarget = false;
  $scope.toggleEdgeTarget = function() {
    $scope.showEdgeTarget = !$scope.showEdgeTarget;
  };
  $scope.showEdgeFrom = false;
  $scope.toggleEdgeFrom = function() {
    $scope.showEdgeFrom = !$scope.showEdgeFrom;
  };


  $scope.select = function(qry){
    if ((qry.edge === undefined) && (qry.node !== undefined)){
      graphSelect({'nodes': [qry.node], 'edges':[]}, true);
    }
    else if ((qry.edge !== undefined) && (qry.node === undefined)){
      graphSelect({'nodes': [], 'edges':[qry.edge]}, true);
    }
    else{
      console.log('Illlegal selection call. Only node or edge may be defined.', qry);
    }
  };

  $scope.events = {
    "click": graphSelect,
    };
    // login with Facebook
/* var twitter = new firebase.auth.TwitterAuthProvider();
  auth.$signInWithPopup(twitter).then(function(firebaseUser) {
    console.log("Signed in as:", firebaseUser.uid);
  }).catch(function(error) {
    console.log("Authentication failed:", error);
  });

    $scope.createUser = function() {
      $scope.message = null;
      $scope.error = null;

      // Create a new user
      Auth.$createUser()
        .then(function(firebaseUser) {
          $scope.message = "User created with uid: " + firebaseUser.uid;
        }).catch(function(error) {
          $scope.error = error;
        });
    };

    $scope.deleteUser = function() {
      $scope.message = null;
      $scope.error = null;

      // Delete the currently signed-in user
      Auth.$deleteUser().then(function() {
        $scope.message = "User deleted";
      }).catch(function(error) {
        $scope.error = error;
      });
    };
*/

}]);



/*
<a class="twitter-timeline" href="https://twitter.com/AtheistEngineer/lists/podcasts" data-widget-id="737409885277683716">Tweets from https://twitter.com/AtheistEngineer/lists/podcasts</a>
*/
