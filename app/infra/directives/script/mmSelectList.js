/**
 * Created by rotem.perets on 10/27/14.
 */
app.directive('mmSelectList', [function () {
    return {
      restrict: 'E',
      scope: {
        mmModel: '=',
        mmDataModel: '=',
        mmForceInit: '=',
        mmChange: "&",
        mmId:"@",
				mmModelType: "@"
      },
      templateUrl: 'infra/directives/views/mmSelectList.html',
      controller: ['$scope', '$element', '$timeout', 'mmUtils', 'infraEnums', '$filter', 'EC2Restangular', '$q',
        function ($scope, $element, $timeout, mmUtils, infraEnums, $filter, EC2Restangular, $q) {

          $scope.mmSaveFullObject = ($element.attr('mm-save-full-object') !== undefined);
          $scope.mmOptionId = ($element.attr('mm-option-id') !== undefined) ? $element.attr('mm-option-id') : 'id';
          $scope.mmOptionName = ($element.attr('mm-option-name') !== undefined) ? $element.attr('mm-option-name') : 'name';
          $scope.mmOptionType = ($element.attr('mm-option-type') !== undefined) ? $element.attr('mm-option-type') : 'type';
          $scope.mmAvailableTitle = ($element.attr('mm-available-title') !== undefined) ? $element.attr('mm-available-title').toUpperCase() : 'TOTAL ITEMS';
          $scope.mmShowType = ($element.attr('mm-show-type') !== undefined) ? true : false;
					$scope.mmShowSearchBox = ($element.attr('show-search-box') !== undefined);
					$scope.searchBox = {};
					$scope.searchBox.text = '';
          $scope.filtered = [];
          $scope.indexed = [];
					$scope.scrollAmount = 20;
          $scope.typedModel = [];
          $scope.selectedAvailableItemsCounter = 0;
					$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.selectlist.toLowerCase(), $scope.mmModelType, $scope.mmId);
					$scope.mmIdSearch = $scope.mmId + 'Search';
					$scope.searchPlaceHolder = $scope.mmModelType ?
						"Search For " + $scope.mmModelType[0].toUpperCase() + $scope.mmModelType.slice(1,$scope.mmModelType.length) + 's...' : "Search For items...";

          var timeOut,
						isModelInit = false;

					function mmModelChange() {
            timeOut = $timeout(function () {
              $scope.mmChange();
            }, 100);
          }

          function createIndex(data) {
            if(data){
							for (var i = 0; i < data.length; i++) {
								if(!$scope.indexed[data[i][$scope.mmOptionId]]){
									$scope.indexed[data[i][$scope.mmOptionId]] = data[i][$scope.mmOptionName];
								}
							}
						}else{
							for (var j = 0; j < $scope.mmDataModel.length; j++) {
								$scope.indexed[$scope.mmDataModel[j][$scope.mmOptionId]] = $scope.mmDataModel[j][$scope.mmOptionName];
							}
						}

            $scope.filtered = $scope.mmDataModel;
          }

          function createIndexWithType(data) {
						if(data){
							for (var i = 0; i < data.length; i++) {
								if(!$scope.indexed[data[i][$scope.mmOptionId]]){
									$scope.indexed[data[i][$scope.mmOptionId]] =
									{
										name: data[i][$scope.mmOptionName],
										type: data[i][$scope.mmOptionType]
									};
								}
							}
						}else {
							for (var k = 0; k < $scope.mmDataModel.length; k++) {
								$scope.indexed[$scope.mmDataModel[k][$scope.mmOptionId]] =
								{
									name: $scope.mmDataModel[k][$scope.mmOptionName],
									type: $scope.mmDataModel[k][$scope.mmOptionType]
								};
							}
						}

            $scope.filtered = $scope.mmDataModel;
          }

					//needed due to the new fetch data we are doing, every readNext, need to index the new entities
					function addDataToIndex(data){
						if ($scope.mmShowType) {
							createIndexWithType(data);
						} else {
							createIndex(data);
						}
						createTypedModel();
						if(!$scope.mmModel.fullObjects){
							$scope.mmModel.fullObjects = {};
						}
					}

          function createTypedModel() {
            $scope.selectedAvailableItemsCounter = 0;
            if (!$scope.mmShowType) {
              _.forEach($scope.mmDataModel, function (item) {
                if ($scope.mmModel.indexOf(item.id) != -1) {
                  $scope.selectedAvailableItemsCounter++;
                }
              });
            } else {
              $scope.typedModel = [];
              var selectedItems = [];
              _.forEach($scope.mmDataModel, function (item) {
                if ($scope.mmModel.indexOf(item.id) != -1) {
                  $scope.selectedAvailableItemsCounter++;
                  selectedItems.push(item);
                }
              });

              var types = [];
              _.forEach(_.uniq(selectedItems, $scope.mmOptionType), function (item) {
                types.push(item.type);
              });

              _.forEach(types, function (type) {
                $scope.typedModel.push({rowType: 'title', name: type});
                var itemsToAdd = [];
                _.forEach(selectedItems, function (selectedItem) {
                  if (selectedItem[$scope.mmOptionType] == type) {
                    itemsToAdd.push(selectedItem);
                  }
                });

                _.forEach(itemsToAdd, function (item) {
                  item.rowType = 'row';
                  $scope.typedModel.push(item);
                });
              });
            }
            mmModelChange();
          }

					function getEntitiesById(){
						if($scope.mmModel && $scope.mmModel.length > 0){
							$scope.mmModel.forEach(function(id){
								$scope.getNameById(id);
							});
							isModelInit = true;
						}
					}

					/**
					 * Get name by id from the indexed items, if item is not exist in the index object, fetch the item from the server and add it to the index and to the mmDataModel
					 */
					$scope.getNameById = function (id) {
						if(!id) return;
						//if id already indexed
						if (id && $scope.indexed[id] && $scope.indexed[id] != id) {
							return;
						}
						//need to get entity by id
						if($scope.mmDataModel && $scope.mmDataModel.length > 1){
							$scope.mmDataModel.get(id).then(function(entity){
								var where = {};
								where[$scope.mmOptionId] = entity[$scope.mmOptionId];
								if (!_.find($scope.mmDataModel, where)) {
									$scope.mmDataModel.unshift(entity);
								}
								var arr = [];
								arr.push(entity);
								addDataToIndex(arr);
								createTypedModel();
								if(!$scope.mmModel.fullObjects){
									$scope.mmModel.fullObjects = {};
								}
							},function(){
								//add fake entity: {id : id, name : id} to avoid having selected item that can't be display (missing mmOptionName)
								var where = {};
								where[$scope.mmOptionId] = id;
								where[$scope.mmOptionName] = id;
								if (!_.find($scope.mmDataModel, where)) {
									$scope.mmDataModel.unshift(where);
								}
								var arr = [];
								arr.push(where);
								addDataToIndex(where);
								createTypedModel();
								if(!$scope.mmModel.fullObjects){
									$scope.mmModel.fullObjects = {};
								}
								console.error("mmSelectList: failed to fetch entity with id: ", id);
							});
						}
					};

					/**
					 * Updates the available list, apply client side filter and then fetch additional items from the server.
					 */
					$scope.setDataModel = function(){
							var clientFilteredData = $filter('filter')($scope.mmDataModel, $scope.searchBox.text);
							if (!!$scope.mmDataModel.getList) {
								var params = $scope.mmDataModel.lastRequestParams || $scope.mmDataModel.reqParams || {};
								params['q'] = $scope.searchBox.text;
								if($scope.searchBox.text != ''){
									params['from'] = 0;
								}
								$scope.mmDataModel.getList(params).then(function(newResponse){
									for(var i = clientFilteredData.length - 1; i > 0; i--){
										var where = {};
										where[$scope.mmOptionId] = clientFilteredData[i][$scope.mmOptionId];
										if (!_.find(newResponse, where)) {
											newResponse.unshift(clientFilteredData[i]);
										}
									}

									$scope.mmDataModel.length = 0;
									newResponse.forEach(function(item){
										$scope.mmDataModel.push(item);
									});

									addDataToIndex($scope.filtered);
									if(!$scope.mmModel.fullObjects){
										$scope.mmModel.fullObjects = {};
									}
								});
							}
					};

					//select list events - beginning
					$scope.availableItemsScroll = function () {
						if ($scope.scrollAmount < $scope.filtered.length){
							$scope.scrollAmount += EC2Restangular.readNextPageSize;
						}
						if ($scope.filtered.hasNext && $scope.filtered.readNext){
							if ($scope.filtered.hasNext() && $scope.scrollAmount >= $scope.filtered.length - EC2Restangular.readNextPageSize && !$scope.filtered.isReading){
								if (!$scope.filtered.isReading){
									$scope.filtered.isReading = true;
									$scope.filtered.readNext(true).finally(function() {
										addDataToIndex($scope.filtered);
										$scope.mmDataModel = $scope.filtered;
										$scope.filtered.isReading = false;
									});
								}
							}
						}
					};

					$scope.itemSelected = function (item) {
            var id = item[$scope.mmOptionId];
            $scope.$root.isDirtyEntity = true;
            if ($scope.mmModel.indexOf(id) > -1) {
              $scope.mmModel.splice($scope.mmModel.indexOf(id), 1);
              if($scope.mmSaveFullObject){
                delete $scope.mmModel.fullObjects[id];
              }
            } else {
              $scope.mmModel.push(id);
              if($scope.mmSaveFullObject) {
                $scope.mmModel.fullObjects[id] = item;
              }
            }
            createTypedModel();
          };

					$scope.removeItem = function (id) {
            if ($scope.mmModel.indexOf(id) > -1) {
              $scope.mmModel.splice($scope.mmModel.indexOf(id), 1);
              if($scope.mmSaveFullObject) {
                delete $scope.mmModel.fullObjects[id];
              }
            } else {
              $scope.mmModel.push(id);
            }
            $scope.filtered = $scope.mmDataModel;
            $scope.$root.isDirtyEntity = true;
            createTypedModel();
          };

					$scope.selectAll = function () {
            $scope.$root.isDirtyEntity = true;
            $scope.mmModel.length = 0;
            $scope.mmDataModel.forEach(function (item) {
              $scope.mmModel.push(item.id);
              if($scope.mmSaveFullObject) {
                $scope.mmModel.fullObjects[item.id] = item;
              }
            });
            createTypedModel();
          };

					$scope.removeAll = function () {
            $scope.$root.isDirtyEntity = true;
            if($scope.mmSaveFullObject) {
              for(var i = 0; i < $scope.mmModel.length - 1; i++){
                delete $scope.mmModel.fullObjects[$scope.mmModel[i]];
              }
            }
            $scope.mmModel.length = 0;
            createTypedModel();
          };

					var timeout;
					$scope.filterDataModel = function(){
						$timeout.cancel(timeout);
						timeout = $timeout(function() {
							$scope.setDataModel();
						}, 300);
					};

					//needed for the case when mmModel is being set after mmSelectLst has been initialize
					//and the there is a chance where mmModel ids are not exist in the mmDataModel, we need to retrieve entity by id
					var watcher3 = $scope.$watch('mmModel.length', function (newVal, oldVal) {
						//if (!!newVal){
							//if(!isModelInit){
								getEntitiesById();
							//}
						//}
					});

          var watcher2 = $scope.$watch('mmDataModel', function (newVal, oldVal) {
            if (!!newVal && ($scope.mmForceInit === undefined || $scope.mmForceInit === true))
							initControl();
          });

          var watcher = $scope.$watch('mmForceInit', function (newVal, oldVal) {
            if (!!newVal) {
							initControl();
							getEntitiesById();
            }
          });

          function initControl(){
            if ($scope.mmShowType) {
              createIndexWithType();
            } else {
              createIndex();
            }
            createTypedModel();
            if(!$scope.mmModel.fullObjects){
              $scope.mmModel.fullObjects = {};
            }
          }

          $scope.$on('$destroy', function () {
            if (watcher) watcher();
						if (watcher2) watcher2();
						if (watcher3) watcher3();
            $timeout.cancel(timeOut);
						if($scope.mmDataModel) $scope.mmDataModel = null;;
						if($scope.mmModel) $scope.mmModel = null;
						if($scope.filtered) $scope.filtered = null;
						if($scope.indexed) $scope.indexed = null;
          });
        }]
    }
  }]
);
