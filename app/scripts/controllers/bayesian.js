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

    $scope.nodes = new VisDataSet();

    $scope.nodes.add([
    { "id": 1,
      "label": "Jesus is a God",

      "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nec orci ultrices, facilisis leo et, laoreet est. Pellentesque vitae scelerisque tellus. Fusce congue ex vitae aliquam cursus. Sed vitae diam neque. Maecenas consequat elit arcu, sit amet aliquet elit pellentesque nec. Vivamus consequat nunc id urna euismod, sit amet ornare mi bibendum. Morbi pretium scelerisque eros. Quisque quis fringilla lacus.      Vestibulum scelerisque mi tortor, quis varius magna pellentesque ac. Nullam quis auctor mauris. Aliquam aliquet quam ut mi ornare viverra. Maecenas mauris ligula, gravida non nisl ut, fringilla tempor eros. Donec volutpat sed turpis elementum porttitor. Donec iaculis egestas quam quis maximus. Donec rhoncus eu neque eu dignissim. Vestibulum varius vestibulum nunc quis dapibus. Mauris fermentum dui metus, in tincidunt nunc rutrum id. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer ut nibh pharetra, aliquam risus a, ultrices massa.",
      "Probability": 3,
      "Dependents": {},
      "Links": [],
      },
    { "id": 2,
      "label": "The Bible says Jesus is a God",
      "Description": "There's some disagreement about this claim among Bible Scholars, but most seem to think it does",
      "Probability":  90,
      "Dependents": {},
      "Links": [],
      },
    { "id": 3,
      "label": "The Bible is Inerrant",
      "Description": "A comparison of the Bible with objective evidence about reality shows it is errant.",
      "Probability":  3,
      "Dependents": [],
      "Links": [],
      }
    ]);

    $scope.edges = new VisDataSet();
    $scope.edges.add([
      {
         "to": 1,
         "from":2,
         "ifTrue": 5,
         "ifFalse": 2,
      },
      {
         "to": 1,
         "from":3,
         "ifTrue": 5,
         "ifFalse": 2,
      }
    ]);

    $scope.graphData = {
      nodes: $scope.nodes,
      edges: $scope.edges
    };

  }]);


/*
<a class="twitter-timeline" href="https://twitter.com/AtheistEngineer/lists/podcasts" data-widget-id="737409885277683716">Tweets from https://twitter.com/AtheistEngineer/lists/podcasts</a>
*/
