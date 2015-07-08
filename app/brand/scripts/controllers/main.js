/**
 * Created by rotem.perets on 4/28/14.
 */

'use strict';

app.controller('brandCtrl1', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'brand';
  $scope.entityId = $stateParams.brandId;
  $scope.entityActions = [
    {
      name: 'Tags',
      views: [
        {name: 'Brand', ref: '.edit', nodes: []}
      ]
    }
  ];
}]);