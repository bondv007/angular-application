/**
 * Created by Cathy Winsor on 6/9/14.
 */
app.controller('sitesectionCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
	$scope.type = 'sitesection';
	$scope.entityId = $stateParams.sitesectionId;
	$scope.entityActions = [];
    $scope.entityActions.parentMenuItem = 'Admin';
    if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
}]);