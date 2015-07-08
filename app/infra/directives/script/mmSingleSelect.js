/**
 * Created by rotem.perets on 5/13/14.
 */
app.directive('mmSingleselect', [function () {
  return {
    restrict: 'E',
    require: 'mmModel',
    template: '<mm-control-base id="{{::mmId}}" control-type="single"></mm-control-base>',
    controller: ['$scope', '$element', '$filter', '$timeout', 'entityMetaData', 'EC2Restangular', '$state', 'mmModal', '$document', 'mmRest',
      function ($scope, $element, $filter, $timeout, entityMetaData, EC2Restangular, $state, mmModal, $document, mmRest) {
        var timer1, timer2, timer3;
        $scope.checked = false;
        $scope.isVisible = false;
        $scope.searchBox = {};
        $scope.currentIndex = null;

        if ($scope.isEditMultiple) {
          if (_.find($scope.mmDataModel, {'id': -1}) === undefined) {
            $scope.mmDataModel.unshift({id: -1, name: "Multiple Values"});
          }
          $scope.mmModel = -1;
        }

        function setMultiselectLabel() {
          $scope.labelClass = 'label-general';
          if ($scope.mmModel == undefined || $scope.mmModel.toString().length == 0 || $scope.mmDataModel === undefined) {
            $scope.mmMultiselectLabel = 'multiselect-label';
            $scope.labelClass = 'label-hint';
            $scope.mmModelText = $scope.mmCustomModelText ? $scope.mmCustomModelText : 'Please Select';
          } else {
            $scope.mmMultiselectLabel = 'multiselect-label-selected';
            if ($scope.mmDataModel) {
              for (var i = 0; i < $scope.mmDataModel.length; i++) {

                if ($scope.mmReturnFullObject) {
                  if ($scope.mmDataModel[i][$scope.mmOptionId] == $scope.mmModel.id) {
                    if (!_.isUndefined($scope.mmDataModel[i][$scope.mmOptionName])) {
                      $scope.mmModelText = $scope.mmDataModel[i][$scope.mmOptionName].toString();
                    }
                  }
                }
                else {
                  if ($scope.mmDataModel[i][$scope.mmOptionId] == $scope.mmModel) {
                    if (!_.isUndefined($scope.mmDataModel[i][$scope.mmOptionName])) {
                      $scope.mmModelText = $scope.mmDataModel[i][$scope.mmOptionName].toString();
                    }
                  }
                }


              }
            }
          }
          if ($scope.mmDisable) {
            $scope.labelClass = 'label-disabled';
          }
          if ($scope.mmIsLink) {
            $scope.entityPage = entityMetaData[$scope.mmEntityType].editPageURL;
            if ($scope.mmReturnFullObject) {
              $scope.mmEntityId = $scope.mmModel.id;
            }
            else {
              $scope.mmEntityId = $scope.mmModel;
            }
            $scope.mmEntityIdKey = entityMetaData[$scope.mmEntityType].foreignKey;
            $scope.mmLinkText = $scope.mmModelText;
          }
          if ($scope.isCustomLabelDefined) {
            var labelObj = {label: {value: "", dropDownId: $scope.mmId, modelText: $scope.mmModelText}};
            $scope.customLabel(labelObj);
            $scope.mmModelText = labelObj.label.value;
          }
        }

        function autoPreSelectedChanged() {
          timer1 = $timeout(function () {
            if ($scope.isAutoPreSelectFunctionSet) {
              $scope.mmAutoPreSelectChangeFunc();
            } else {
              $scope.mmSelectChangeFunc();
            }
          }, 50);
        };

        function mmSelectedChanged() {
          $scope.$root.isDirtyEntity = true;
          if ($scope.mmSelectChangeFunc !== undefined) {
            timer2 = $timeout(function () { $scope.mmSelectChangeFunc()}, 50);
          }
        };

        function getModelItemIfNotExist(){
          var shouldGetModel = true;
          $scope.mmDataModel.forEach(function(item){
            if(item.id == $scope.mmModel){
              shouldGetModel = false;
            }
          });
          if(shouldGetModel && $scope.mmDataModel.getList){
            $scope.mmDataModel.getList({'q': $scope.mmModel}).then(function(result){
              if(result && result.length){
                result.forEach(function(item){
                  if(item.id == $scope.mmModel){
                    var pleaseAdd;
                    if($scope.mmAddPleaseSelect){
                      pleaseAdd = $scope.mmDataModel.shift();
                      $scope.mmDataModel.unshift(item);
                      $scope.mmDataModel.unshift(pleaseAdd);
                    } else {
                      $scope.mmDataModel.unshift(item);
                    }
                    setMultiselectLabel();
                  }
                });
              }
            }, function(err){console.log(err)});
          }
        }


        var watcher1 = $scope.$watch('mmModel', function (newVal, oldVal) {
          if($scope.lazyType && !$scope.lazyLoaded){
            $scope.loadLazyType();
          }
          if (!$scope.lazyType || $scope.lazyLoaded) {
            setMultiselectLabel();
          }

          if(!$scope.lazyType && newVal && $scope.mmDataModel && $scope.mmDataModel.length){
            getModelItemIfNotExist();
          }
        });

        var watcher2 = $scope.$watch('mmDataModel', function () {
          if ($scope.mmDataModel !== undefined) {
            setMultiselectLabel();
              if(!$scope.lazyType && $scope.mmDataModel && $scope.mmDataModel.length && $scope.mmModel){
                  getModelItemIfNotExist();
              }
            $scope.filtered = $scope.mmDataModel;
            if($scope.filtered.length == 1){
              if ($scope.mmReturnFullObject && $scope.mmModel) {
                $scope.mmModel.name = $scope.filtered[0][$scope.mmOptionName];
                $scope.mmModel.id = $scope.filtered[0][$scope.mmOptionId];
              } else {
                $scope.mmModel = $scope.filtered[0][$scope.mmOptionId];
              }
              setMultiselectLabel();
              autoPreSelectedChanged();
            }
            $scope.currentIndex = -1;
          }
        });

        $scope.toggleCheck = function (itemId, itemName) {
          if ($scope.mmReturnFullObject) {
            $scope.mmModel.name = itemName;
            $scope.mmModel.id = itemId;
          }
          else {
            $scope.mmModel = itemId;
          }

          setMultiselectLabel();
          if (!$scope.mmShowAsLabel) {
            $scope.checked = true;
          }
          $scope.changeControlVisibility(false);
          mmSelectedChanged();
        };

        $scope.toggleSelect = function (shouldClose) {
          if ($scope.checked && $scope.checked == true) {
            $scope.checked = false;
            if ($scope.mmShowAsLabel) {
              return;
            }
          }

          if (!shouldClose) {
            shouldClose = $scope.isVisible;
          }

          if ($scope.mmDisable) {
            return;
          }

          $scope.changeControlVisibility(!shouldClose);

          if ($scope.isVisible === true) {
            $scope.setDataModel(false);
          }
        }


        $scope.calcWraperHeight = function (temp) {

        }

        $scope.searchClick = function (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        $scope.onLinkClicked = function (entityPage, entityIdKey) {
          var params = {};

          if ($scope.mmReturnFullObject) {
            params[entityIdKey] = $scope.mmModel.id;
          }
          else {
            params[entityIdKey] = $scope.mmModel;
          }

          $state.go(entityPage, params);
        }

        $scope.preventClick = function (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        $scope.createNewEntityModal = function () {
          if ($scope.isModalOpen) {
            return;
          }
          $scope.isModalOpen = true;

          var modalInstance = mmModal.open({
            templateUrl: entityMetaData[$scope.newEntityType].newEntity.url,
            controller: entityMetaData[$scope.newEntityType].newEntity.controller,
            title: entityMetaData[$scope.newEntityType].newEntity.title,
            modalWidth: entityMetaData[$scope.newEntityType].newEntity.modalWidth || 650,
            bodyHeight: entityMetaData[$scope.newEntityType].newEntity.modalHeight || 300,
            confirmButton: { name: "Save", funcName: "onNewEntitySave", hide: false, isPrimary: true},
            discardButton: { name: "Cancel", funcName: "onNewEntityCancel"},
            resolve: {
              entity: function () {
                return $scope.entityObj;
              }
            }
          });
          modalInstance.result.then(function (data) {
            $scope.$root.isDirtyEntity = true;
            if (data.id) {
              $scope.mmDataModel.push(data);
              $scope.mmModel = data.id;

              if ($scope.mmReturnFullObject) {
                $scope.mmModel = data;
              }

            } else {
              var obj = {id: data, name: data};
              $scope.mmDataModel.push(obj);
              $scope.mmModel = data;
              if ($scope.mmReturnFullObject) {
                $scope.mmModel = obj;
              }
            }

            $scope.isModalOpen = false;
            timer3 = $timeout(function () {$scope.mmSelectChangeFunc()}, 150);
          }, function () {
            $scope.isModalOpen = false;
          });
        }

        // keyboard events
        var KEY_DW = 40;
        var KEY_UP = 38;
        var KEY_EN = 13;
        $scope.keyDownHandler = function (event) {
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

        $scope.$on('$destroy', function () {
          if (watcher1) watcher1();
          if (watcher2) watcher2();

          $timeout.cancel(timer1);
          $timeout.cancel(timer2);
          $timeout.cancel(timer3);
        });
      }]
  };
}]);
