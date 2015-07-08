/**
 * Created by Alon.Shemesh on 5/1/14.
 */
app.directive('mmRadiobutton', ['$compile',
        function() {
            return {
                restrict: 'E',
                scope: {
                    mmError: "=?",
                    mmModel: "=",
                    mmCaption: "@",
                    mmClass: "@",
                    mmSelected: "=?",
                    mmIsRequired: '@',
                    mmDisable: "=?",
                    mmChange: "&",
                    mmVisible: "=?",
                    textTooltip: '@',
                    mmLabelLayoutClass: "@",
                    mmControlLayoutClass:"@",
                    mmLayoutType: '@',
                    mmCustomControlWidth: "@",
                    mmOuterControlClass: "@",
                    mmLabelWidth: "@",
                    mmEditMultiple: "=?",
                    mmOptionsIds: "=?",
                    mmAdditionalClass: "@",
                    mmTabIndex: "@",
										mmIsVertical: "=",
                    mmId: "@"
                },
                template: '<mm-control-base mm-id=\'{{mmId}}\' control-type="radio"></mm-control-base>',
                controller: ['$scope', '$element', '$document', '$timeout', 'mmUtils', 'infraEnums',function ($scope, $element, $document, $timeout, mmUtils, infraEnums) {
                    $scope.controlType= 'radio';
                    $scope.isShowControl = true;
                    $scope.mmForceHide = true;
                    $scope.mmDisable = ($scope.mmDisable !== undefined) ? $scope.mmDisable : false;
                    $scope.isEditMultiple=($scope.mmEditMultiple !== undefined) ? $scope.mmEditMultiple : false;
                    $scope.mmAdditionalClass = ($scope.mmAdditionalClass !== undefined) ? $scope.mmAdditionalClass : '';
										$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.radiobutton.toLowerCase(), $scope.mmCaption, $scope.mmId);
                    if($scope.isEditMultiple){
                        $scope.mmModel.unshift({id : -1, name: "Multiple Values"});
                        $scope.mmSelected=-1
                    }

                    $scope.onClick = function (key, disabled) {
                        var isDisabled = disabled ? disabled : $scope.mmDisable;
                        if (!isDisabled) {
                            $scope.$root.isDirtyEntity = true;
                            $scope.mmSelected = key;
                            $scope.mmOnChangeDirective();
                        }
                    };
                    var timer;
                    $scope.mmOnChangeDirective = function () {
                        timer = $timeout(function () {
                            $scope.mmChange()
                        }, 100);
                    };
                    $scope.onMouseOver = function(key, disabled){
                        var isDisabled = disabled ? disabled : $scope.mmDisable;
                        if (!isDisabled) {
                            $scope.mmModel[key].mouseIsOverRB = true;
                        }
                    };
                    $scope.onMouseOut = function(key, disabled){
                        var isDisabled = disabled ? disabled : $scope.mmDisable;
                        if (!isDisabled) {
                            $scope.mmModel[key].mouseIsOverRB = false;
                        }
                    }

                    $scope.showControl = function(isShow){

                    }
                    $scope.documentClick = function(){

                    }

                    $scope.onKeyPress = function($event, key, disabled) {
                        if ($event.keyCode == 13 || $event.keyCode == 32) {
                            // Here is where I must fire the click event of the button
                            $scope.onClick(key, disabled);
                        }
                    };

                    $scope.$on('$destroy', function() {
                        $timeout.cancel(timer);
                    });
                }]
            }
        }]
);