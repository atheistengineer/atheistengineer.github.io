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
  .controller('BayesianCtrl', ['$scope', '$routeParams', '$location', 'VisDataSet',
  function ($scope, $routeParams, $location, VisDataSet) {
    $scope.probabilities = [0, 1, 2, 3, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 93, 98, 99, 100];


    var data = {
    'nodes': [
    { "id": "1",
      "label": "Jesus is a God",
      "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nec orci ultrices, facilisis leo et.",
      "probability": 3,
      },
    { "id": "2",
      "label": "The Bible says Jesus is a God",
      "desc": "There's some disagreement about this claim among Bible Scholars, but most seem to think it does",
      "probability":  90,
      },
    { "id": "3",
      "label": "The Bible is Inerrant",
      "desc": "A comparison of the Bible with objective evidence about reality shows it is errant.",
      "probability":  3,
      }
    ],
    'edges': [
      {
         "to": "1",
         "from":"2",
         "arrows": "to",
         "ifTrue": 5,
         "ifFalse": 2,
      },
      {
         "to": "1",
         "from":"3",
         "arrows": "to",
         "ifTrue": 5,
         "ifFalse": 2,
    }
    ]};

    var nodes = new VisDataSet(data.nodes);
    var edges = new VisDataSet(data.edges);
    $scope.graph = {
      nodes: nodes.get(),
      edges: edges.get()
    };

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
  }]);


/*
<a class="twitter-timeline" href="https://twitter.com/AtheistEngineer/lists/podcasts" data-widget-id="737409885277683716">Tweets from https://twitter.com/AtheistEngineer/lists/podcasts</a>
*/
