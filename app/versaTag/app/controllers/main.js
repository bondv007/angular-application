
'use strict';

app.controller('mainVersaCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.titleType = 'advertiserVtag';
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
