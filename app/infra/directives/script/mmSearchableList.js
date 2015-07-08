/**
 * Created by rotem.perets on 6/18/14.
 */
app.directive('mmSearchableList', [function(){
  return {
    restrict: 'E',
    scope: {
      mmClass: "@",
      mmModel: "=",
      mmDataModel: "=",
      mmDisableSelected: "="
    },
    templateUrl: 'infra/directives/views/mmSearchableList.html',
    controller: ['$scope', '$element', '$filter', '$timeout', function ($scope, $element, $filter, $timeout) {
      $scope.mmScrollerClass = ($scope.mmClass === undefined) ? "searchableScroller" : $scope.mmClass;
      $scope.filtered = $scope.mmDataModel;
      $scope.searchBoxText = "";
      $scope.selectedItems = $scope.mmModel.slice();
      $scope.selectedItemsOrig = $scope.mmModel.slice();
      $scope.settings = {}
      $scope.settings.shouldDisable = ($scope.mmDisableSelected === undefined) ? false : $scope.mmDisableSelected;

      $scope.itemSelected = function(itemId){
        if($scope.selectedItems.indexOf(itemId) > -1){
          $scope.selectedItems.splice($scope.selectedItems.indexOf(itemId), 1);
        } else {
          $scope.selectedItems.push(itemId);
        }

        $scope.mmModel = $scope.selectedItems;
      }

			var timer;
      $scope.filterList = function(){
        timer = $timeout(function(){
          $scope.filtered  = $filter('filter')($scope.mmDataModel, $scope.searchBoxText, false);
        },100);
      }

			$scope.$on('$destroy', function() {
				$timeout.cancel(timer);
			});
    }]
  }
}]);