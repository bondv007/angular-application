/**
 * Created by liron.tagger on 1/6/14.
 */
'use strict'

app.directive('central', function () {
	return {
		restrict: 'AE',
		templateUrl: 'infra/central/views/central.html',
		controller: ['$scope', '$filter', 'centralDataIndexer', 'entityMetaData', 'userSettingsService', 'EC2Restangular', '$state', '$document', '$timeout', 'enums', '$q', 'infraEnums', 'mmSession',
			function ($scope, $filter, centralDataIndexer, entityMetaData, userSettingsService, EC2Restangular, $state, $document, $timeout, enums, $q, infraEnums, mmSession) {
				var PAUSE = 500;
				var searchTimer = null;
				var timeOut = null;
				var centralAbortRequest = $q.defer();

				$scope.centralItemsCounter = 0;
				$scope.displayData = { selectedShowBys: [], remainingShowBys: [], isGrid: true, shouldOpenEntral: false };
				$scope.enums = enums;
				$scope.showCentralSpinner = true;

				$scope.centralScroll = function (dataObj) {
					dataObj.scrollAmount += 20;
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
											$scope.changeChildData($scope.displayData.dataObj.indexLocation, item);
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
						var selectedItems = $filter('filter')(list, {isSelected: true});
						func(list, selectedItems);
					}
				};
				$scope.addRemoveColumn = function (index, shouldAdd) {
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
				$scope.selectShowByEntity = function (index) {
					var dataObj = $scope.centralDataObject[index];
					dataObj.filteredList = index < $scope.centralDataObject.length - 1 ? addAllNoneToList(dataObj.centralList, dataObj.type, dataObj.hideAllNoneObj) : dataObj.centralList;
					dataObj.filteredObject = null;
					dataObj.selectedItem = null;
					$scope.addRemoveColumn(index, true);
					if ($scope.displayData.selectedShowBys.length >= 2) {
						$scope.centralDataObject[$scope.displayData.selectedShowBys[$scope.displayData.selectedShowBys.length - 2]].isLast = false;
					}
					else {
						$scope.displayData.dataObj = dataObj;
					}

					selectElementInNewChild(dataObj, index);
				};
				$scope.closeEntral = function () {
					var callBack = function () {
						return function () {
							$scope.displayData.showEdit = false;
						}
					};

					var leaveAction = callBack();
					var unSavedChangesObj = { leaveAction:leaveAction };
					$scope.$root.unSavedChanges(unSavedChangesObj, false);
				};
				$scope.changeChildData = function(index, item) {
					var callBack = function (funcIndex, funcItem) {
						return function () {
							var selectedColumnIndex = _.indexOf($scope.displayData.selectedShowBys, funcIndex);
							removeSelectedItems(null, null);
							setSelectionInColumn(selectedColumnIndex, funcItem, false);
							selectItemMarker(funcItem, selectedColumnIndex);
							setSelectedItemsArray(null, selectedColumnIndex, item);
							$scope.displayData.currentSelectedItem = funcItem;
							if ($scope.displayData.shouldOpenEntral){
								$scope.displayData.shouldOpenEntral = false;
								$scope.displayData.showEdit = true;
								$scope.displayData.isSelectedItem = true;
							}
						}
					};
					var leaveAction = callBack(index, item);
					var unSavedChangesObj = {leaveAction:leaveAction};
					if($scope.$root.unSavedChanges){
						$scope.$root.unSavedChanges(unSavedChangesObj, true);
					}
				};
				$scope.changeStringFilter = function(index){
					if (searchTimer) $timeout.cancel(searchTimer);
					$scope.showCentralSpinner = true;
					searchTimer = $timeout(function () {
						$scope.showCentralSpinner = false;
						doChangeStringFilter(index);
					}, PAUSE);
				};
				$scope.setToolBar = function(dataObj, index, item){
					setSelectionInColumn(dataObj.indexLocation, item);
					removeSelectedItems(dataObj, item);
					setSelectedItemsArray(dataObj, index, item, true);
					$scope.displayData.dataObj = dataObj;
				};
				$scope.addNewEntity = function(){
					if ($scope.displayData && $scope.displayData.dataObj){
						$scope.displayData.dataObj.selectedItem = null;
					}
					removeSelectedItems(null, null);
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
				$scope.rowDoubleCLick = function (dataObj, item){
					if (item.id != -1 && item.id != -2 && dataObj.isEditable){
						$scope.displayData.isSelectedItem = true;
						$scope.goToFullPage();
					}
				};
				$scope.openEntralOnLinkClick = function (dataObj, item){
					if(!dataObj.allowEditInEntral){
						$scope.changeChildData(dataObj.indexLocation, item);
						$scope.rowDoubleCLick(dataObj, item);
					} else if (item.id != -1 && item.id != -2 && (dataObj.isEditable || dataObj.allowNewInEntral)){
						$scope.displayData.shouldOpenEntral = true;
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
				$scope.changeChildDataByGroupBy = function (dataObj, item) {
					$scope.displayData.isSelectedItem = false;
					$scope.displayData.currentSelectedItem = null;
					dataObj.filteredList = filterList(dataObj.centralList, dataObj.filteredObject, dataObj.filterByText, dataObj.hideAllNoneObj);
					$scope.changeGroupOption(dataObj, dataObj.groupedList.memberName);
					if (item.id == -1) {
						dataObj.groupedFilter = 'All';
					}
					else if (item.id != -2) {
						dataObj.groupedFilter = item.title;
						var groupedFilter = {};
						groupedFilter[dataObj.groupedList.memberName] = item.title;
						dataObj.filteredList = $filter('filter')(dataObj.filteredList, groupedFilter);
					}
				};
				$scope.changeGroupOption = function (dataObj, groupedOption) {
					if (groupedOption == 'None') {
						dataObj.isGrouped = false;
						dataObj.filteredList = filterList(dataObj.centralList, dataObj.filteredObject, dataObj.filterByText, dataObj.hideAllNoneObj);
					}
					else {
						dataObj.isGrouped = true;
						dataObj.groupedFilter = 'All';
						dataObj.groupedList = {
							memberName: groupedOption,
							memberValues: getGroupedList(dataObj, groupedOption, true)
						};
					}
				};
				$scope.addNewSubEntity = function () {
					var childDataObj = $scope.centralDataObject[$scope.displayData.dataObj.addSubEntity.index];
					childDataObj.selectedItem = null;
					$scope.displayData.dataObj = childDataObj;
					$scope.displayData.isSelectedItem = true;
					$scope.displayData.currentSelectedItem = null;
					$scope.displayData.showEdit = true;
				};
				$scope.markAllDataObjItems = function (dataObj) {
					dataObj.isAllSelected = !dataObj.isAllSelected;
					removeSelectedItems(dataObj, null);
					$scope.displayData.dataObj = dataObj;
					for (var i = 0; i < dataObj.centralList.length; i++) {
						dataObj.centralList[i].isSelected = dataObj.isAllSelected;
					}
				};
				$scope.centralOrderBy = function (dataObj, colKey, setLocalStorage) {
					dataObj.orderedBy = colKey;
					if (setLocalStorage){
						mmSession.set(dataObj.type + 'SortBy', dataObj.orderedBy, mmSession.storage.disk);
					}

					dataObj.orderedByDescending = !dataObj.orderedByDescending;
					var stringSort = sortType(dataObj, colKey);
					var sortBy = getSortFunction(stringSort, colKey);
					dataObj.filteredList = removeAllNoneToList(dataObj.filteredList, dataObj.hideAllNoneObj);
					dataObj.filteredList = $filter('orderBy')(dataObj.filteredList, sortBy, dataObj.orderedByDescending);
					dataObj.filteredList = addAllNoneToList(dataObj.filteredList, dataObj.type, dataObj.hideAllNoneObj);
				};
				$scope.getInnerField = function (item, col) {
					var field = item;
					if (col.isInner) {
						field = $scope.getInnerMember(item, col.field);
					} else {
						field = item[col.field];
					}

					return field;
				};
				$scope.getInnerMember = function getInnerMember(item, innerField){
					var field = item;
					var splitPath = innerField ? innerField.split('.') : [];
					for (var i = 0; i < splitPath.length; i++) {
						if (field && splitPath[i]) {
							field = field[splitPath[i]];
						}
						else {
							break;
						}
					}

					return field;
				};

				$scope.getColumnWidth = function(dataObj, col){
					return col.colWidth ? col.colWidth : (100 / (dataObj.gridData.columnDefs.length)) + '%';
				};
				$scope.addRemoveGridColumn = function(dataObj, availableColumn, colIndex){
					availableColumn.isVisible = !availableColumn.isVisible;
					var existingData = mmSession.get(dataObj.type + 'Columns');
					existingData = !existingData ? [] : existingData;
					if (availableColumn.isVisible){
						existingData.push(colIndex);
					}
					else {
						existingData = _.without(existingData, colIndex);
					}

					removeColumnsWidth(dataObj.gridData.columnDefs);
					mmSession.remove(dataObj.type + 'ColumnSizes', mmSession.storage.disk);
					mmSession.set(dataObj.type + 'Columns', existingData, mmSession.storage.disk);
					addGridData(dataObj, false);
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
				function changeButtonsState(dataObj) {
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
				}
				function doChangeStringFilter(index){
					var dataObj = $scope.centralDataObject[index];
					dataObj.scrollAmount = EC2Restangular.firstAmount;
					dataObj.filteredList = filterList(dataObj.centralList, dataObj.filteredObject, dataObj.filterByText, dataObj.hideAllNoneObj, dataObj.searchColumns);
					var selectedColumnIndex = _.indexOf($scope.displayData.selectedShowBys, index);
					if (dataObj.filteredList.length > 0){
						setSelectionInColumn(selectedColumnIndex, dataObj.filteredList[0], false);
						$scope.displayData.currentSelectedItem = dataObj.filteredList[0];
					}
				}

				function addAllNoneToList(list, listType, hideAllNoneObj) {
					var listContainAllNone = list && list.length > 0 && list[list.length - 1].id == -2;
					if(!listContainAllNone && hideAllNoneObj && (hideAllNoneObj.showAll || hideAllNoneObj.showNone)){

						var allItem = [{id: -1, title: hideAllNoneObj.allCaption, name: hideAllNoneObj.allCaption, type: listType}];
						var noneItem = [{id: -2, title: hideAllNoneObj.noneCaption, name: hideAllNoneObj.noneCaption, type: listType}];

						if(hideAllNoneObj.showAll && hideAllNoneObj.showNone){
							list = _.union(allItem, list, noneItem);
						} else if(hideAllNoneObj.showAll && !hideAllNoneObj.showNone){
							list = _.union(allItem, list);
						} else if(!hideAllNoneObj.showAll && hideAllNoneObj.showNone){
							list = _.union(list, noneItem);
						}
					}
					return list;
				}

				function removeAllNoneToList(list, hideAllNoneObj) {
					var listContainAllNone = list && list.length > 0 && list[list.length - 1].id == -2;
					if (listContainAllNone && !hideAllNoneObj.showAll && !hideAllNoneObj.showNone) {
						list = list.slice(1, list.length - 1);
					}

					return list;
				}

				function sortType(dataObj, colKey) {
					var stringSort = 'string';
					for (var i = 0; i < dataObj.listMetaData.length; i++) {
						if (dataObj.listMetaData[i].key == colKey) {
							if (dataObj.listMetaData[i].type) {
								stringSort = dataObj.listMetaData[i].type;
							}
							break;
						}
					}
					return stringSort;
				}
				function getSortFunction(stringSort, colKey) {
					var sortBy = colKey;
					switch (stringSort) {
						case 'number':
							sortBy = function (item) {
								return parseFloat(item[colKey]);
							};
							break;
						case 'date':
							sortBy = colKey;
							break;
						default:
							sortBy = colKey;
							break;
					}

					return sortBy;
				}

				function selectElementInNewChild(dataObj, index) {
					var parentIndex = index - 1;
					if (parentIndex >= 0) {
						var parentDataObj = $scope.centralDataObject[$scope.displayData.selectedShowBys[parentIndex]];
						if (parentDataObj.filteredList && parentDataObj.filteredList.length > 0) {
							var parentSelectedItem = parentDataObj.selectedItem ? parentDataObj.selectedItem : parentDataObj.filteredList[0];
							setSelectionInColumn(parentIndex, parentSelectedItem);
						}
						else {
							dataObj.filteredList = [];
						}
					}
				}
				function removeSelectedItems(dataObj, item) {
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
							$scope.displayData.currentSelectedItem = item;
						}
						else {
							$scope.displayData.currentSelectedItem = null;
							$scope.displayData.isSelectedItem = false;
							if ($scope.displayData.dataObj != undefined && $scope.displayData.dataObj.filteredList != undefined) {
								for (var i = 0; i < $scope.displayData.dataObj.filteredList.length; i++) {
									if ($scope.displayData.dataObj.filteredList[i].isSelected) {
										setSelectionInColumn($scope.displayData.dataObj.indexLocation, $scope.displayData.dataObj.filteredList[i]);
										$scope.displayData.currentSelectedItem = $scope.displayData.dataObj.filteredList[i];

									}
								}
							}
						}
					}
				}
				function selectItemMarker(item, selectedColumnIndex) {
					for (var i = 0; i < $scope.displayData.dataObj.filteredList.length; i++) {
						$scope.displayData.dataObj.filteredList[i].isSelected = false;
					}

					item.isSelected = true;
					var selectedArr = $scope.displayData.selectedShowBys;
					var index = selectedArr[selectedColumnIndex];
					if ($scope.displayData.dataObj != $scope.centralDataObject[index]) {
						$scope.displayData.dataObj = $scope.centralDataObject[index];
					}
				}
				function setSelectionInColumn(selectedColumnIndex, item, leaveIsSelected) {
					var selectedArr = $scope.displayData.selectedShowBys;
					if (item) {
						var index = selectedArr[selectedColumnIndex];
						var dataObj = $scope.centralDataObject[index];
						dataObj.selectedItem = item;
						$scope.displayData.isSelectedItem = true;
						selectedColumnIndex++;
						if (selectedColumnIndex < selectedArr.length) {
							var childIndex = selectedArr[selectedColumnIndex];
							var childDataObj = $scope.centralDataObject[childIndex];
							childDataObj.groupedFilter = 'All';

							if (item.id == -1) {
								if (!leaveIsSelected) {
									$scope.displayData.isSelectedItem = false;
								}

								childDataObj.filteredObject = null;
								childDataObj.parentSelectedItem = {id: null, type: dataObj.type};
								childDataObj.filteredList = filterList(childDataObj.centralList, null, childDataObj.filterByText, childDataObj.hideAllNoneObj);
								if (childDataObj.isGrouped && childDataObj.groupedList) {
									childDataObj.groupedList.memberValues = getGroupedList(childDataObj, childDataObj.groupedList.memberName, true);
								}
							}
							else if (item.id == -2) {
								if (!leaveIsSelected) {
									$scope.displayData.isSelectedItem = false;
								}

								childDataObj.parentSelectedItem = {id: null, type: dataObj.type};
								childDataObj.filteredObject = setSelectedFilter(item.id, dataObj.type, childDataObj.type);
								childDataObj.filteredList = filterList(childDataObj.centralList, childDataObj.filteredObject, childDataObj.filterByText, childDataObj.hideAllNoneObj);
							}
							else {
								childDataObj.parentSelectedItem = {id: item.id, type: dataObj.type, name: item.name};
								childDataObj.filteredObject = setSelectedFilter(item.id, dataObj.type, childDataObj.type);
								childDataObj.filteredList = filterList(childDataObj.centralList, childDataObj.filteredObject, childDataObj.filterByText, childDataObj.hideAllNoneObj);
								item = childDataObj.filteredList.length > 0 ? childDataObj.filteredList[0] : null;
								setSelectionInColumn(selectedColumnIndex, item, true);
								if (childDataObj.isGrouped && childDataObj.groupedList) {
									$scope.changeChildDataByGroupBy(childDataObj, childDataObj.groupedList.memberName);
								}
							}
						}
					}
					else {
//						$scope.displayData.isSelectedItem = false;
						emptyChildArrays(selectedColumnIndex);
					}
				}
				function emptyChildArrays(selectedColumnIndex) {
					var selectedArr = $scope.displayData.selectedShowBys;
					for (var i = selectedColumnIndex; i < selectedArr.length; i++) {
						var index = selectedArr[i];
						var dataObj = $scope.centralDataObject[index];
						dataObj.filteredList = [];
					}
				}
				function setSelectedFilter(value, parentItemType, childItemType) {
					var indexedData = [];
					parentItemType = parentItemType.replace(' ', '');
					childItemType = childItemType.replace(' ', '');
					if ($scope.indexedCentralData[parentItemType] && $scope.indexedCentralData[parentItemType][value] && $scope.indexedCentralData[parentItemType][value][childItemType]) {
						indexedData = $scope.indexedCentralData[parentItemType][value][childItemType];
					}
					return indexedData;
				}
				function filterList(list, objFilter, textFilter, hideAllNoneObj, searchColumns) {
					if (objFilter) {
						list = _.filter(list, function (item) {
							return _.indexOf(objFilter, item.id) > -1;
						});
					}

					var searchFilter = getSearchFilter(searchColumns, textFilter);
					list = $filter('filter')(list, searchFilter);
					if (hideAllNoneObj && (hideAllNoneObj.showAll || hideAllNoneObj.showNone)) {
						list = addAllNoneToList(list, false, hideAllNoneObj);
					}
					return list;
				}
				function getSearchFilter(searchColumns, textFilter){
					if(!searchColumns) return textFilter;

					var searchObject = {};
					searchColumns.forEach(function(item){
						searchObject[item] = textFilter;
					});
					return searchObject;
				}

				function initCentralDataObjectMembers(i) {
					var dataObj = $scope.centralDataObject[i];
					var type = dataObj.type;
					if (type) {
						$scope.displayData.remainingShowBys.push(i);
						dataObj.centralMainEntityType = $scope.centralMainEntityType == type;
						dataObj.selectedItems = [];
						var metaData = entityMetaData[type];
						if (metaData) {
							addListToDataObject(dataObj, metaData);
							addAdditionalDataToDataObj(dataObj, metaData, type, i);
						}
					}
					changeButtonsState(dataObj);
				}
				function addAdditionalDataToDataObj(dataObj, metaData, type, index) {
					dataObj.isEditable = !!dataObj.isEditable;
					dataObj.shouldOpenEntral = !!dataObj.shouldOpenEntral;
					dataObj.foreignKey = metaData.foreignKey;
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
					dataObj.defualtColumns = userSettingsService.getUserMetaData(type);
					dataObj.hideAllNone = index >= $scope.centralDataObject.length - 1;
					dataObj.indexLocation = index;
					dataObj.scrollAmount = EC2Restangular.firstAmount;
					dataObj.hasSelectedItems = (function(obj){ return hasSelected(obj); })(dataObj);
					dataObj.openEntral = function(shouldOpen){ $scope.displayData.showEdit = !!shouldOpen; };
					dataObj.isEntralOpen = function(){ return $scope.displayData.showEdit; };
					dataObj.editPage = metaData.editPage;
					dataObj.filterByText = (index == 0 && $scope.$root.centralSearchTerm) ? $scope.$root.centralSearchTerm : '';
					$scope.$root.centralSearchTerm = '';
					dataObj.dragFunction = dataObj.isDraggable ? $scope.centralCopyAction : undefined;
					dataObj.removeNoDrag = dataObj.isDraggable ? undefined : false;

					setAllNoneData(dataObj, index);
					addGridData(dataObj, false);
					setSortMethod(dataObj);
					shouldOpenEntral(dataObj);
				}
				function setAllNoneData(dataObj, index) {
					var shouldShowDefault = index < $scope.centralDataObject.length - 1;
					if (shouldShowDefault) {
						if (dataObj.hideAllNoneObj) {
							if (dataObj.hideAllNoneObj.showAll === undefined) dataObj.hideAllNoneObj.showAll = shouldShowDefault;
							if (dataObj.hideAllNoneObj.showNone === undefined) dataObj.hideAllNoneObj.showNone = shouldShowDefault;
							if (dataObj.hideAllNoneObj.allCaption === undefined) dataObj.hideAllNoneObj.allCaption = 'All';
							if (dataObj.hideAllNoneObj.noneCaption === undefined) dataObj.hideAllNoneObj.noneCaption = 'None';
						} else {
							dataObj.hideAllNoneObj = { showAll: shouldShowDefault, allCaption: 'All', showNone: shouldShowDefault, noneCaption: 'None' };
						}
					}
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
							var colHeader = {
								field: dataObj.listMetaData[index].key,
								displayName: dataObj.listMetaData[index].text,
								uniqueName: colUniqueName,
								type: dataObj.listMetaData[index].type,
								enumName: dataObj.listMetaData[index].enumName,
								isInner: dataObj.listMetaData[index].isInner,
								colWidth: columnsSizesSessionData[colUniqueName]
							};

							addColumnLinkData(dataObj,colHeader, index);
							columnDefs.push(colHeader);
						}
					}

					dataObj.gridData = { type: dataObj.type, columnDefs: columnDefs };
					if (isDefaultView){
						removeColumnsWidth(dataObj.gridData.columnDefs);
						mmSession.remove(dataObj.type + 'ColumnSizes', mmSession.storage.disk);
					}
				}
				function setSortMethod(dataObj){
					var localStorageSort = mmSession.get(dataObj.type + 'SortBy');
					if (localStorageSort){
						$scope.centralOrderBy(dataObj, localStorageSort, false);
					}
				}
				function addColumnLinkData(dataObj, colHeader, index){
					if (dataObj.listMetaData[index].entityLink){
						if (!dataObj.listMetaData[index].isList){
							colHeader['linkForeignKey'] = entityMetaData[dataObj.listMetaData[index].entityLink].foreignKey;
							colHeader['linkTemplate'] = entityMetaData[dataObj.listMetaData[index].entityLink].editPageURL;
							colHeader['linkForeignKeyValue'] = dataObj.listMetaData[index].linkKeyParams;
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

							colHeader['linkForeignKey'] = linkForeignKey;
							colHeader['linkTemplate'] = listPageURL;
							colHeader['linkForeignKeyValue'] = dataObj.listMetaData[index].linkKeyParams;
						}
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
				function setVisibleColumnsMarker(dataObj, columnsSessionData){
					for (var i = 0; i < dataObj.listMetaData.length; i++) {
						dataObj.listMetaData[i].isVisible = _.indexOf(columnsSessionData, i) > -1;
					}
				}
				function removeColumnsWidth(columns){
					for (var i = 0; i < columns.length; i++) {
						var col = columns[i];
						col.colWidth = null;
					}
				}
				function addListToDataObject(dataObj, metaData) {
					var serverEntity = EC2Restangular.all(metaData.restPath).withHttpConfig({timeout: centralAbortRequest.promise});
					var filter = addRestFilters(dataObj);
					dataObj.setCurrentSelectedItem = (function (obj) {
						return function (item) {
							$scope.changeChildData(obj.indexLocation, item);
						}
					})(dataObj);
					dataObj.refreshFilteredList = (function (obj) {
						return function (shouldIndex) {
							if (shouldIndex) {
								$scope.indexedCentralData = $scope.centralDataObject.length > 1 ? centralDataIndexer.indexCentralData($scope.centralDataObject) : {};
							}

							obj.filteredList = filterList(obj.centralList, obj.filteredObject, obj.filterByText, obj.hideAllNoneObj);
							if (dataObj.groupedList && dataObj.groupedList.memberName){
								$scope.changeGroupOption(dataObj, dataObj.groupedList.memberName);
							}

							$scope.displayData.dataObj = obj;
						}
					})(dataObj);
					if (dataObj.useMock) {
						var entities = dataObj.mockList;
						refreshIndexer(dataObj, entities);
					} else {
						if ($scope.entityId) {
							if (metaData.contextEntities) {
								if (metaData.contextEntities[$scope.entityType]) {
									filter[metaData.contextEntities[$scope.entityType].key] = $scope.entityId;
								}
							} else if (metaData.contextKey) {
								filter[metaData.contextKey] = $scope.entityId;
							}
						}
					}

//					dataObj.requestUrl = serverEntity.getRequestedUrl();
//					var filterParams = $.param(filter);
//					var lastAuthorization = mmSession.get('Authorization', false);
//					$http.get(dataObj.requestUrl + '?' + filterParams, {headers: {Authorization: lastAuthorization}}).then(function (entities) {

					serverEntity.getList(filter).then(function (entities) {
						var getNext = entities.serverLength > entities.length || entities.length == EC2Restangular.firstAmount;
						dataObj.serverLength = entities.serverLength ? entities.serverLength : 0;
						dataObj.refreshCentral = (function (obj, meta) {
							return function () {
								addListToDataObject(obj, meta);
							}
						})(dataObj, metaData);
						if (dataObj.dataManipulator) {
							entities.refreshCentral = dataObj.refreshCentral;
							entities.ec2Restangular = serverEntity;
							dataObj.dataManipulator(entities);
						}

						refreshIndexer(dataObj, entities, false);
						if (getNext) {
							// Using $timeout to allow rendering of the first response, we need to wait a bit longer to avoid getting into the current $digest cycle.
							$timeout(function getNext() {
								$scope.showCentralSpinner = false;
								getNextEntities(serverEntity, dataObj, filter);
							}, 50);
						}
						else {
							dataObj.showAmount = true;
							$scope.showCentralSpinner = false;
						}
					}, function (response) {
						$scope.centralItemsCounter++;
						$scope.showCentralSpinner = false;
						$scope.centralList = $scope.centralList || [];
						indexListAndData();
						console.log(response);
					});
				}
				function addRestFilters(dataObj) {
					var filter = { from: 0, max: EC2Restangular.firstAmount };
					if (dataObj.filters && dataObj.filters.length) {
						for (var i = 0; i < dataObj.filters.length; i++) {
							if (dataObj.filters[i].key && dataObj.filters[i].value) {
								filter[dataObj.filters[i].key] = dataObj.filters[i].value;
							}
						}
					}

					return filter;
				}
				function getNextEntities(serverEntity, dataObj, filter) {
					// Break down the retrival of the rest of the entities,
					// Restangular finds it hard to handle a lot of entities, so breaking down each request
					// into smaller bits helps. Please note that in case "serverLength" is 0, we execute only one request and hope for the best.
					var blockSize = dataObj.serverLength > 0 ? EC2Restangular.maxBlockSize : EC2Restangular.maxRequestSize;
					var serverLength = dataObj.serverLength > 0 ? dataObj.serverLength : EC2Restangular.maxRequestSize;
					var requests = [];
					var counter = 0;
					filter.from = EC2Restangular.firstAmount;

					do {
						counter++;
						filter.max = filter.from + blockSize;
						// Execute the current request and handle the results
						requests.push(serverEntity.getList(filter).then(function(newEntities) {
							if (dataObj.dataManipulator) {
								dataObj.dataManipulator(newEntities);
							}
							// TODO: temp bug fix as concat does not work.
							newEntities.forEach(function(entity){
								dataObj.centralList.push(entity);
							});
//              dataObj.centralList.concat(newEntities);
						}));
						// Next request
						filter.from = filter.max;
					} while (filter.max < serverLength && counter <= 1000);

					// All of the requests were handled.
					$q.all(requests).then(function (responses) {
						refreshIndexer(dataObj, dataObj.centralList, true);
						$scope.showCentralSpinner = false;
						dataObj.filteredList = filterList(dataObj.centralList, dataObj.filteredObject, dataObj.filterByText, dataObj.hideAllNoneObj);
						dataObj.showAmount = true;
					}, function (response) {
						console.log(response);
					});
				}
				function refreshIndexer(dataObj, entities, hardRefresh) {
					var isRefresh = !dataObj.centralList;
					dataObj.centralList = entities;
					if (isRefresh) {
						$scope.centralItemsCounter++;
						indexListAndData();
					}
					else {
						if (hardRefresh) {
							var selectedItem = dataObj.selectedItem;

							//ToDo: maybe should check if all the next calls had returned from the server and just then call to indexListAndData...
							indexListAndData();
							if ($scope.displayData){
								$scope.displayData.dataObj.selectedItem = selectedItem;
								$scope.displayData.currentSelectedItem = selectedItem;
							}
						}
						else {
							$scope.indexedCentralData = $scope.centralDataObject.length > 1 ? centralDataIndexer.indexCentralData($scope.centralDataObject) : {};
							if (dataObj.parentSelectedItem) {
								dataObj.filteredObject = setSelectedFilter(dataObj.parentSelectedItem.id, dataObj.parentSelectedItem.type, dataObj.type);
							}

							dataObj.filteredList = filterList(dataObj.centralList, dataObj.filteredObject, dataObj.filterByText, dataObj.hideAllNoneObj);
						}
					}
				}
				function indexListAndData() {
					if ($scope.centralDataObject && $scope.centralItemsCounter >= $scope.centralDataObject.length) {
						$scope.indexedCentralData = $scope.centralDataObject.length > 1 ? centralDataIndexer.indexCentralData($scope.centralDataObject) : {};
						for (var i = 0; i < $scope.centralDataObject.length; i++) {
							$scope.selectShowByEntity(i);
						}
					}
				}
				function getGroupedList(dataObj, groupedOption, addAll) {
					var groupedList = [];
					var existingGroups = {};

					if (addAll) {
						groupedList.push({id: -1, title: 'All'});
					}
					if (dataObj.filteredList) {
						for (var i = 0; i < dataObj.filteredList.length; i++) {
							var val = dataObj.filteredList[i][groupedOption];
							if (val && !existingGroups[val] && val != -1 && val != -2) {
								existingGroups[val] = val;
								groupedList.push({title: val});
							}
						}
					}

					return groupedList;
				}

				function setSelectedItemsArray(dataObj, selectedColumnIndex, item, isMultipleRowsSelected) {
					if (!dataObj) {
						var index = $scope.displayData.selectedShowBys[selectedColumnIndex];
						dataObj = $scope.centralDataObject[index];
					}

					if (isMultipleRowsSelected) {
						if (item.isSelected) {
							dataObj.selectedItems.push(item);
						} else {
							_.remove(dataObj.selectedItems, function (currentObject) {
								return currentObject.id === item.id;
							});
						}
					} else {
						dataObj.selectedItems.length = 0;
						dataObj.selectedItems.push(item);
					}

					changeButtonsState(dataObj);
				}
				if ($scope.centralDataObject) {
					$scope.indexedCentralData = {};
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
							if ($scope.centralDataObject[i].filteredList) $scope.centralDataObject[i].filteredList.length = 0;
							if ($scope.centralDataObject[i].centralList) $scope.centralDataObject[i].centralList.length = 0;
						}
					}

					if ($scope.displayData.dataObj) {
						if ($scope.displayData.dataObj.filteredList) $scope.displayData.dataObj.filteredList.length = 0;
						if ($scope.displayData.dataObj.centralList) $scope.displayData.dataObj.centralList.length = 0;
						if ($scope.displayData.dataObj.selectedItems) $scope.displayData.dataObj.selectedItems.length = 0;
						if ($scope.displayData.dataObj.centralActions) $scope.displayData.dataObj.centralActions.length = 0;
						if ($scope.displayData.dataObj.filteredObject) $scope.displayData.dataObj.filteredObject.length = 0;

						$scope.displayData.dataObj.hideAddButton = null;
						$scope.displayData.dataObj.addSubEntity = null;
						$scope.displayData.dataObj.isEditable = null;
						$scope.displayData.dataObj = null;
					}
					if ($scope.displayData.selectedShowBys) $scope.displayData.selectedShowBys.length = 0;
					$scope.centralDataObject.length = 0;
					$scope.displayData.showEdit = null;

					delete $scope.displayData;
					delete $scope.centralDataObject;
					delete $scope.indexedCentralData;

					$scope.disableEdit = null;
					$scope.displayData = null;
					$scope.indexedCentralData = null;
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