/**
 * Created by Ofir.Fridman on 8/18/14.
 */
app.directive('mmButtonDropDown', [function() {
	return {
		restrict: 'AE',
		require: ['mmModel'],
		scope: {
			mmModel:"=",
			mmItems:"=",
            mmStyle:"=?"
		},
		templateUrl: 'infra/directives/views/mmButtonDropDown.html',
		controller: ['$scope','$filter', function ($scope, $filter) {
			$scope.isOpen=false;
			$scope.changeOpenModeState = function(){
			$scope.isOpen = false;
			$scope.actionInvoke = function(action) {
					if (!$scope.mmModel.disable && action){
						var selectedItems = $filter('filter')($scope.mmItems, {isSelected:true});
						action(selectedItems);
					}
				};
			}
		}]
	}
}]
);