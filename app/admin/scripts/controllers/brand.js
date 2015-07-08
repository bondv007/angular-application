/**
 * Created by atdg on 6/30/14.
 */
'use strict';

app.controller('brandCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
	$scope.type = 'brand';
	$scope.entityId = $stateParams.brandId;
	$scope.entityActions = [];
}]);
