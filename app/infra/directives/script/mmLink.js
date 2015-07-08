/**
 * Created by rotem.perets on 5/1/14.
 */
app.directive('mmLink', [function () {
    return {
      restrict: 'E',
			require: ['mmModel'],
      scope: {
        mmClass: "@",
        mmShowLabel: "@",
        mmIsRequired: "@",
        mmLayoutType: '@',
        mmLabelLayoutClass: "@",
        mmControlLayoutClass: "@",
        mmOuterControlClass: "@",
        mmCloseModeClass: "@",
        mmCaption: "@",
        mmPlaceholder: "@",
        mmModel: "=",
        mmError: "=",
        mmIsDirtyCounter: "=",
        mmDisable: "=",
        mmChange: "&",
        mmIsEditMode: "=",
        mmLabelWidth: "@",
        mmLinkText: "=",
        mmAdditionalText: "@",
        mmEntityType: "@",
        mmEntityId: '=',
				mmEditMultiple: "="
      },
			templateUrl: 'infra/directives/views/mmLink.html',
			controller: ['$rootScope', '$scope', '$element', '$document', '$timeout', '$state','$window', 'entityMetaData', '$state',
				function ($rootScope, $scope, $element, $document, $timeout, $state,$window, entityMetaData, $state) {

          $scope.mmIsLink = true;
          $scope.mmSimpleLink = $scope.mmEntityType ? false : true;
          $scope.mmAdditionalClass = "link";
					$scope.isEditMultiple=($scope.mmEditMultiple !== undefined) ? $scope.mmEditMultiple : false;
          $scope.mmModelObj = {val: $scope.mmModel, text: $scope.mmLinkText};

          $scope.mmAdditionalClass =   "text-edit-mode";
          if($scope.mmIsEditMode === false){
            $scope.mmAdditionalClass= "text-new-mode";
          }


					if($scope.isEditMultiple){
						$scope.mmModel  = "Multiple Values";
						$scope.mmEntityId = "";
					}

          if(!$scope.mmSimpleLink){
            $scope.entityPage  = entityMetaData[$scope.mmEntityType].editPageURL;
            $scope.mmEntityIdKey = entityMetaData[$scope.mmEntityType].foreignKey;
          }

					$scope.onChange = function(){
						if(!$scope.mmDisable){
							$scope.$root.isDirtyEntity = true;
						}
					}

          $scope.onLinkClicked = function(entityPage, entityIdKey){

            var params = {};
            params[entityIdKey] = $scope.mmEntityId;

            $state.go(entityPage, params);
          }

          $scope.$watch('mmModel', function (newVal) {
						// shemesh - temp solution until we will remove mmmodelObj
						if($scope.isEditMultiple ){
							$scope.mmModelObj = {val: 'Multiple Values', text: ''};
							$scope.mmEntityId="";
						}
						else{
							$scope.mmModelObj =  {val: $scope.mmModel, text: $scope.mmLinkText};}
          });

					$scope.$watch('mmModelObj.val', function(newVal){
						if ($scope.mmModel !== newVal) {
							$scope.mmModel = newVal;
            	$scope.mmModelToWatch = newVal;
						}
					});

          $scope.showControl = function(isShow){
            $scope.allowClose = false;
            $document.click();
          }

          $scope.hideControl = function(){
            if($scope.isEditMode){
              $scope.isShowControl = false;
            }
          }

          $scope.allowClose = true;
          $scope.documentClick = function(){
						$rootScope.safeApply(function(){
              if($scope.allowClose){
                if($scope.isEditMode){
                  $scope.isShowControl = false;
                }
              } else {
                $scope.allowClose = true;
              }
            }, $scope);
          };

        }]
    }
  }]
);
