'use strict';

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
  .controller('BayesianCtrl', ['$scope', '$routeParams', 'VisDataSet',
  function ($scope, $routeParams, VisDataSet) {
    $scope.probabilities = [0, 1, 2, 3, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 93, 98, 99, 100];

    var nodes = new VisDataSet([
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
    ]);

    var edges = new VisDataSet([
      {
         "to": "1",
         "from":"2",
         "arrows": "to",
         "label": "Jesus is a God because The Bible says Jesus is a God",
         "ifTrue": 5,
         "ifFalse": 2,
      },
      {
         "to": "1",
         "from":"3",
         "arrows": "to",
         "label": "Jesus is a God because The Bible is inerrant",
         "ifTrue": 5,
         "ifFalse": 2,
    }
    ]);
    $scope.graph = {
      nodes: nodes.get(),
      edges: edges.get()
    };

    nodes.on('*', function() {
      $scope.graph.nodes = nodes.get();
      //$scope.$apply();
    })
    edges.on('*', function() {
      $scope.graph.edges = edges.get();
      //$scope.$apply();
    })


    $scope.graphOptions = {
      // interaction: {hover:true}
    }
    $scope.graphData = {
      nodes: nodes,
      edges: edges
    };

  $scope.updateNode = function(node){
    $scope.graphData.nodes.update(node);
  }

  $scope.selectedNodes = [];
  $scope.selectedEdges = [];

  $scope.nodeIsSelected = function (node) {
    return $scope.selectedNodes.indexOf(node.id.toString()) >= 0;
  }
  $scope.edgeIsSelected = function (edge) {
    return $scope.selectedEdges.indexOf(edge.id.toString()) >= 0;
  }
  $scope.supportingNodes = [];
  $scope.supportedNodes = [];
  $scope.selectedNodeObjects = [];

  function graphSelect(ev){
    $scope.selectedNodes = ev.nodes;
    var nodeints = ev.nodes.map(function(x) { return parseInt(x, 10); });
    $scope.selectedNodeObjects = $scope.graphData.nodes.get(nodeints);

    $scope.selectedEdges = ev.edges;
    $scope.selectedEdgeObjects = $scope.graphData.edges.get(ev.edges);


    /* Update SupportingNodes */
    var supporting_edges = $scope.graphData.edges.get({
      filter: function (item) {
        return (ev.nodes.indexOf(item.to.toString()) >= 0);
      }
    });
    var from_ids = $.map(supporting_edges, function(e){return e.from});
    $scope.supportingNodes = $scope.graphData.nodes.get(from_ids);

    /* Update SupportedNodes */
    var supported_edges = $scope.graphData.edges.get({
      filter: function (item) {
        return (ev.nodes.indexOf(item.from.toString()) >= 0);
      }
    });
    var to_ids = $.map(supported_edges, function(e){return e.to});
    $scope.supportedNodes = $scope.graphData.nodes.get(to_ids);

    $scope.$apply();
  }
  $scope.events = {
    "click": graphSelect,
    };
  }]);


/*
<a class="twitter-timeline" href="https://twitter.com/AtheistEngineer/lists/podcasts" data-widget-id="737409885277683716">Tweets from https://twitter.com/AtheistEngineer/lists/podcasts</a>
*/
