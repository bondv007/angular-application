/**
 * Created by rotem.perets on 4/28/14.
 */

'use strict';

app.controller('mainEssentialCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'advertiser';
  $scope.entityId = null;//'KGP3C9Y0HS';
  $scope.entityActions = [
    {
      name: 'View',
      views: [
        {name: 'Essentials', ref: '.essentials.edit', nodes: []}
      ]
    }
  ];
}]);