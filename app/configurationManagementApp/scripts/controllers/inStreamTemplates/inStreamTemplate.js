/**
 * Created by roi.levy on 1/1/15.
 */
app.controller('inStreamTemplateCtrl', ['$scope', '$stateParams', function($scope, $stateParams){
    $scope.type = 'inStreamTemplate';
		$scope.entityId = $stateParams.inStreamTemplateId
}]);
