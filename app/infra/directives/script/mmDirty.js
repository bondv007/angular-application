/**
 * Created by rotem.perets on 5/4/14.
 */
app.directive('mmDirty', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		controller: ['$scope', function ($scope) {
      console.log('mmModelToWatch: ' + $scope.mmModelToWatch);

      if($scope.mmModelToWatch !== undefined && $scope.mmModelToWatch !== null && $scope.mmModelToWatch !== ""){
        $scope.origModelToWatch = $scope.mmModelToWatch;
      } else {
        $scope.origModelToWatch = '';
      }

			$rootScope.$watch('mmIsPageDirty', function(){
        if($rootScope.mmIsPageDirty === 0){
					$scope.mmLocalIsDirty = false;
				}
			});

			$scope.$watch('mmModelToWatch', function(newVal, oldVal){
				if(newVal === undefined || newVal == oldVal){
					return;
				}

				var lastState = $scope.mmLocalIsDirty;
				$scope.mmLocalIsDirty = checkIfDirty(newVal, $scope.origModelToWatch);
				if (lastState !== undefined && lastState != $scope.mmLocalIsDirty) {
					if ($rootScope.mmIsPageDirty !== undefined) {
						//$scope.mmLocalIsDirty ? $rootScope.mmIsPageDirty++ : $rootScope.mmIsPageDirty--;
					}
				}
			});

			function checkIfDirty(newVal, oldVal){
				if(typeof(newVal) !== typeof(oldVal)){
					return false;
				}

				if(newVal instanceof Array){
					if(oldVal === null){
						return newVal !== null;
					}

					if(newVal.length != oldVal.length){
						return true;
					}

					return !_.isEqual(newVal, oldVal);
				}
				else{
					return newVal != oldVal;
				}
			}
		}]
	}
}]
);