/**
 * Created by Ofir.Fridman on 2/1/2015.
 */
'use strict';

app.controller('strategyCtrl', ['$scope', '$state', '$stateParams', 'headerService',
  function ($scope, $state, $stateParams, headerService) {
    $scope.type = 'strategy';
    $scope.entityId = $stateParams.strategyId;
    $scope.entityActions = [
      {
        name: 'Serving Strategy',
        ref: '.servingStrategies',
        func: changeToServingStrategy,
        preventOpenMenu: true
      }
    ];

    function changeToServingStrategy(){
      headerService.goToServingStrategy();
    };
  }]);
