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

  if ($location.search().name !== undefined) {
    var name = $location.search().name;
    init_graph(name);
  }

  var nodes = new VisDataSet();
  var edges = new VisDataSet();
  $scope.graphData = {
    nodes: nodes,
    edges: edges
  };

  $scope.graph = {};
  // Some day this could be more sophistocated.
  $scope.graphEditable = function(uid){
    return ($scope.auth.$getAuth().uid === $scope.graph.owner);
  }


  function init_graph(name){
    var graph = Reason(name, $scope.auth.uid)
    graph.then(function(val){
      $scope.graph = val;
      val.$bindTo($scope, "graph");
      val.$loaded().then(function(v){
        if (v.nodes !== undefined) {
          nodes.add(v.nodes);
        }
        if (v.edges !== undefined) {
          edges.add(val.edges);
        }
      })

      // When nodes or edges change, update $scope.graph appropriately.
      nodes.on('*', function() {
        $scope.graph.nodes = nodes.get();
      });
      edges.on('*', function() {
        $scope.graph.edges = edges.get();
      });

    });
    return graph;
  }

  // This function initializes the title & slug and starts saving the graph.
  $scope.setSlug = function (name) {
    if (!$scope.graph.slug && !$scope.graph.name) {
      init_graph(name);
    }

    // For some reason, setting $scope.graph.xxx works here, but we have to
    // set graph.xxx other places. graph.xxx doesn't seem to work here.
    $scope.graph.slug = name.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text

    $location.search({'reason': $scope.graph.name})
  };



  // any time auth state changes, add the user data to scope
  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    $scope.firebaseUser = firebaseUser;
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

  $scope.selectedNodes = [];
  $scope.selectedEdges = [];

  $scope.supportingNodes = [];
  $scope.supportedNodes = [];
  $scope.selectedNodeObjects = [];

  $scope.supportingNode = [];
  $scope.supportedNode = [];

  $scope.search = function(query){
    q2 = $location.search();
    q2.nodes = query.nodes;
    q2.edges = query.edges;
    $location.search(q2);
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

    $location.search({name:$scope.graph.name, edge:ev.edges, node:ev.nodes});

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
}]);



/*
<a class="twitter-timeline" href="https://twitter.com/AtheistEngineer/lists/podcasts" data-widget-id="737409885277683716">Tweets from https://twitter.com/AtheistEngineer/lists/podcasts</a>
*/
