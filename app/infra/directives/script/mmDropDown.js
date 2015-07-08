/**
 * Created by rotem.perets on 5/13/14.
 */
app.directive('mmDropDown',[function(){
  return {
    restrict: 'E',
    scope: {
      mmClass: "@",
      mmMinWidth:'@',
      mmError: '=?',
      mmModel: "=?",
      mmDataModel: '=?',
      mmCaption: '@',
      mmHideLabel: "@",
      mmCloseModeClass: "@",
      mmSelectChangeFunc: "&",
      mmAutoPreSelectChangeFunc: "&",
      mmIsRequired: "@",
      mmIsEditMode: "=?",
      mmShowAsLabel: "=?",
      mmDisable: "=?",
      textTooltip: '@',
      mmIsLink: "=?",
      mmEntityType: "@",
      lazyType: '=?',
      lazyParams: '=?',
      mmEditMultiple: "=?",
      mmLabelWidth: "@",
      mmLayoutType: '@',
      mmCustomControlWidth: "@",
      mmCustomModelText :"=?",
      entityObj: "=?",
      newEntityType: "@",
      mmTabIndex: "@",
      mmReturnFullObject: '=',
      mmCustomLabelPadding: "@",
      mmShowAddNew: '=?',
      mmId:"@",
      inGrid:"=",
      customLabel:"&"
    },
    template: function(scope, e){
      return (e.$attr.controlType === undefined || e.$$element.attr(e.$attr.controlType) == 'single')
        ? '<mm-singleselect control-type="single"></mm-singleselect>' : '<mm-multiselect control-type="multi"></mm-multiselect>';
    },
    controller: ['$scope', '$element', 'EC2Restangular', '$document', 'mmUtils', 'infraEnums', '$timeout', '$filter', '$q','$attrs',
      function ($scope, $element, EC2Restangular, $document, mmUtils, infraEnums, $timeout, $filter, $q,$attrs) {
        $scope.isCustomLabelDefined = angular.isDefined($attrs.customLabel) && angular.isFunction($scope.customLabel);
        $scope.lazyLoaded = false;
        $scope.scrollAmount = 20;
        $scope.mmShowAsLabel = !!$scope.mmShowAsLabel || !!$scope.mmIsLink;
        $scope.isShowControl = !$scope.mmShowAsLabel;
        $scope.mmAdditionalClass = "multiselect";
        $scope.controlType = ($element.attr('control-type') !== undefined) ? $element.attr('control-type') : 'single';
        $scope.mmIsMultiSelect = ($element.attr('allow-multi-select') !== undefined);
        $scope.mmOptionId = ($element.attr('mm-option-id') !== undefined) ? $element.attr('mm-option-id') : 'id';
        $scope.mmOptionName = ($element.attr('mm-option-name') !== undefined) ? $element.attr('mm-option-name') : 'name';
        $scope.mmShowSearchBox = ($element.attr('show-search-box') !== undefined);
        $scope.mmAddPleaseSelect = ($element.attr('mm-add-please-select') !== undefined);
        $scope.isAutoPreSelectFunctionSet = ($element.attr('mm-auto-pre-select-change-func') !== undefined);
        $scope.activateShield = !!$scope.inGrid;
				$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.dropdown.toLowerCase(), $scope.mmCaption, $scope.mmId);
				$scope.mmIdSearch = $scope.mmId + 'Search';
        $scope.mmIsLink = (!!$scope.mmIsLink) ? $scope.mmIsLink : false;
        $scope.isEditMultiple=($scope.mmEditMultiple !== undefined) ? $scope.mmEditMultiple : false;

        $scope.loadLazyType = function(){
          if($scope.lazyLoaded) return;

          if ($scope.lazyType){
            if(!$element.attr('mm-data-model')){
              $scope.mmDataModel = [];
            }
            var routeParts = $scope.lazyType.split('?');
            var routeParams = routeParts[1] ? routeParts[1].split('&') : [];
            var parmElm = {};
            for (var i = 0; i < routeParams.length; i++) {
              var param = routeParams[i].split('=');
              parmElm[param[0]] = param[1];
            }

            //var routeParts = $scope.lazyType.split('|');
            var serverEntity = EC2Restangular.all(routeParts[0]);

            if($scope.mmModel && typeof($scope.mmModel) == 'string'){
              getAllEntities(serverEntity, parmElm);
            }
            else {
              $scope.mmModelText = $scope.mmCustomModelText ? $scope.mmCustomModelText :'Please Select';
              getAllEntities(serverEntity, parmElm);
            }
            $scope.lazyLoaded = true;
          }
        }

        function getAllEntities(serverEntities, serverParams) {
          serverEntities.getList(serverParams).then(function (entities) {
            $scope.mmDataModel = entities;
            $scope.filtered = $scope.addPleaseSelect($scope.mmDataModel);
            $scope.setDataModel(false);
          }, function (response) {
            console.log('ohh no!');
            console.log(response);
          });
        }

        $scope.addPleaseSelect = function(dataModel){
          var addPleaseSelect = true;
          dataModel.forEach(function(item){
            if(item.id == null){
              addPleaseSelect = false;
            }
          });
          if(addPleaseSelect && $scope.mmAddPleaseSelect && dataModel[0].id !== null){
            var obj = {};
            obj[$scope.mmOptionId] = null;
            obj[$scope.mmOptionName] = 'Please Select';
            dataModel.unshift(obj);
          }
          return dataModel;
        }

				//add 'Please Select' (for cases where lazy load is not in use / no
				if($scope.mmAddPleaseSelect){
					var dataModel = [];
					if($scope.mmDataModel){
						dataModel = $scope.mmDataModel;
					}
					if(dataModel.length > 0)
						$scope.addPleaseSelect(dataModel);
				}

				$scope.setHover = function(isHover){
					$scope.buttonHover = isHover && !$scope.mmDisable && !$scope.isVisible;
					$scope.buttonHoverOpen = $scope.buttonHover;
				}

        $scope.changeControlVisibility = function(shouldShow){
          if(shouldShow){
            $document.bind('click', handleDocumentClick);
            $scope.$root.currentDropDownId = $scope.mmId;
          } else {
            $document.off('click', handleDocumentClick);
            if($scope.searchBox.text != ""){
              $scope.searchBox.text = "";
              $scope.setDataModel(true);
            }
          }

          $scope.isVisible = shouldShow;
          $scope.isShowControl = shouldShow || !$scope.mmShowAsLabel;
          $scope.buttonHoverOpen = shouldShow;
          $scope.buttonHover = shouldShow;
        }

        //drop down events - beginning
        $scope.dropDownScroll = function () {
          if ($scope.scrollAmount < $scope.filtered.length){
            $scope.scrollAmount += EC2Restangular.readNextPageSize;
          }
          if ($scope.filtered.hasNext && $scope.filtered.readNext){
            if ($scope.filtered.hasNext() && $scope.scrollAmount >= $scope.filtered.length - EC2Restangular.readNextPageSize && !$scope.filtered.isReading){
							$scope.filtered.readNext(true).finally(function() {
								$scope.mmDataModel = $scope.filtered;
							});
            }
          }
        }

        $scope.isControlVisible = function(){
          return $scope.isShowControl;
        }

        var timeout;
        $scope.filterDataModel = function(){
          $timeout.cancel(timeout);
          timeout = $timeout(function() {
            $scope.setDataModel(true);
          }, 300);
        };

        var pleaseSelectAdded = false;
        /**
         * Updates the dropdown list, apply client side filter and then fetch additional items from the server.
         * @param isFiltered
         */
        $scope.setDataModel = function(isFiltered){
          var temp;
          if(isFiltered){
            temp = $filter('filter')($scope.mmDataModel, $scope.searchBox.text);
            if (!!$scope.mmDataModel.getList) {
              var currentTemp = temp;
              var params = $scope.mmDataModel.lastRequestParams || $scope.mmDataModel.reqParams || {};
              params['q'] = $scope.searchBox.text;
              if($scope.searchBox.text != ''){
                params['from'] = 0;
              }
              temp = $scope.mmDataModel.getList(params).then(function(newResponse){
                for(var i = currentTemp.length - 1; i > 0; i--){
                  var where = {};
                  where[$scope.mmOptionId] = currentTemp[i][$scope.mmOptionId];
                  if (!_.find(newResponse, where)) {
                    newResponse.unshift(currentTemp[i]);
                  }
                }

                $scope.mmDataModel.length = 0;
                newResponse.forEach(function(item){
                  $scope.mmDataModel.push(item);
                });
                newResponse = $scope.addPleaseSelect($scope.mmDataModel);
                return newResponse;
              });
            }
          }else{
            temp = $scope.mmDataModel;
          }

          var autoSelect = temp && temp.length == 1;
          var pleaseAddAddition = ($scope.mmAddPleaseSelect && !pleaseSelectAdded) ? 30 : 0;
          pleaseSelectAdded = true;

          $q.when(temp).then(function(values) {
            $scope.$broadcast('central:Scrollbar:scroll-top');
            if (!!values) {
              var val = ((Math.min(8, values.length) * 30) + pleaseAddAddition);
              $scope.minHeight = val + 'px';
            }
            $scope.filtered = values;
            $scope.currentIndex = -1;
            if(autoSelect){
              if ($scope.mmReturnFullObject) {
                $scope.mmModel.name = temp[0][$scope.mmOptionName];
                $scope.mmModel.id = temp[0][$scope.mmOptionId];
              }
              else {
                $scope.mmModel = temp[0][$scope.mmOptionId];
              }
            }
          });
        };

        $element.bind('click', function(event) {
          event.stopPropagation();
          $document.click();
        });

        $scope.hideCtrl = function(e){
          handleDocumentClick(e);
        }

        function handleDocumentClick(event){
          event.stopPropagation();
          if($scope.$root){
            if($scope.$root.currentDropDownId != $scope.mmId){
              $scope.changeControlVisibility(false);
              $scope.$digest();
            } else {
              $scope.$root.currentDropDownId = "";
            }
          }
        }
        $scope.$watch('lazyType', function (newValue, oldValue) {
          if (newValue != oldValue && newValue != undefined){
            $scope.lazyLoaded = false;
            $scope.loadLazyType();
          }
        });
        $scope.$on('$destroy', function() {
          $element.off('click');
        });
      }
    ]
  }
}]);
