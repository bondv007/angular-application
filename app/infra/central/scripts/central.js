/**
 * Created by liron.tagger on 1/6/14.
 */
'use strict'

app.directive('central', function () {
	return {
		restrict: 'AE',
		templateUrl: 'infra/central/views/central.html',
		link: function(scope, elm, attrs) {
			if (angular.isUndefined(attrs.centralDataObject)) throw new Error('central-data-object attribute is required.');
		},
		controller: ['$scope', '$filter', 'entityMetaData', 'userSettingsService', 'EC2Restangular', '$state', '$timeout', 'enums', '$q', 'infraEnums', 'mmSession',
			function ($scope, $filter, entityMetaData, userSettingsService, EC2Restangular, $state, $timeout, enums, $q, infraEnums, mmSession) {
				var searchTimer = null;
				var timeOut = null;
				var centralAbortRequest = $q.defer();

				$scope.displayData = { selectedShowBys: [], remainingShowBys: [], shouldOpenEntral: false };
				$scope.enums = enums;
				$scope.showCentralSpinner = true;

				/**
				 * This method validates the provided obj and checks if it's a valid central data obj,
				 * in case the provided parameter is valid, will return true.
				 * Otherwise, raises an exception.
				 */
				function validateCentralDataObject(centralDataObj) {
					if (!angular.isArray(centralDataObj)) throw new Error("'centralDataObj' must be an array");
					if (centralDataObj.length === 0) throw new Error("'centralDataObj' must include atleast one object");
					// TODO - validate the intral structure of each object in the array
				};

				//central events - beginning
        $scope.centralScroll = function (dataObj) {
					if (dataObj.scrollAmount < dataObj.centralList.length){
						dataObj.scrollAmount += EC2Restangular.readNextPageSize;
					}
					if (dataObj.centralList.hasNext && dataObj.centralList.readNext){
						if (dataObj.centralList.hasNext() && dataObj.scrollAmount >= dataObj.centralList.length - EC2Restangular.readNextPageSize){
							if (!dataObj.centralList.isReading){
								dataObj.centralList.isReading = true;
								dataObj.centralList.readNext(true, dataObj.dataManipulator).finally(function() {
									dataObj.filteredList = dataObj.centralList;
									dataObj.centralList.isReading = false;
								});
							}
						}
					}
				};
				$scope.centralGroupByScroll = function (groupByList) {
					if (groupByList.hasNext && groupByList.readNext){
						if (groupByList.hasNext()){
//							$scope.showCentralSpinner = true;
							groupByList.readNext(true, null).finally(function() {
//								$scope.showCentralSpinner = false;
							});
						}
					}
				};
				$scope.centralArrowMove = function (isUp) {
					if ($scope.displayData.dataObj && $scope.displayData.currentSelectedItem) {
						for (var i = 0; i < $scope.displayData.dataObj.filteredList.length; i++) {
							if ($scope.displayData.currentSelectedItem == $scope.displayData.dataObj.filteredList[i]) {
								var index = isUp ? i - 1 : i + 1;
								if (index >= 0 && index < $scope.displayData.dataObj.filteredList.length) {
									(function (i) {
										timeOut = $timeout(function () {
											var item = $scope.displayData.dataObj.filteredList[i];
											$scope.displayData.currentSelectedItem = item;
											$scope.selectGridRow($scope.displayData.dataObj.indexLocation, item);
										}, 1);
									})(index);
									break;
								}
							}
						}
					}
				};
				$scope.centralActionInvoke = function (acFunc, list) {
					var func = acFunc.func;
					if (!acFunc.disable && func) {
						var selectedItems = $scope.displayData.dataObj.selectedItems;
//						var selectedItems = $filter('filter')(list, {isSelected: true});
						func(list, selectedItems);
					}
				};
				$scope.centralCopyAction = {
					dragStart: function (event) {
						var ghostElm = event.elements.dragging.find('.angular-ui-tree-node').clone().addClass('angular-ui-tree-ghost');
						event.elements.placeholder.after(ghostElm);
						event.source.nodeScope.$modelValue.from = "central";
						ghostElm = null;
					},
					dropped: function (event) {
						var elm = angular.copy(event.source.nodeScope.$modelValue);
						var arr = event.source.nodesScope.$modelValue;
						if (_.findIndex(arr, {'id': elm.id }) < 0) {
							arr.push(elm);
						}
						if (_.isFunction(event.dest.nodesScope.centralDropEvent)) {
							event.dest.nodesScope.centralDropEvent(event);
						}
					}
				};
				//central events - end

				//central views - beginning
				$scope.addRemoveCentralColumn = function (index, shouldAdd) {
					if (shouldAdd) {
						var containsColumn = _.contains($scope.displayData.selectedShowBys, index);
						if (!containsColumn) {
							$scope.displayData.selectedShowBys.push(index);
							//remove to enable column position change
							$scope.displayData.selectedShowBys = _.sortBy($scope.displayData.selectedShowBys);
							$scope.displayData.remainingShowBys = _.without($scope.displayData.remainingShowBys, index);
						}
					}
					else {
						$scope.displayData.remainingShowBys.push(index);
						$scope.displayData.selectedShowBys = _.without($scope.displayData.selectedShowBys, index);
					}
				};
				$scope.closeEntral = function  () {
					var callBack = function () {
						return function () {
							$scope.displayData.showEdit = false;
						}
					};

					var leaveAction = callBack();
					var unSavedChangesObj = { leaveAction:leaveAction };
					$scope.$root.unSavedChanges(unSavedChangesObj, false);
				};
				$scope.addNewEntity = function(){
					if ($scope.displayData && $scope.displayData.dataObj){
						$scope.displayData.dataObj.selectedItem = null;
					}

					$scope.removeSelectedItems(null, null);
					$scope.displayData.isSelectedItem = true;
					$scope.displayData.currentSelectedItem = null;
					$scope.editEntity(true);
				};
				$scope.addNewSubEntity = function () {
					var childDataObj = $scope.centralDataObject[$scope.displayData.dataObj.addSubEntity.index];
					childDataObj.selectedItem = null;
					$scope.removeSelectedItems(null, null);
					$scope.displayData.dataObj = childDataObj;
					$scope.displayData.isSelectedItem = true;
					$scope.displayData.currentSelectedItem = null;
					$scope.editEntity(true);
				};
				$scope.addNewEntityFullPage = function(){
					if ($scope.displayData != null && $scope.displayData.dataObj != null){
						var params = $state.params || {};
						$state.go($scope.displayData.dataObj.newPageURL, params);
					}
				};
				$scope.editEntity = function (fromAddFunction){
					if (fromAddFunction || hasSelected($scope.displayData.dataObj.filteredList)){
						$scope.displayData.showEdit = true;
					}
				};

				$scope.goToFullPage = function(){
					if ($scope.displayData != null && $scope.displayData.dataObj != null){
						var params = $state.params || {};
						params[$scope.displayData.dataObj.foreignKey] = $scope.displayData.currentSelectedItem ? $scope.displayData.currentSelectedItem.id : '';
						var selectedRows = $filter('filter')($scope.displayData.dataObj.filteredList, {isSelected:true});
						if(selectedRows){
							var rowsIds = _.pluck(selectedRows,'id');
							if(rowsIds){
								params[$scope.displayData.dataObj.foreignKey + 's'] = rowsIds;
							}
						}
						$state.go($scope.displayData.dataObj.editPageURL, params);
					}
				};
				//central views - end

				//central row selection - beginning
				$scope.selectGridRow = function(index, item){
					var callBack = function (funcIndex, funcItem) {
						return function () {
							var selectedArr = $scope.displayData.selectedShowBys;
							var selectedColumnIndex = _.indexOf($scope.displayData.selectedShowBys, funcIndex);
							var index = selectedArr[selectedColumnIndex];
							var dataObj = $scope.centralDataObject[index];

              dataObj.isAllSelected = false;
							$scope.removeSelectedItems(null, null);
							selectItem(dataObj, funcItem);
							openEntralOnSelection(dataObj, funcItem);
						}
					};

					var leaveAction = callBack(index, item);
					var unSavedChangesObj = { leaveAction:leaveAction };
					if($scope.$root.unSavedChanges){
						$scope.$root.unSavedChanges(unSavedChangesObj, true);
					}
				};

				$scope.markAllDataObjItems = function (dataObj) {
					dataObj.isAllSelected = !dataObj.isAllSelected;
					$scope.removeSelectedItems(dataObj, null);
					$scope.displayData.dataObj = dataObj;
					for (var i = 0; i < dataObj.centralList.length; i++) {
						dataObj.centralList[i].isSelected = dataObj.isAllSelected;
					}
          dataObj.selectedItems = (dataObj.isAllSelected) ? angular.copy(dataObj.filteredList) : [];
					$scope.changeButtonsState(dataObj);
				};
				//central row selection - end

				//central search/orderBy/group options - beginning
				$scope.changeStringFilter = function(index){
					if (searchTimer) $timeout.cancel(searchTimer);
					$scope.centralDataObject[index].showCentralSpinner = true;
					searchTimer = $timeout(function () {
						var dataObj = $scope.centralDataObject[index];

						var filters = addRestFilters(dataObj);
						filters.from = 0;
						filters.max = EC2Restangular.pageSize;
						filters['q'] = dataObj.filterByText;

						getListFromServer(dataObj, filters, true);
						dataObj.showCentralSpinner = false;
					}, 500);
				};
				$scope.centralOrderBy = function (dataObj, colKey, setLocalStorage) {
					dataObj.orderedBy = colKey;
					dataObj.orderedByDescending = !dataObj.orderedByDescending;
					if (setLocalStorage){
						mmSession.set(dataObj.type + 'SortBy', dataObj.orderedBy, mmSession.storage.disk);
						mmSession.set(dataObj.type + 'SortByDesc', dataObj.orderedByDescending ? 'desc' : 'asc', mmSession.storage.disk);
					}

					var filters = addRestFilters(dataObj);
					filters['sort'] = dataObj.orderedBy;
					filters['order'] = dataObj.orderedByDescending ? 'desc' : 'asc';
					getListFromServer(dataObj, filters, false);
				};
				$scope.changeChildDataByGroupBy = function (dataObj, item) {
					var filters = addRestFilters(dataObj);
					dataObj.currentGroupItem = item;
					filters.from = 0;
					filters.max = EC2Restangular.pageSize;
					var foriegnKey = dataObj.listMetaData[dataObj.groupedList.memberName];
					filters[foriegnKey.key + 'Id'] = item.id;
					getListFromServer(dataObj, filters, true);
				};
				$scope.changeGroupOption = function (dataObj, groupedOption) {
					if (groupedOption == 'None') {
						dataObj.isGrouped = false;
						var filters = addRestFilters(dataObj);
						filters.from = 0;
						filters.max = EC2Restangular.pageSize;
						getListFromServer(dataObj, filters, true);
					}
					else {
						dataObj.isGrouped = true;
						dataObj.groupedFilter = 'All';
						dataObj.groupedList = { memberName: groupedOption, memberValues: null };
						setGroupedList(dataObj, groupedOption)
					}
				};
				//central search/orderBy/group options - end

				//central helper functions - beginning
				$scope.getColumnWidth = function(dataObj, col){
					return col.colWidth ? col.colWidth : (100 / (dataObj.gridData.columnDefs.length)) + '%';
				};
				$scope.addRemoveGridColumn = function(dataObj, availableColumn, colIndex){
					availableColumn.isVisible = !availableColumn.isVisible;
					var existingData = mmSession.get(dataObj.type + 'Columns');
					existingData = !existingData ? [] : existingData;
					var colUniqueName = dataObj.type + 'Central' + dataObj.listMetaData[colIndex].key.split('.').join('');

					if (availableColumn.isVisible){
						existingData.push(colIndex);
						var column = setColumnData(dataObj, colUniqueName, 0, colIndex);
						dataObj.gridData.columnDefs.push(column);
					}
					else {
						existingData = _.without(existingData, colIndex);
						_.remove(dataObj.gridData.columnDefs, {uniqueName: colUniqueName});
					}

					removeColumnsWidth(dataObj, dataObj.gridData.columnDefs);
					mmSession.set(dataObj.type + 'Columns', existingData, mmSession.storage.disk);
				};
				//central helper functions - end

				//central initialize data
				function initCentralDataObjectMembers(i) {
					var dataObj = $scope.centralDataObject[i];
					if (dataObj.type) {
						$scope.displayData.remainingShowBys.push(i);
						dataObj.centralMainEntityType = $scope.centralMainEntityType == dataObj.type;
						dataObj.selectedItems = [];
						var metaData = entityMetaData[dataObj.type];
						if (metaData) {
							addListToDataObject(dataObj, metaData);
							addAdditionalDataToDataObj(dataObj, metaData, dataObj.type, i);
						}
					}
					if (i == 0) {
						$scope.displayData.dataObj = dataObj;
					}

					$scope.changeButtonsState(dataObj);
				}
				function addAdditionalDataToDataObj(dataObj, metaData, type, index) {
					dataObj.isEditable = !!dataObj.isEditable;
					dataObj.shouldOpenEntral = !!dataObj.shouldOpenEntral;
					dataObj.foreignKey = metaData.foreignKey;
					dataObj.restPath = metaData.restPath;
					dataObj.name = metaData.name;
					dataObj.type = metaData.type;
					dataObj.title = metaData.title || 'name';
					dataObj.editPageURL = metaData.editPageURL;
					dataObj.searchColumns = metaData.searchColumns;
					dataObj.contextEntities = metaData.contextEntities;
					dataObj.newPageURL = metaData.newPageURL || metaData.editPageURL;
					dataObj.searchPlaceHolderText = metaData.searchPlaceHolderText;
					dataObj.listMetaData = metaData.metaData;
					dataObj.allowNewInEntral = metaData.allowNewInEntral || false;
					dataObj.allowEditInEntral = (metaData.allowEditInEntral == undefined) ? true : metaData.allowEditInEntral;
					dataObj.groupedListOptions = metaData.availableGroupedBy;
					dataObj.defualtColumns = dataObj.visibleColumns ? dataObj.visibleColumns : userSettingsService.getUserMetaData(type);
					dataObj.hideAllNone = index >= $scope.centralDataObject.length - 1;
					dataObj.indexLocation = index;
					dataObj.metaData = metaData;
					dataObj.scrollAmount = EC2Restangular.readNextPageSize;
					dataObj.hasSelectedItems = (function(obj){ return hasSelected(obj); })(dataObj);
					dataObj.openEntral = function(shouldOpen){ $scope.displayData.showEdit = !!shouldOpen; };
					dataObj.isEntralOpen = function(){ return $scope.displayData.showEdit; };
					dataObj.editPage = metaData.editPage;
					dataObj.filterByText = (index == 0 && $scope.$root.centralSearchTerm) ? $scope.$root.centralSearchTerm : '';
					$scope.$root.centralSearchTerm = '';
					dataObj.dragFunction = dataObj.isDraggable ? $scope.centralCopyAction : undefined;
					dataObj.removeNoDrag = dataObj.isDraggable ? undefined : false;

					addGridData(dataObj, false);
					shouldOpenEntral(dataObj);
				}
				function addGridData(dataObj, isDefaultView) {
					var columnDefs = [];
					var columnsSessionData = mmSession.get(dataObj.type + 'Columns');
					var columnsSizesSessionData = mmSession.get(dataObj.type + 'ColumnSizes', {});
					if (!columnsSessionData || isDefaultView){
						isDefaultView = true;
						mmSession.set(dataObj.type + 'Columns', dataObj.defualtColumns, mmSession.storage.disk);
					}

					var columnsList = isDefaultView ? dataObj.defualtColumns : columnsSessionData;
					setVisibleColumnsMarker(dataObj, columnsList);
					for (var i = 0; i < columnsList.length; i++) {
						var index = columnsList[i];
						if (dataObj.listMetaData[index]) {
							var colUniqueName = dataObj.type + 'Central' + dataObj.listMetaData[index].key.split('.').join('');
							var colHeader = setColumnData(dataObj, colUniqueName, columnsSizesSessionData[colUniqueName], index);
							columnDefs.push(colHeader);
						}
					}

					dataObj.gridData = { type: dataObj.type, columnDefs: columnDefs };
					if (isDefaultView){
						removeColumnsWidth(dataObj, dataObj.gridData.columnDefs);
						mmSession.remove(dataObj.type + 'ColumnSizes', mmSession.storage.disk);
					}
				}

				function setColumnData(dataObj, colUniqueName, colWidth, index){
					var column = {
						field: dataObj.listMetaData[index].key,
						displayName: dataObj.listMetaData[index].text,
						uniqueName: colUniqueName,
						type: dataObj.listMetaData[index].type,
						enumName: dataObj.listMetaData[index].enumName,
						isInner: dataObj.listMetaData[index].isInner,
						colWidth: colWidth
					};

					addColumnLinkData(dataObj, column, index);
					return column;
				}
				function addColumnLinkData(dataObj, column, index){
					if (dataObj.listMetaData[index].entityLink){
						if (!dataObj.listMetaData[index].isList){
							column['linkForeignKey'] = entityMetaData[dataObj.listMetaData[index].entityLink].foreignKey;
							column['linkTemplate'] = entityMetaData[dataObj.listMetaData[index].entityLink].editPageURL;
							column['linkForeignKeyValue'] = dataObj.listMetaData[index].linkKeyParams;
						}
						else
						{
							var linkForeignKey = entityMetaData[dataObj.listMetaData[index].entityLink].contextKey;
							var listPageURL = entityMetaData[dataObj.listMetaData[index].entityLink].listPageURL;
							if (!linkForeignKey){
								linkForeignKey = entityMetaData[dataObj.listMetaData[index].entityLink].contextEntities[dataObj.type].key
							}
							if(entityMetaData[dataObj.listMetaData[index].entityLink].contextEntities &&
								entityMetaData[dataObj.listMetaData[index].entityLink].contextEntities[dataObj.type]){
								listPageURL = entityMetaData[dataObj.listMetaData[index].entityLink].contextEntities[dataObj.type].listPageURL;
							}

							column['linkForeignKey'] = linkForeignKey;
							column['linkTemplate'] = listPageURL;
							column['linkForeignKeyValue'] = dataObj.listMetaData[index].linkKeyParams;
						}
					}
				}
				//central initialize data - end

				//central columns selections
				function setVisibleColumnsMarker(dataObj, columnsSessionData){
					for (var i = 0; i < dataObj.listMetaData.length; i++) {
						dataObj.listMetaData[i].isVisible = _.indexOf(columnsSessionData, i) > -1;
					}
				}
				function removeColumnsWidth(dataObj, columns){
					mmSession.remove(dataObj.type + 'ColumnSizes', mmSession.storage.disk);
					for (var i = 0; i < columns.length; i++) {
						var col = columns[i];
						col.colWidth = null;
					}
				}
				//central columns selections - end

				//row selection
				function hasSelected(list) {
					var selected = false;
					if (list && list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							if (list[i].isSelected) {
								selected = true;
								break;
							}
						}
					}

					return selected;
				}
				$scope.setSelectionInColumn = function(dataObj, item) {
					if (item) {
						dataObj.selectedItem = item;
						$scope.displayData.isSelectedItem = true;
						var childObjIndex =  dataObj.indexLocation + 1;
						if (childObjIndex < $scope.displayData.selectedShowBys.length) {
							var childIndex = $scope.displayData.selectedShowBys[childObjIndex];
							var childDataObj = $scope.centralDataObject[childIndex];
							childDataObj.groupedFilter = 'All';

							var filters = addRestFilters(childDataObj);
							filters[dataObj.foreignKey] = dataObj.selectedItem.id;
							getListFromServer(childDataObj, filters, true);
							if (childDataObj.isGrouped && childDataObj.groupedList) {
								$scope.changeChildDataByGroupBy(childDataObj, childDataObj.groupedList.memberName);
							}
						}
					}
//					else {
//						$scope.displayData.isSelectedItem = false;
//						var selectedArr = $scope.displayData.selectedShowBys;
//						for (var i = selectedColumnIndex; i < selectedArr.length; i++) {
//							var index = selectedArr[i];
//							var dataObj = $scope.centralDataObject[index];
//							dataObj.filteredList = [];
//						}
//					}
				}
				function selectItem(dataObj, funcItem){
					funcItem.isSelected = true;
					dataObj.selectedItems.length = 0;
					dataObj.selectedItems = [funcItem];
					$scope.changeButtonsState(dataObj);
					$scope.setSelectionInColumn(dataObj, funcItem);
				}
				$scope.removeSelectedItems = function(dataObj, item) {
					if ($scope.displayData.dataObj != dataObj) {
						if ($scope.displayData.dataObj != undefined && $scope.displayData.dataObj.centralList != undefined) {
							$scope.displayData.dataObj.isAllSelected = false;
							for (var i = 0; i < $scope.displayData.dataObj.centralList.length; i++) {
								$scope.displayData.dataObj.centralList[i].isSelected = false;
							}
						}
					}
					else if (item) {
						if (item.isSelected) {
							dataObj.selectedItem = item;
							$scope.displayData.currentSelectedItem = item;
						}
						else {
							$scope.displayData.currentSelectedItem = null;
							$scope.displayData.isSelectedItem = false;
							if ($scope.displayData.dataObj != undefined && $scope.displayData.dataObj.filteredList != undefined) {
								for (var i = 0; i < $scope.displayData.dataObj.filteredList.length; i++) {
									if ($scope.displayData.dataObj.filteredList[i].isSelected) {
										$scope.displayData.currentSelectedItem = $scope.displayData.dataObj.filteredList[i];
									}
								}
							}
						}
					}
				}
				//row selection - end

				//central server requests
				function addRestFilters(dataObj, metaData) {
					var filter = { from: 0, max: EC2Restangular.pageSize };
					if (dataObj.filters && dataObj.filters.length) {
						for (var i = 0; i < dataObj.filters.length; i++) {
							if (dataObj.filters[i].key && dataObj.filters[i].value) {
								filter[dataObj.filters[i].key] = dataObj.filters[i].value;
							}
						}
					}

					var localStorageSort = mmSession.get(dataObj.type + 'SortBy');
					if (localStorageSort){
						filter['sort'] = localStorageSort;
						filter['order'] = mmSession.get(dataObj.type + 'SortByDesc');
					}
					if ((metaData || dataObj.metaData) && $scope.entityId) {
						metaData = metaData || dataObj.metaData;
						if (metaData.contextKey) {
							filter[metaData.contextKey] = $scope.entityId;
						}
						else if (metaData.contextEntities && metaData.contextEntities[$scope.entityType]){
							filter[metaData.contextEntities[$scope.entityType].key] = $scope.entityId;
						}
					}

					return filter;
				}
				function addListFunctions(dataObj, metaData){
					if(!dataObj.setCurrentSelectedItem){
						dataObj.setCurrentSelectedItem = (function (obj) { return function (item) { $scope.selectGridRow(obj.indexLocation, item); } })(dataObj);
					}
					if(!dataObj.refreshFilteredList){
						dataObj.refreshFilteredList = (function (obj) {
							return function () {
								obj.filteredList = obj.centralList;
								if (dataObj.groupedList && dataObj.groupedList.memberName){
									$scope.changeGroupOption(dataObj, dataObj.groupedList.memberName);
								}

								$scope.displayData.dataObj = obj;
							}
						})(dataObj);
					}
					if(!dataObj.refreshCentral){
						dataObj.refreshCentral = (function (obj, meta) { return function () { addListToDataObject(obj, meta); } })(dataObj, metaData);
					}
				}

				function addListToDataObject(dataObj, metaData) {
					var serverEntity = EC2Restangular.all(metaData.restPath).withHttpConfig({timeout: centralAbortRequest.promise});
					var filter = addRestFilters(dataObj, metaData);
					addListFunctions(dataObj, metaData);

					serverEntity.getList(filter).then(function (entities) {
						dataObj.serverLength = entities.serverLength || 0;
						dataObj.showCentralSpinner = false;
						dataObj.showAmount = true;

						if (dataObj.dataManipulator) {
							entities.refreshCentral = dataObj.refreshCentral;
							entities.ec2Restangular = serverEntity;
							dataObj.dataManipulator(entities);
						}

						var isRefresh = !dataObj.centralList;
						dataObj.centralList = entities;
						dataObj.filteredList = dataObj.centralList;
						dataObj.scrollAmount = EC2Restangular.readNextPageSize;
						if (entities.serverLength == null) {
							getNextRequestForUnsupportingServerPaging(dataObj);
						}
						if (isRefresh) {
							refreshInnerLists(dataObj);
						}
            dataObj.selectedItems.length = 0;
					}, function (response) {
						if (!dataObj.centralList) {
							dataObj.showCentralSpinner = false;
						}

						dataObj.centralList = dataObj.centralList || [];
						dataObj.filteredList = dataObj.centralList;
						dataObj.selectedItem = null;
						dataObj.selectedItems.length = 0;
						console.log(response);
					});
				}
				function refreshInnerLists(dataObj){

//					maybe remove this func

					dataObj.selectedItem = null;
					$scope.addRemoveCentralColumn(dataObj.indexLocation, true);
					var parentIndex = dataObj.indexLocation - 1;
					if (parentIndex >= 0) {
						var parentDataObj = $scope.centralDataObject[$scope.displayData.selectedShowBys[parentIndex]];
						if (parentDataObj.filteredList && parentDataObj.filteredList.length > 0) {
							var parentSelectedItem = parentDataObj.selectedItem ? parentDataObj.selectedItem : parentDataObj.filteredList[0];
							$scope.setSelectionInColumn(parentDataObj, parentSelectedItem);
						}
						else {
							dataObj.filteredList = [];
						}
					}
				}
				function getNextRequestForUnsupportingServerPaging(dataObj){
					var filter = addRestFilters(dataObj);
//					filter.from = EC2Restangular.pageSize;
					filter.max = 10000;
					getListFromServer(dataObj, filter, true);
				}

				function getListFromServer(dataObj, filters, setChildData){
					dataObj.centralList.getList(filters).then(function(response) {
						if (dataObj.dataManipulator) {
							response.refreshCentral = dataObj.refreshCentral;
							response.ec2Restangular = response;
							dataObj.dataManipulator(response);
						}

						dataObj.centralList = response;
						dataObj.filteredList = response;
						dataObj.scrollAmount = EC2Restangular.readNextPageSize;
						dataObj.serverLength = response.serverLength || 0;
            var item = null;
            // Re-select items after filtering the list
            if(dataObj.filteredList.length > 0){
              item = dataObj.filteredList[0];
              var selectedItemsIndex = {};
              dataObj.selectedItems.forEach(function(item){
                selectedItemsIndex[item.id] = item.id;
              });
              dataObj.filteredList.forEach(function(item){
                if(selectedItemsIndex[item.id]){
                  item.isSelected = true;
                }
              });
            }
						if (setChildData){
							$scope.setSelectionInColumn(dataObj, item);
						}
						dataObj.showCentralSpinner = false;
					},
					function (response) {
						if (!dataObj.centralList) {
							dataObj.showCentralSpinner = false;
						}

						dataObj.centralList = dataObj.centralList || [];
						dataObj.filteredList = dataObj.centralList;
						dataObj.selectedItem = null;
						console.log(response);
					});
				}
				function setGroupedList(dataObj, groupedOption) {
					dataObj.groupBy = groupedOption;
					var groupResource = dataObj.listMetaData[groupedOption].key + 's';
					var serverGroupByEntity = EC2Restangular.all(dataObj.restPath + '/' + groupResource).withHttpConfig({timeout: centralAbortRequest.promise});
					var filter = addRestFilters(dataObj);
					filter.max = 30;

					serverGroupByEntity.getList(filter).then(function (entities) {
						dataObj.groupedList.memberValues = entities;
					}, function (response) {
						console.log(response);
					});
				}
				//central server requests- end

				function openEntralOnSelection(dataObj, item){
					if ($scope.displayData.dataObj != dataObj) {
						$scope.displayData.dataObj = dataObj;
					}

					$scope.displayData.currentSelectedItem = item;
					if ($scope.displayData.shouldOpenEntral){
						$scope.displayData.shouldOpenEntral = false;
						$scope.displayData.showEdit = true;
						$scope.displayData.isSelectedItem = true;
					}
				}

				$scope.changeButtonsState = function(dataObj) {
					var shouldDisable = false;
					var selectedItemsCounter = dataObj.selectedItems.length;
					if (dataObj.centralActions) {
						angular.forEach(dataObj.centralActions, function (button) {
							shouldDisable = false;
							if(!button.disabledByPermission){ // Run this logic only if the button was not *hard* disabled by the user
								switch (button.relationType) {
									case infraEnums.buttonRelationToRowType.none:
										shouldDisable = selectedItemsCounter > 0;
										break;
									case infraEnums.buttonRelationToRowType.single:
										shouldDisable = selectedItemsCounter != 1;
										break;
									case infraEnums.buttonRelationToRowType.multiple:
										shouldDisable = selectedItemsCounter < 2;
										break;
									case infraEnums.buttonRelationToRowType.any:
										shouldDisable = selectedItemsCounter == 0;
										break;
								}

								if (!shouldDisable && button.disableFunc) {
									shouldDisable = button.disableFunc(dataObj.selectedItems);
								}
								button.disable = shouldDisable;
							} else {
								button.disable = button.disabledByPermission
							}
						});
					}
					//enable/disable EDIT and HISTORY buttons
					if(selectedItemsCounter == 1 || (selectedItemsCounter > 1 && dataObj.isEditMultiple)){
						dataObj.disableEditButton = false;
						dataObj.disableHistoryButton = false;
					}else {
						dataObj.disableEditButton = true;
						dataObj.disableHistoryButton = true;
					}
				}
				function shouldOpenEntral(dataObj) {
					if(dataObj.shouldOpenEntral){
						$timeout(function(){
							$scope.displayData.isSelectedItem = true;
							$scope.displayData.showEdit = true;
						}, 300);
					}
				}
        //ToDo: remove this or add an hibrid solution to search in the client and the server
				function getSearchFilter(searchColumns, textFilter){
					if(!searchColumns) return textFilter;

					var searchObject = {};
					searchColumns.forEach(function(item){
						searchObject[item] = textFilter;
					});
					return searchObject;
				}

				if ($scope.centralDataObject) {
					validateCentralDataObject($scope.centralDataObject);
					for (var i = 0; i < $scope.centralDataObject.length; i++) {
						initCentralDataObjectMembers(i);
					}
				}

				$scope.$on('$destroy', function () {
					if (timeOut)  $timeout.cancel(timeOut);
					if (searchTimer) $timeout.cancel(searchTimer);
					if (centralAbortRequest) centralAbortRequest.resolve();

					var l = $scope.centralDataObject.length;
					for (var i = 0; i <= l; i++) {
						if ($scope.centralDataObject[i]) {
							if ($scope.centralDataObject[i].centralList) $scope.centralDataObject[i].centralList.length = 0;
							if ($scope.centralDataObject[i].centralList) $scope.centralDataObject[i].centralList.length = 0;
						}
					}

					if ($scope.displayData.dataObj) {
						if ($scope.displayData.dataObj.centralList) $scope.displayData.dataObj.centralList.length = 0;
						if ($scope.displayData.dataObj.centralList) $scope.displayData.dataObj.centralList.length = 0;
						if ($scope.displayData.dataObj.selectedItems) $scope.displayData.dataObj.selectedItems.length = 0;
						if ($scope.displayData.dataObj.centralActions) $scope.displayData.dataObj.centralActions.length = 0;
						if ($scope.displayData.dataObj.filteredObject) $scope.displayData.dataObj.filteredObject.length = 0;

						$scope.displayData.dataObj.hideAddButton = null;
						$scope.displayData.dataObj.addSubEntity = null;
						$scope.displayData.dataObj.isEditable = null;
						$scope.displayData.showEdit = null;
						$scope.displayData.dataObj = null;
					}
					if ($scope.displayData.selectedShowBys) $scope.displayData.selectedShowBys.length = 0;
					$scope.centralDataObject.length = 0;

					$scope.disableEdit = null;
					$scope.displayData = null;

					delete $scope.displayData;
					delete $scope.centralDataObject;
				});
			}],
		scope: {
			centralDataObject: '=',
			entityId: '=',
			entityType: '=',
			centralMainEntityType: '@',
			disableEdit: '=?'
		}
	};
});


