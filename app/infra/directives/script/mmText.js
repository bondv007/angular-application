/**
 * Created by Liron.Tagger on 8/24/14.
 */
app.directive('mmText', [function(){
  return {
    restrict: 'E',
    scope: {
      mmModel: '=',
      mmMinWidth:'@',
      mmError: "=?",
      mmCaption: "@",
      mmHideLabel: "@",
      mmChange: "&",
      mmBlur: "&",
      mmIsRequired: '@',
      mmIsEditMode: "=?",
      mmIsCustomLink: "=?",
      mmCustomLink: "@",
      mmShowAsLabel: "=?",
      mmDisable: "=?",
      mmPlaceholder: "@",
      textTooltip: '@',
      mmClass: "@",
      mmCloseModeClass: "@",
      mmEditMultiple: "=?",
      mmLabelWidth: "@",
      mmLayoutType: '@',
      mmIsLink: "=?",
      mmLinkText: "=",
      mmAdditionalText: "@",
      mmEntityType: "@",
      mmEntityId: '=',
	  mmControlWidth: '@',
      mmCustomControlWidth: "@",
      mmCustomControlClass: "@",
      mmTabIndex: "@",
      mmInputType: "@",
      mmId: '@',
      mmCustomLabelPadding: "@"
    },
    template: '<mm-control-base control-type="text"></mm-control-base>',
    controller: ['$scope', '$element', 'entityMetaData', '$state', 'mmUtils', 'infraEnums', function ($scope, $element, entityMetaData, $state, mmUtils, infraEnums) {
        $scope.controlType = 'text';
        $scope.mmInputType = ($scope.mmInputType === undefined) ? 'text' : $scope.mmInputType;
        $scope.mmShowAsLabel = !!$scope.mmShowAsLabel || !!$scope.mmIsLink;
        $scope.isShowControl = !$scope.mmShowAsLabel;
        $scope.setFocus = ($element.attr('set-focus') !== undefined) ;
        $scope.mmSimpleLink = $scope.mmEntityType ? false : true;
        $scope.mmIsLink = (!!$scope.mmIsLink) ? $scope.mmIsLink : false;
				$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.textbox.toLowerCase(), $scope.mmCaption, $scope.mmId);

				if(!$scope.mmSimpleLink){
            if($scope.mmIsCustomLink){
                $scope.entityPage = $scope.mmCustomLink;
            }else{
                $scope.entityPage  = entityMetaData[$scope.mmEntityType].editPageURL;
                $scope.mmEntityIdKey = entityMetaData[$scope.mmEntityType].foreignKey;
            }
            $scope.mmEntityIdKey = entityMetaData[$scope.mmEntityType].foreignKey;
        }

        $scope.onLinkClicked = function(entityPage, entityIdKey){
            var params = {};
            if(entityIdKey){
                params[entityIdKey] = $scope.mmEntityId;
                $state.go(entityPage, params);
            }
            else{
                $state.go(entityPage);
            }
        }

        if($scope.isEditMultiple){
            $scope.mmModel = 'Multiple Values';
        }
    }]
  }
 }]
);
