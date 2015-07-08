/**
 * Created by rotem.perets on 5/13/14.
 */
app.directive('mmMultiselect',[function(){
  return {
    restrict: 'E',
    require: 'mmModel',
    template: '<mm-control-base id="{{::mmId}}" control-type="multi"></mm-control-base>',
    controller: ['$rootScope', '$scope', '$element', '$document', '$filter', '$timeout', 'entityMetaData', 'EC2Restangular', '$state',
      function ($rootScope, $scope, $element, $document, $filter, $timeout, entityMetaData, EC2Restangular, $state) {
        $scope.controlType= 'multi';
        $scope.isVisible = false;
        $scope.currentIndex = null;
        $scope.searchBox = {};
        $scope.mmModelText = "";
				init();
        $scope.selectedItems = []; // Whatever the default selected index is, use -1 for no selection

        $scope.itemSelected = function (id, index) {
          $scope.currentIndex = index;
          if($scope.selectedItems.indexOf(id) > -1){
            $scope.selectedItems.splice($scope.selectedItems.indexOf(id), 1)
          } else {
            $scope.selectedItems.push(id);
          }
        };

        setMultiselectLabel();

        function setMultiselectLabel(){
          $scope.labelClass = 'label-general';
          if(!$scope.mmModel || $scope.mmModel.length == 0 || $scope.mmDataModel === undefined){
            $scope.mmMultiselectLabel = 'multiselect-label';
            $scope.labelClass = 'label-hint';
            $scope.mmModelText = '0 Items selected';

          } else {
            $scope.mmMultiselectLabel = 'multiselect-label-selected';
            $scope.mmModelText = $scope.mmCustomModelText ? $scope.mmCustomModelText : $scope.mmModel.length + ' Items selected';
          }
          if($scope.mmDisable){
            $scope.labelClass = 'label-disabled';
          }

          if($scope.mmIsLink){
            $scope.entityPage  = entityMetaData[$scope.mmEntityType].editPageURL;
            $scope.mmEntityId = $scope.mmModel;
			  if ( $scope.mmReturnFullObject ) {
				  $scope.mmEntityId = $scope.mmModel.id;
			  }
            $scope.mmEntityIdKey = entityMetaData[$scope.mmEntityType].foreignKey;
            $scope.mmLinkText = $scope.mmModelText;
          }
        }

        function init(){
					if($scope.isEditMultiple){
						if(_.find($scope.mmDataModel,{'id': -1})=== undefined){
							$scope.mmDataModel.unshift({id:-1,name:"Multiple Values"});
						}
						$scope.mmModel = -1;
					}
        }

				var timer;
        function mmSelectedChanged(newVal){
          $scope.$root.isDirtyEntity = true;
          if ($scope.mmSelectChangeFunc !== undefined) {
            timer = $timeout(function(){$scope.mmSelectChangeFunc()},50);
          }

//          if (newVal.length != oldVal.length || _.difference(newVal, oldVal).length > 0) {
//            $scope.mmModel = ($scope.mmModel instanceof Array) ? $scope.mmModel : $scope.mmModel[0];
//            if ($scope.mmSelectChangeFunc !== undefined) {
//              $timeout(function(){$scope.mmSelectChangeFunc()},50);
//            }
//          }
        };

        $scope.isChecked = function(itemId, itemName){
			if ( $scope.mmReturnFullObject ) {
				return ( $scope.mmModel.indexOfObjectByKey( 'id', itemId ) !== -1 );
			}
			else{
				return ($scope.mmModel.indexOf(itemId) !== -1);
			}

        };

        var watcher = $scope.$watch('mmModel.length', function(newVal, oldVal){
          $scope.lazyLoaded = $scope.lazyLoaded && oldVal === newVal;
          $scope.loadLazyType();
          if (!$scope.lazyType || $scope.lazyLoaded) {
            setMultiselectLabel();
          }
        });

        $scope.toggleCheck = function(itemId, itemName){
          // Update the bounded field to the new selected values
          var mmSelectedOrig = $scope.mmModel.slice();

          if(!$scope.isChecked(itemId)){
			  if ( $scope.mmReturnFullObject ) {
				  $scope.mmModel.push({ name: itemName, id: itemId });
			  }
			  else{
				  $scope.mmModel.push(itemId);
			  }

          }else{
            $scope.mmModel.splice($scope.mmModel.indexOf(itemId), 1);
          }
					mmSelectedChanged($scope.mmModel);
					setMultiselectLabel();
					$scope.$root.isDirtyEntity = true;
        };

        $scope.toggleSelect = function(shouldClose){
          if($scope.checked && $scope.checked == true){
            $scope.checked = false;
            return;
          }

          if(!shouldClose){
            shouldClose = $scope.isVisible;
          }

          if($scope.mmDisable){
            return;
          }

          $scope.changeControlVisibility(!shouldClose);

          if($scope.isVisible === true){
            $scope.setDataModel(false);
          }
        }

        $scope.preventClick = function(event) {
          event.preventDefault();
          event.stopPropagation();
        }

        $scope.onLinkClicked = function(entityPage, entityIdKey){

          var params = {};
          params[entityIdKey] = $scope.mmModel;

          $state.go(entityPage, params);
        }

        // keyboard events
        var KEY_DW  = 40;
        var KEY_UP  = 38;
        var KEY_EN  = 13;
        $scope.keyDownHandler = function(event) {
          var which = event.which ? event.which : event.keyCode;
          var row = null;
          var rowTop = null;

          if (which === KEY_EN && $scope.filtered) {
            if ($scope.currentIndex >= 0 && $scope.currentIndex < $scope.filtered.length) {
              event.preventDefault();
              var item = $scope.filtered[$scope.currentIndex];
              $scope.toggleCheck(item.id, item.name);
            }
          }
          else if (which === KEY_DW && $scope.filtered) {
            event.preventDefault();
            if (($scope.currentIndex + 1) < $scope.filtered.length && $scope.isVisible) {
              $scope.currentIndex++;
            }
          } else if (which === KEY_UP && $scope.filtered) {
            event.preventDefault();
            if ($scope.currentIndex >= 1) {
              $scope.currentIndex--;
            }
          }
        }

				$scope.$on('$destroy', function() {
					if (watcher){
						watcher();
					}

					$timeout.cancel(timer);
				});
			}]
  };
}]);
