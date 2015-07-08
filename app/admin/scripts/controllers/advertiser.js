/**
 * Created by rotem.perets on 5/28/14.
 */
'use strict';

app.controller('advertiserCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'advertiser';
  $scope.entityId = $stateParams.advertiserId;
  $scope.entityActions = [
    {
      name: 'Tags',
      actions: [
        { name: 'Excel', func: func1, nodes: [
          {name: 'Import', func: func1, nodes: []},
          {name: 'Export', func: func1, nodes: []}
        ]
        }
      ]
    }
  ];

  function func1() {

  }
}]);