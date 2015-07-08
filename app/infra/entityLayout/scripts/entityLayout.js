/**
 * Created by liron.tagger on 2/10/14.
 */
'use strict';

app.directive('entityLayout', function () {
  return {
    restrict: 'AE',
    templateUrl: 'infra/entityLayout/views/layout.html',
    require: ['entityType', 'entityId'],
    scope: {
      isEntral: '=',
      entityType: '=?',
      entityId: '=',
      entityActions: '=',
      hideGoTo: '=',
      entralEntity: '=?',
      view: '=?',
			goToData: '=?',
			childModel: '='
    },
    controller: ['$scope', 'entityMetaData', 'EC2Restangular', 'mmModal', '$state', '$window', 'mmContextService', '$location', '$parse',
      function ($scope, entityMetaData, EC2Restangular, mmModal, $state, $window, mmContextService, $location, $parse) {
        var addedButtons = [];

        if($scope.entralEntity){
					$scope.hideGoTo = $scope.entralEntity.hideGoTo || false;
					$scope.goToData = $scope.entralEntity.goToData || { links: [], actions: [] };
				}else{
					$scope.hideGoTo = $scope.hideGoTo || false;
					$scope.goToData = $scope.goToData || { links: [], actions: [] };
				}
        if(!$scope.hideGoTo && $scope.goToData.actions){
					if($scope.goToData.actions.length == 0 || $scope.goToData.actions[$scope.goToData.actions.length-1].name !== 'History'){
						$scope.goToData.actions.push({ name: 'History', func: openHistory});
					}
				}

        $scope.getInnerValue = function (pathObj, property) {
          var value = $scope.$eval('mainEntity.' + pathObj[property]);
          if (!value && value != 0) {
            pathObj.shouldShowLink = false;
          }
          return value;
        }

        $scope.isNewMode = $scope.entityId == '';
        if($scope.entityId){
          mmContextService.addContextItem($scope.entityId, $scope.entityType);
        }
        $scope.contextData = mmContextService.getCurrentContext($scope.entityType, $scope.isNewMode);
        $scope.selectedView = '';
        $scope.mainEntityType = $scope.entityType;
        $scope.entityMetaData = entityMetaData[$scope.entityType];
        $scope.entityLayoutInfraButtons = [];
        $scope.entityLayoutAdditionalInfraButtons = [];
        $scope.entityLayoutButtons = [];
        $scope.contextEntityInfo = {name: "", id: ""}
        $scope.insertNewItemToList = function (listObj, item) {
          var list = listObj.centralList;
          var index = null;
          if (listObj && listObj.filteredObject) {
            listObj.filteredObject.push(item.id);
          }
          if (listObj.selectedItem) {
            for (var i = 0; i < list.length; i++) {
              if (list[i].id == item.id) {
                index = i;
                break;
              }
            }
          }
          if (index != null && index >= 0) {
            list[index] = item;
          }
          else {
            list.push(item);
          }
        }

        function runAction(action) {
          if (typeof(action) == "function") {
            action();
          }
        }

        $scope.addButtons = function (buttons) {
          if (buttons && buttons.length > 0) {
            for (var i = 0; i < buttons.length; i++) {
              $scope.entityLayoutButtons.push(buttons[i]);
              addedButtons.push(buttons[i]);
            }
          }
        };
        $scope.onClick = function (actionToEvoke, actionType) {
          switch (actionType) {
            case 'save':
              $scope.save(actionToEvoke);
              break;
            case 'discard':
              $scope.discard(actionToEvoke);
              break;
            case 'attach':
              $scope.attach(actionToEvoke);
              break;
          }
        };
        $scope.discard = function (discardAction) {

          if ($scope.$root.isDirtyEntity) {
            var modalInstance = mmModal.open({
              templateUrl: './infra/infraModalMessages/discard/views/mmDiscardDialog.html',
              controller: 'mmDiscardDialogCtrl',
              title: "Discard Changes",
              modalWidth: 420,
              bodyHeight: 86,
              confirmButton: { name: "Discard Changes", funcName: "discard" },
              discardButton: { name: "Return To Page", funcName: "cancel"}
            });
            modalInstance.result.then(function () {
              $scope.isDiscardModalOpen = false;
              discardAction();
              $scope.$root.isDirtyEntity = false;

            }, function () {
              $scope.isDiscardModalOpen = false;
            });
          } else if ($scope.isEntral) {
            $scope.entralEntity.openEntral(false);
          } else if ($scope.contextData.isInContext) {
            var goToState = $scope.contextData.closePageUrl;
            var goToParams = {};
            goToParams[$scope.contextData.key] = $scope.contextData.contextEntityId;
            if(!$scope.isNewMode){
              mmContextService.removeTopContextItem();
            }
            $state.go(goToState, goToParams);
          } else if ($scope.entityMetaData.listPageURL) {
            var goToParams = {};
            if($state.params[$scope.entityMetaData.contextKey]){
              goToParams[$scope.entityMetaData.contextKey] = $state.params[$scope.entityMetaData.contextKey];
            }
            $state.go($scope.entityMetaData.listPageURL, goToParams);
          }
        };
        $scope.save = function (saveAction) {
          var returnedFunc = saveAction();
          if (returnedFunc && returnedFunc.then) {
            returnedFunc.then(processData, processError);
          }

          function processData(data) {
            if (data != null) {
              if ($scope.entralEntity) {
                var obj;
                if ($scope.entralEntity.dataManipulator) {
                  var manipulatedData = [data];
                  $scope.entralEntity.dataManipulator(manipulatedData);
                  for (var i = 0; i < manipulatedData.length; i++) {
                    obj = manipulatedData[i];
                    $scope.insertNewItemToList($scope.entralEntity, obj);
                  }
                }
                else {
                  obj = data;
                  $scope.insertNewItemToList($scope.entralEntity, obj);
                }

                $scope.entralEntity.refreshFilteredList(true);
                if (obj) {
                  $scope.entralEntity.setCurrentSelectedItem(obj);
                }
              }
              setContextIdAndName(data);
            }
          }

          function processError(data) {
          }
        };
        $scope.attach = function (attachAction) {
          attachAction();
        };
        $scope.setSelectedView = function (acFuncName) {
          if ($scope.$root.isDirtyEntity) {
            $scope.dirtySelectedView = acFuncName;
          } else {
            $scope.selectedView = acFuncName;
          }
        };
        $scope.setParentMenu = function (parentMenuItem) {
          if ($scope.$parent.isActive) {
            $scope.$parent.isActive(parentMenuItem);
          }
        }
        $scope.$root.unSavedChanges = function (unSavedChangesObj, isSaveAction) {//leaveAction, toState
          var preventNavigation = false;
          if (!$scope.$root.isDirtyEntity) { // Case Not Dirty
            runAction(unSavedChangesObj.leaveAction);
          }
          else if (!$scope.$root.isModalOpen) {// Case Dirty + Modal is not open
            $scope.$root.isModalOpen = true;
            var modalInstance = mmModal.open({
              templateUrl: './infra/infraModalMessages/unSavedChanges/views/mmUnSavedChanges.html',
              controller: 'mmDiscardDialogCtrl',
              title: "Are you sure you want to leave this page?",
              modalWidth: 420,
              bodyHeight: 86,
              discardButton: { name: "Stay on this page", funcName: "cancel" },
              confirmButton: { name: "Leave this page", funcName: "discard"}
            });
            preventNavigation = modalInstance.result.then(function () { // Case Leave View
              $scope.$root.isModalOpen = false;
              runAction(unSavedChangesObj.leaveAction);
              $scope.$root.isDirtyEntity = false; // ***Should be after runAction()!!!***
              if (unSavedChangesObj.toState) {
                $state.go(unSavedChangesObj.toState.name, unSavedChangesObj.toParams);
              }
            }, function () { // Case stay
              $scope.$root.isModalOpen = false;
            });
            return true;
          }
          return preventNavigation;
        };
        if ($scope.entralEntity != undefined) {
          $scope.editMultiplequantity = _.filter($scope.entralEntity.centralList, {'isSelected': true}).length;
        }
        else if($state.params && Object.keys($state.params).length > 1){
          var comparedParameter;
          for(var key in $state.params) {
            if(comparedParameter && comparedParameter + 's' === key){
              var stateParams = $state.params[key];
              var res = stateParams.split(",");
              if(res instanceof Array) {
                $scope.editMultiplequantity = res.length;
              }
            }
            comparedParameter = key
          }
        }

        var actionWatch = $scope.$watch('$parent.entityActions', function (newValue, oldValue) {
          if ($scope.entityActions && $scope.entityActions.length > 0) {
            $scope.entityLayoutButtons = $scope.entityLayoutButtons.concat($scope.entityActions);
          }

          if (!$scope.mapViewToName && $scope.entityActions && $scope.entityActions.length > 0) {
            $scope.mapViewToName = {};
            var stop = $scope.entityActions.length;
            for (var i = 0; i < stop; i++) {
              var entity = $scope.entityActions[i];
              var views = entity.views;
              var name = entity.name.trim().toLowerCase();
              if (views) {
                var viewsStop = views.length;
                for (var j = 0; j < viewsStop; j++) {
                  $scope.mapViewToName[views[j].ref] = name;
                }
              }
              var ref = entity.ref;
              if (ref) {
                $scope.mapViewToName[ref] = name;
              }
            }
          }
          if ($scope.mapViewToName) {
            $scope.selectedView = $scope.mapViewToName[$state.current.name];
          }
        });

        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
          var callBack = function () {
            return function () {
              $scope.selectedView = ($scope.mapViewToName) ? $scope.mapViewToName[toState.name] : '';
              $scope.$root.alerts.error = [];
              if (addedButtons) {
                for (var i = 0; i < addedButtons.length; i++) {
                  $scope.entityLayoutButtons = _.without($scope.entityLayoutButtons, addedButtons[i]);
                }
                addedButtons = [];
              }
              $scope.entityLayoutInfraButtons = [];
              $scope.entityLayoutAdditionalInfraButtons = [];
            }
          }
          var leaveAction = callBack();
          var unSavedChangesObj = {toState: toState, toParams: toParams, leaveAction: leaveAction};
          var preventNavigation = $scope.$root.unSavedChanges(unSavedChangesObj, false);
          if (preventNavigation) {
            event.preventDefault();
          }
        });
        //ToDo: check if we can get entityId or
        //ToDo: check if we have a EC2REST object - then we can pass the new get call for this entity

        var watcher = $scope.$watch('entityId', function (newValue, oldValue) {
          if ($scope.$root.alerts) {
            $scope.$root.alerts.error = [];
          }
          if ($scope.entralEntity) {
            $scope.mainEntityType = $scope.entityType;
            $scope.entityMetaData = entityMetaData[$scope.entityType];
            $scope.mainEntity = $scope.entralEntity.selectedItem;
            setContextIdAndName($scope.mainEntity);
						$scope.editMultiplequantity = _.filter($scope.entralEntity.centralList, {'isSelected': true}).length;
						if($scope.entralEntity.goToManipulator){
							$scope.entralEntity.goToManipulator($scope.mainEntity);
						}
          }
          else if ($scope.entityMetaData !== undefined && newValue != undefined && newValue.length > 0) {
            $scope.$root.hidePage = true;
            if (newValue.indexOf('.') > -1) {
              newValue = newValue.split('.')[0];
            }
            $scope.mainEntityType = $scope.entityType;
            $scope.entityMetaData = entityMetaData[$scope.entityType];

            var serverEntity = EC2Restangular.one($scope.entityMetaData.restPath, newValue);
            serverEntity.get().then(function (entity) {
                if(entity.accessLevel && entity.accessLevel == 'Basic'){
                  $state.go('spa.accessDenied');
                }
                else{
                  $scope.mainEntity = entity;
                  $scope.childModel = entity;
                  setContextIdAndName($scope.mainEntity);
                  if($scope.entityId &&  $scope.entityType){
                    mmContextService.addContextItem($scope.entityId, $scope.entityType, $scope.mainEntity.name);
                  }
                }
                $scope.$root.hidePage = false;
              },
              function (response) {
                $scope.$root.hidePage = false;
                //TODO: add check by status code when server done
                if((response.data != null) &&(response.data.error != null) && response.data.error.errors){
                  if(response.data.error.errors != undefined && response.data.error.errors[0] != undefined && response.data.error.errors[0].innerMessage.indexOf("does not exists or insufficient privileges") > -1) {
                    $state.go('spa.accessDenied');
                  }
                }
                else{
                  console.log('ohh no!');
                  console.log(response);
                }
              });
          }
          else {
            if ($scope.entralEntity) {
              $scope.parentSelectedItem = $scope.entralEntity.parentSelectedItem;
            }

            $scope.mainEntity = null;
          }
        });

        function setContextIdAndName(contextEntity) {
          if (contextEntity) {
            $scope.contextEntityInfo.name = contextEntity.name || "";
            $scope.contextEntityInfo.id = contextEntity.id || "";
          }
        }

        function openHistory(){
          if($scope.entityType  && $scope.entityId){
            var type= entityMetaData[$scope.entityType].restPath;
            type = type.charAt(0).toUpperCase() + type.slice(1, type.length-1);
            mmModal.open({
              templateUrl: './infra/views/mmHistory.html',
              controller: 'mmHistoryCtrl',
              title: "History",
              modalWidth: screen.width - 300,
              bodyHeight: screen.height - 260,
              confirmButton: { name: "Close", funcName: "cancel", isPrimary: true},
              discardButton: { name: "Close", funcName: "cancel" ,hide:true},
              resolve: {
                obj: function() {
                  return EC2Restangular.all('history/entityhistory?id=' + $scope.entityId + '&type=' + type).withHttpConfig({cache: false}).getList();
                }
              }
            });
          }
        }

        $scope.$root.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
          if(from.type && to.type == from.type){
            mmContextService.tryRemoveContextItem(from.type);
          }
        });

        $scope.$on('$destroy', function () {
          if (watcher) {
            watcher();
          }
          if (actionWatch) {
            actionWatch();
          }
        });
      }]
  };
});
