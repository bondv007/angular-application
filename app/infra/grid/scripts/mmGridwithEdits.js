app.directive('mmGrid', [function() {
    return {
        restrict: 'E',
        templateUrl: 'infra/grid/views/mmGrid.html',
        scope: {
            mmGridId: '@',
            items: '=',
            cols: '=',
            selectedItems: '=?',
            filteredItems: '=?',
            saveData: '=?',
            afterSelectionChange: '=?',
            startCellEditFunction: '&',
            dbClickHandler: '=?',
            isCellEdit: '@',
            enableCellEditDragDrop: '@',
            isSingleSelect: '@',
            isSort: '@',
            showFooter: '@',
            isGroupable: '@',
            showSelectionCheckbox: "@",
            showFilter: '@',
            enableColumnResize: '@',
            isColumnReorder: '@',
            isColumnFreeze: '@',
            isShowMenu: '@',
            gridWidth: '@',
            gridHeight: '@',
            gridButtonActions: '=?',
            gridSelectActions: '=?',
            isCentralGrid: '@',
            itemsToSave: '=?',
            filterText: '=?',
            radioClickHandler: '=?',
            checkBoxClickHandler: '=?',
            singleCheckBoxClickHandler: '=?',
            isInfiniteScroll: '@',
            pageSize: '@',
            currentPage: '=?',
            pagingHandler: '=?',
            selectedRowHandler: '=?',
            selectedCellHandler: '=?',
            genericValidationHandler: '=?',
            isGridLoading: '=?',
            enableRowSelection: '=?',
            enableSelectedRowSelection: '=?',
            selectDisabledError: '@',
            selectEnabledMessage: '@',
            mmId: '@',
      selectionCheckboxColumnWidth: '=?'
        },
        replace: false,
        transclude: false,
        controller: ['$scope', '$attrs', 'enums', '$filter', '$parse', '$timeout', '$element', 'mmAlertService', '$state',
            function($scope, $attrs, enums, $filter, $parse, $timeout, $element, mmAlertService, $state) {

                $attrs.$observe('isCentralGrid', function(val) {
                    $scope.isCentralGrid = typeof(val) == 'undefined' ? true : val == "true" ? true : false;
                });

                $attrs.$observe('isSingleSelect', function(val) {
                    $scope.isSingleSelect = typeof(val) == 'undefined' ? false : val == "true" ? true : false;
                });

                $attrs.$observe('showSelectionCheckbox', function(val) {
                    $scope.showSelectionCheckbox = typeof(val) == 'undefined' ? false : val == "true" ? true : false;
                });

                $attrs.$observe('isCellEdit', function(val) {
                    $scope.isCellEdit = typeof(val) == 'undefined' ? false : val == "true" ? true : false;
                });

                $attrs.$observe('enableCellEditDragDrop', function(val) {
                    $scope.enableCellEditDragDrop = typeof(val) == 'undefined' ? false : val == "true" ? true : false;
                });

                $attrs.$observe('isInfiniteScroll', function(val) {
                    $scope.isInfiniteScroll = typeof(val) == 'undefined' ? false : val == "true" ? true : false;
                });

                $attrs.$observe('isGridLoading', function(val) {
                    $scope.isGridLoading = typeof(val) == 'undefined' ? true : val == "true" ? true : false;
                });

                $scope.IsItemsEmpty = false;
                $scope.IsColumnsEmpty = false;
                if (!$scope.items && !_.isUndefined($scope.items)) {
                    $scope.items = [];
                    $scope.IsItemsEmpty = true;
                }
                if (!$scope.cols) {
                    $scope.IsColumnsEmpty = true;
                    return false;
                }

                $scope.showSearchBox = false;

                if (typeof $scope.selectedItems == "undefined") {
                    $scope.selectedItems = [];
                }

                $scope.showSortBySubCategory = false;
				
				if (typeof $scope.selectionCheckboxColumnWidth == "undefined") {
					$scope.selectionCheckboxColumnWidth = 35;
				}

                $scope.showFilter = typeof($scope.showFilter) == 'undefined' ? false : $scope.showFilter == "true" ? true : false;

                $scope.isCentralGrid = typeof($scope.isCentralGrid) == 'undefined' ? false : $scope.isCentralGrid == "true" ? true : false;

                $scope.showSelectionCheckbox = typeof($scope.showSelectionCheckbox) == 'undefined' ? false : $scope.showSelectionCheckbox == "true" ? true : false;

                $scope.isCellEdit = typeof($scope.isCellEdit) == 'undefined' ? false : $scope.isCellEdit == "true" ? true : false;

                $scope.isSingleSelect = typeof($scope.isSingleSelect) == 'undefined' ? true : $scope.isSingleSelect == "true" ? true : false;

                $scope.isSort = typeof($scope.isSort) == 'undefined' ? false : $scope.isSort == "true" ? true : false;

                $scope.showFooter = typeof($scope.showFooter) == 'undefined' ? false : $scope.showFooter == "true" ? true : false;

                $scope.isGroupable = typeof($scope.isGroupable) == 'undefined' ? false : $scope.isGroupable == "true" ? true : false;

                $scope.enableColumnResize = typeof($scope.enableColumnResize) == 'undefined' ? false : $scope.enableColumnResize == "true" ? true : false;

                $scope.isColumnReorder = typeof($scope.isColumnReorder) == 'undefined' ? false : $scope.isColumnReorder == "true" ? true : false;

                $scope.isColumnFreeze = typeof($scope.isColumnFreeze) == 'undefined' ? false : $scope.isColumnFreeze == "true" ? true : false;

                $scope.isShowMenu = typeof($scope.isShowMenu) == 'undefined' ? false : $scope.isShowMenu == "true" ? true : false;

                $scope.enableCellEditDragDrop = typeof($scope.enableCellEditDragDrop) == 'undefined' ? false : $scope.enableCellEditDragDrop == "true" ? true : false;

                $scope.showExternalSelectlist = typeof($scope.gridSelectActions) != "undefined" && $scope.gridSelectActions.length > 0;

                $scope.showExternalButtons = typeof($scope.gridButtonActions) != "undefined" && $scope.gridButtonActions.length > 0;

                $scope.isInfiniteScroll = typeof($scope.isInfiniteScroll) == 'undefined' ? false : $scope.isInfiniteScroll == "true" ? true : false;

                $scope.isGridLoading = typeof($scope.isGridLoading) == 'undefined' ? true : $scope.isGridLoading == "true" ? true : false;

                $scope.enableRowSelection = typeof($scope.enableRowSelection) == 'undefined' ? true : $scope.enableRowSelection == true ? true : false;


                //local variable declaration
                var templateWithTooltip = '<div class="ngCellText" ng-class="col.colIndex()"><span  ng-cell-text><span tooltip="{{row.getProperty(col.field)}}" tooltip-placement="center" tooltip-animation="false" tooltip-append-to-body="true" tooltip-trigger="mouseenter">{{row.getProperty(col.field)}}</span></span></div>';
                var hasSearchableList = false;
                var hasErrors = false;
                var isEditingSelectList = false;
                var startCellEditEvent = "ngGridEventStartCellEdit";
                var endCellEditEvent = "ngGridEventEndCellEdit";
                var selectList = "SelectList";
                var textBox = "TextBox";
                var checkBox = "Checkbox";
                var singleCheckBox = "SingleCheckbox";
                var image = "Image";
                var imageicon = "Imageicon";
                var radioButton = "RadioButton";
                var date = "Date";
                var searchableList = "SearchableList";
                var imageNoHover = "ImageNoHover";
                var action = "Action";
                var tooltip = "Tooltip";
                var link = "Link";
                var bckgrndImage = "BckgrndImage";
                var required = "Required";
                var gridClass = "gridStyle";
                var xOffset = 30;
                var yOffset = 15;

                $scope.searchableDataModel = [];

                $scope.headerNames = [];

                $scope.colWidth = "";

                $scope.widthForEllipse = function(colWidth) {
                    var width = "";
                    if ($scope.colWidth == "") {
                        var customCheckbox = angular.element(".mmGrid-customCheckbox").width();
                        var checkWrapWidth = angular.element(".externalCheckbox .check-wrap").width();
                        width = colWidth - (customCheckbox + checkWrapWidth + 4);
                        $scope.colWidth = width + "px";
                    }
                    return $scope.colWidth;
                };

                $scope.rowHeight = 30;
                $scope.imageHeight = 50;
                $scope.imageWidth = 60;

                $scope.checkRequired = function(displayName) {
                    var col = $scope.getColumnByDisplayName(displayName);
                    if (typeof col.isRequired == "undefined" || !col.isRequired)
                        return "";
                    return "*";
                };

                function mapColumnDefsProperties() {
                    var canInsertIntoHeaderArray = $scope.headerNames.length <= 0;
                    var numOfCheckBox = 1;
                    var numOfRadio = 1;
                    var hasImage = false;
                    var customHeaderCellTemplate = '<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }">' +
                        '<div ng-click="col.sort($event)" ng-class="\'colt\' + col.index" class="ngHeaderText">{{checkRequired(col.displayName)+" "+col.displayName}}' +
                        '<i class="fa fa-caret-down ngNewSortButtonDown" ng-show="col.showSortButtonDown()"></i>' +
                        '<i class="fa fa-caret-up ngNewSortButtonUp" ng-show="col.showSortButtonUp()"></i>' +
                        '</div>' +
                        '<div class="ngSortPriority">{{col.sortPriority}}</div>' +
                        '<div ng-class="{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }" ng-click="togglePin(col)" ng-show="col.pinnable"></div>' +
                        '</div>' +
                        '<div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>';
                    for (var index = 0; index < $scope.cols.length; index++) {
                        var item = $scope.cols[index];
                        item.displayName = typeof item.displayName === "undefined" ? item.field : item.displayName;
                        item.isRequired = typeof item.isRequired === "undefined" ? false : item.isRequired;
                        //            if(item.isRequired)

                        if (canInsertIntoHeaderArray)
                            $scope.headerNames.push(item.displayName);
                        item.enableCellEditOnFocus = typeof item.isColumnEdit === "undefined" ? $scope.isCellEdit : item.isColumnEdit;
                        item.resizable = typeof item.isColumnResize === "undefined" ? true : item.isColumnResize;
                        item.sortable = typeof item.isColumnSort === "undefined" ? true : item.isColumnSort;
                        if (typeof item.sortFunction == "function") {
                            item.sortFn = item.sortFunction;
                        }
                        if (!$scope.isCentralGrid) {
                            if (typeof item.isPinned != "undefined") {
                                item.pinned = item.isPinned;
                            }
                        } else {
                            item.pinnable = false;
                        }

                        item.headerCellTemplate = customHeaderCellTemplate;
                        item.enableCellEdit = item.enableCellEditOnFocus;
                        item.isShowToolTip = typeof item.isShowToolTip === "undefined" ? false : item.isShowToolTip;
                        item.enableDragDrop = typeof item.enableDragDrop === "undefined" ? false : item.enableDragDrop;
                        if (typeof item.isColumnResize != "undefined")
                            delete item.isColumnResize;
                        if (typeof item.isColumnSort != "undefined")
                            delete item.isColumnSort;
                        if (typeof item.name != "undefined")
                            delete item.name;
                        var isEditable = false;
                        if (typeof item.enableCellEdit != "undefined") {
                            isEditable = item.enableCellEdit;
                        } else {
                            isEditable = $scope.isCellEdit;
                        }
                        item.gridControlType = typeof item.gridControlType == "undefined" ? enums.gridControlType.getName("Label") : item.gridControlType;
                        if (item.isShowToolTip) {
                            if (item.gridControlType != enums.gridControlType.getName(selectList) && item.gridControlType != enums.gridControlType.getName(radioButton) && item.gridControlType != enums.gridControlType.getName(checkBox)) {
                                item['cellTemplate'] = templateWithTooltip;
                            }
                        }
                        $scope.showIcons = true;
                        var celltemplate = "";
                        var editcelltemplate = "";
                        $scope.closeTooltipOnShieldTouch = function(event) {
                            //used to close the tooltip upon shield touch.
                            try {
                                $(event.target).closest(".ngRow").find(".tooltipIcon a").click();
                            } catch (e) {

                            }
                        }
                        switch (item.gridControlType) {
                            case enums.gridControlType.getName(textBox):
                                editcelltemplate = "<input type='text' ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\" style='height:30px;' ng-class=\"'colt' + col.index\" />";
                                item['editableCellTemplate'] = editcelltemplate;
                                item['cellClass'] = 'textBoxControl'; // + item.isShowToolTip ? " tooltipCol" : "";
                                break;

                            case enums.gridControlType.getName(selectList):
															var ddId = $scope.mmGridId + '{{col.field[0].toUpperCase()}}' + '{{col.field.slice(1, col.field.length)}}' + '{{row.rowIndex}}' + 'DropDown';
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 150;
                                celltemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{selectNameFromId(col, row.entity[col.field], row)}}</span></div>';
                                item['cellTemplate'] = celltemplate;
                                if (typeof item.listDataArray != "undefined") {
                                    //column data list
                                    if (typeof item.gridSelectSearch != "undefined" && item.gridSelectSearch) {
                                        editcelltemplate = '<div ng-if="row.entity[\'rowLocked\']" class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{selectNameFromId(col, row.entity[col.field], row)}}</span></div><div ng-if="!row.entity[\'rowLocked\']"class="gridDropdownList" ng-style="{width:col.width}"><mm-drop-down mm-id="' + ddId + '" in-grid="true" ng-style="{width:col.width}" mm-show-label="false" mm-data-model="col.colDef.listDataArray" mm-label-width="0" mm-custom-control-width="{{col.width}}" mm-model="row.entity[col.field]" mm-layout-type="custom" mm-is-required="false" mm-custom-label-padding="0" mm-disable ="false" mm-error="error" mm-select-change-func="cellFunctionToExecuteForSelectListChange(row,col,row.entity[col.field])" show-search-box></mm-drop-down></div>';
                                    } else {
                                        editcelltemplate = '<div ng-if="row.entity[\'rowLocked\']" class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{selectNameFromId(col, row.entity[col.field], row)}}</span></div><div ng-if="!row.entity[\'rowLocked\']"class="gridDropdownList" ng-style="{width:col.width}"><mm-drop-down mm-id="' + ddId + '" in-grid="true" ng-style="{width:col.width}" mm-show-label="false" mm-data-model="col.colDef.listDataArray" mm-label-width="0" mm-custom-control-width="{{col.width}}" mm-model="row.entity[col.field]" mm-layout-type="custom" mm-is-required="false" mm-custom-label-padding="0" mm-disable ="false" mm-error="error" mm-select-change-func="cellFunctionToExecuteForSelectListChange(row,col,row.entity[col.field])"></mm-drop-down></div>';
                                    }
                                } else {
                                    //programatically defined row data list
                                    if (typeof item.gridSelectSearch != "undefined" && item.gridSelectSearch) {
                                        editcelltemplate = '<div ng-if="row.entity[\'rowLocked\']" class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{selectNameFromId(col, row.entity[col.field], row)}}</span></div><div ng-if="!row.entity[\'rowLocked\']" class="gridDropdownList" ng-style="{width:col.width}"><mm-drop-down mm-id="' + ddId + '" in-grid="true" ng-style="{width:col.width}" mm-show-label="false" mm-data-model="row.entity[\'gridListDataArray\']" mm-label-width="0" mm-custom-control-width="{{col.width}}" mm-model="row.entity[col.field]" mm-layout-type="custom" mm-is-required="false" mm-custom-label-padding="0" mm-disable ="false" mm-error="error" mm-select-change-func="cellFunctionToExecuteForSelectListChange(row,col,row.entity[col.field])" show-search-box></mm-drop-down></div>';
                                    } else {
                                        editcelltemplate = '<div ng-if="row.entity[\'rowLocked\']" class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{selectNameFromId(col, row.entity[col.field], row)}}</span></div><div ng-if="!row.entity[\'rowLocked\']" class="gridDropdownList" ng-style="{width:col.width}"><mm-drop-down mm-id="' + ddId + '" in-grid="true" ng-style="{width:col.width}" mm-show-label="false" mm-data-model="row.entity[\'gridListDataArray\']" mm-label-width="0" mm-custom-control-width="{{col.width}}" mm-model="row.entity[col.field]" mm-layout-type="custom" mm-is-required="false" mm-custom-label-padding="0" mm-disable ="false" mm-error="error" mm-select-change-func="cellFunctionToExecuteForSelectListChange(row,col,row.entity[col.field])"></mm-drop-down></div>';
                                    }
                                }
                                item['editableCellTemplate'] = editcelltemplate;
                                item['cellClass'] = 'selectListControl ';
                                break;

                            case enums.gridControlType.getName(searchableList):
                                hasSearchableList = true;
                                editcelltemplate = '<div class="searchable"><mm-searchable-list ng-input="COL_FIELD" ng-model="COL_FIELD" mm-data-model="col.colDef.listDataArray" mm-model="searchableDataModel" mm-class="searchableScrollerMMGrid"></mm-searchable-list></div>';
                                item['editableCellTemplate'] = editcelltemplate;
                                item['cellClass'] = 'searchableListControl ';
                                break;

                            case enums.gridControlType.getName(date):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 150;
                                celltemplate = '<div ng-if="row.entity[\'rowLocked\']" class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | date : col.colDef.gridDateFormat }}</span></div>' +
                                    '<mm-single-date-picker in-grid="true" ng-if="!row.entity[\'rowLocked\']" ng-click="addDpZIndex($event)" ng-style="{width:col.width}" class="gridDatePicker" mm-model="COL_FIELD" mm-disable="false" mm-on-date-picker-change="funcToExecuteOnDateChange(dpObj,row,col)" mm-date-format="{{col.colDef.gridDateFormat}}"></mm-single-date-picker>';
                                item['cellTemplate'] = celltemplate;
                                item['cellClass'] = 'date';
                                break;

                            case enums.gridControlType.getName(radioButton):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 100;
                                celltemplate = '<div class="externalRadioButton"><div ng-repeat="data in col.colDef.radioButtons"><div class="radio-wrap"><input type="radio" ng-checked="row.entity[col.field]!=undefined && row.entity[col.field]==data.Id"/><label ng-click="executeFuncOnRadioClick(row,col,data)" class="radio-box" ><i class="circle"></i></label><label class="check-Text" ng-style="{width:widthForEllipse(col.width)}">{{data.text}}</label></div></div><div class="clear"></div></div>';
                                numOfRadio = item.radioButtons.length;
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(checkBox):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 100;
                                //celltemplate = "<div ng-repeat='data in col.colDef.checkboxes'><mm-CheckBox mm-caption='{{data.text}}' mmChange='executeFuncOnCheckboxClick(row,col,data,COL_FIELD)' mm-true-value='row.entity.selectedCheckboxes!=undefined && row.entity.selectedCheckboxes.indexOf(data.Id)>-1' ng-input=\"COL_FIELD\" ng-model='COL_FIELD' mm-false-value='No' mm-model='COL_FIELD' mm-is-dirty='cb.isDirty' mm-control-layout-class='col-lg-3 col-xs-1' mm-label-layout-class='col-lg-3' mm-disabled='false'></mm-CheckBox></div>";
                                //celltemplate = "<div class='externalCheckbox'><div ng-repeat='data in col.colDef.checkboxes'><div class='check-wrap'><input ng-model=\"COL_FIELD\" tabindex=\"-1\" type=\"checkbox\" ng-checked=\"row.entity[col.field]!=undefined && row.entity[col.field].indexOf(data.Id)>-1\" /><label ng-click=\"executeFuncOnCheckboxClick(row,col,data)\" class='mmGrid-customCheckbox' ><i class='glyphicon glyphicon-ok'></i></i></label></div><label  ng-style='{width:widthForEllipse(col.width)}' class='check-Text'>{{data.text}}</label></div></div><div class='clear'></div>";
                                celltemplate = '<div class="externalCheckbox"><div ng-repeat="data in col.colDef.checkboxes"><div class="check-wrap"><input ng-model="COL_FIELD" tabindex="-1" type="checkbox" ng-checked="row.entity[col.field]!=undefined && row.entity[col.field].indexOf(data.Id)>-1" /><label ng-click="executeFuncOnCheckboxClick(row,col,data)" class="mmGrid-customCheckbox" ><i class="glyphicon glyphicon-ok"></i></i></label></div><label  ng-style="{width:widthForEllipse(col.width)}" class="check-Text">{{data.text}}</label></div></div><div class="clear"></div>';
                                numOfCheckBox = item.checkboxes.length;
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(singleCheckBox):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 100;
                                celltemplate = '<div class="singleCheckbox"><div><div class="check-wrap"><input ng-model="COL_FIELD" tabindex="-1" type="checkbox" ng-checked="row.entity[col.field]" /><label ng-click="executeFuncOnCheckboxClick(row,col,null)" class="mmGrid-customCheckbox" ><i class="glyphicon glyphicon-ok"></i></i></label></div><label  ng-style="{width:widthForEllipse(col.width)}" class="check-Text"></label></div></div><div class="clear"></div>';
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(image):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 70;
                                hasImage = true;
                                if (typeof item.previewCondition != "undefined" && typeof item.noPreviewCondition != "undefined") {
                                    item.previewCondition = typeof item.previewCondition == "undefined" ? "" : item.previewCondition;
                                    item.noPreviewCondition = typeof item.noPreviewCondition == "undefined" ? "" : item.noPreviewCondition;
                                    celltemplate = '<div class="externalImage" style="cursor:pointer;" ng-click="redirectOnImageClick(row.entity[col.field].externalLink)"><img ng-mousemove="adjustPreview($event)" ng-mouseenter="showPreview($event)" ng-mouseleave="removePreview($event)" ng-if="getImageSrc(row.entity[col.field]).length > 0 && ' + item.previewCondition + '" ng-src="{{getImageSrc(row.entity[col.field])}}" /><img ng-if="getImageSrc(row.entity[col.field]).length > 0 && ' + item.noPreviewCondition + '" ng-src="{{getImageSrc(row.entity[col.field])}}" /></div>';
                                } else {
                                    celltemplate = '<div class="externalImage" style="cursor:pointer;" ng-click="redirectOnImageClick(row.entity[col.field].externalLink)"><img ng-mousemove="adjustPreview($event)" ng-mouseenter="showPreview($event)" ng-mouseleave="removePreview($event)" ng-if="getImageSrc(row.entity[col.field]).length > 0" ng-src="{{getImageSrc(row.entity[col.field])}}" /></div>';
                                }
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(imageicon):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 70;
                                hasImage = true;
                                celltemplate = '<div class="externalImage" style="cursor:pointer;" ng-click="redirectOnImageClick(row.entity[col.field].externalLink)"><img ng-if="getImageSrc(row.entity[col.field]).length > 0" ng-src="{{getImageSrc(row.entity[col.field])}}" /></div>';
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(imageNoHover):
                                if (typeof item.minWidth == "undefined")
                                    item.minWidth = 70;
                                if (item.visible === true) {
                                    hasImage = true;
                                    $scope.imageHeight = 60;
                                }
                                break;

                            case enums.gridControlType.getName(action):
                                celltemplate = '<div class="actionIcons"><a ng-if="action.showControl==undefined || action.showControl" ng-repeat="action in row.entity[col.field]" ng-click="executeIconFunction(row,col,action)"><span ng-switch="action.actionFieldType">' +
                                    '<i ng-switch-when="Icon" ng-class="[action.field, action.cssClass]" class="childAct" ></i>' +
                                    '<img ng-switch-when="Image" ng-class="action.cssClass" class="childAct gridTooltip" ng-src="{{action.field}}" height="{{action.height}}" width="{{action.width}}" tooltip-append-to-body="true" tooltip-placement="center" tooltip-animation="false" tooltip-trigger="mouseenter" tooltip="{{action.tooltip}}"/>' +
                                    '<span ng-switch-when="Text" ng-class="action.cssClass" class="actionText">{{action.field}}</span>' +
                                    '<button ng-switch-when="Button" ng-class="action.cssClass" class="mm-attach-button actionButton" type="button" class="btn btn-primary">{{action.title}}</button>' +
                                    '<span ng-switch-when="Link" ng-class="action.cssClass" class="actionLink">{{action.title}}</span>' +
                                    '<div ng-switch-when="BckgrndImage" ng-class="action.cssClass" tooltip-placement="top" tooltip-trigger="mouseenter" tooltip="{{action.tooltip}}"></div>'
                                '</span></a></div';

                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(tooltip):
                                celltemplate = '<div class="tooltipIcon"><a ng-if="tooltip.showControl==undefined || tooltip.showControl" ng-repeat="tooltip in row.entity[col.field]" ng-click="executeIconFunction(row,col,tooltip)">' +
                                    '<i ng-class="[tooltip.field , tooltip.cssClass, row.entity[\'showChild\'] ? \'clicked\' : \'\']"  class="fa fa-ellipsis-h fa-lg childAct " ></i></a></div>' +
                                    '<div ng-include src="row.entity[col.field][0].template" ng-if="row.entity[\'showChild\']"></div>';
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(required):
                                celltemplate = '<span ng-show="{{row.entity.requiredSign}}&& col.index === 0" class="mmGrid-RequiredSign">*</span>' +
                                    '<span  class="ngCellText" ng-class="col.colIndex()">{{row.entity[col.field]}}</span>';
                                item['cellTemplate'] = celltemplate;
                                break;

                            case enums.gridControlType.getName(link):
                                item.textCondition = typeof item.textCondition == "undefined" ? "" : item.textCondition;
                                item.linkCondition = typeof item.linkCondition == "undefined" ? "" : item.linkCondition;
                                item.linkClickMethod = typeof item.linkClickMethod == "undefined" ? "" : item.linkClickMethod;
                                celltemplate = '<div ng-class="col.colIndex()" class="ngCellText linkControl">' +
                                    '<span ng-if="' + item.textCondition + '">{{row.entity[col.field]}}</span>' +
                                    '<a ng-if="' + item.linkCondition + '" class="grid-anchor" ng-click="' + item.linkClickMethod + '">{{row.entity[col.field]}}</a>' +
                                    '</div>';

                                item['cellTemplate'] = celltemplate;
                            default:
                                break;
                        }
                        $scope.rowHeight = 30 * (numOfCheckBox > numOfRadio ? numOfCheckBox : numOfRadio);
                        if ($scope.rowHeight == 0)
                            $scope.rowHeight = 30;
                        if (hasImage && $scope.rowHeight < $scope.imageHeight) {
                            $scope.rowHeight = $scope.imageHeight + 12;
                        }
                        item['headerClass'] = 'ngHeaderCell';
                    }
                }

                $scope.addZIndex = function(e) {
                    angular.element(e.target).closest(".ngCell").css({
                        "z-index": 2
                    });
                };
                $scope.removeZIndex = function(e) {
                    $timeout(function() {
                        angular.element(e.target).closest(".ngCell").css({
                            "z-index": 1
                        });
                    }, 200)
                };
                $scope.addDpZIndex = function(e) {
                    var element = e.target;
                    angular.element('.ngCell').removeClass("dpIndex");
                    angular.element(element).closest('.ngCell').addClass("dpIndex");
                };

                $scope.redirectOnImageClick = function(link) {
                    if (link) {
                        if (!link.match(/^http([s]?):\/\/.*/)) {
                            link = "http://" + link;
                        }
                        window.open(link);
                    }
                };

                $scope.getImageSrc = function(field) {
                    if (field === Object(field)) {
                        return field.url;
                    }
                    return field;
                };

                $scope.showPreview = function(e) {
                    angular.element("#preview").remove();
                    var imgSrc = angular.element(e.target).attr("src");
                    angular.element("body").append("<p id='preview'><img style='max-height:300px;max-width:300px;' src='" + imgSrc + "' alt='Image preview' />" + '<br/>' + "</p>");
                    angular.element("#preview").css({
                        "top": (e.pageY - xOffset) + "px",
                        "left": (e.pageX + yOffset) + "px",
                        "z-index": 99999
                    }).show("slow");
                };

                $scope.adjustPreview = function(e) {
                    angular.element("#preview").css({
                        "top": (e.pageY - xOffset) + "px",
                        "left": (e.pageX + yOffset) + "px",
                        "z-index": 99999
                    });
                };

                $scope.removePreview = function(e) {
                    angular.element("#preview").remove();
                };

                $scope.executeIconFunction = function(row, col, action) {
                    if (typeof action.function != "undefined" && !row.entity['rowLocked'])
                        action.function(row, col, action);
                };

                $scope.funcToExecuteOnDateChange = function(data, row, col) {
                    hasErrors = false;
                    //var item = $scope.getColumnByDisplayName(col.displayName);
                    var item = col.colDef;
                    if (item != null) {
                        if (!_.isUndefined(item.validationFunction)) {
                            var validationResult = item.validationFunction(data, row, col);
                            if (!validationResult.isSuccess) {
                                hasErrors = true;
                                createErrorContainer(row, col.index, validationResult.message, null);
                                storeErrorMessageOnHScroll(row, col.index, validationResult.message, null);
                                return false;
                            } else {
                                removeErrorContainer(row, col.index, validationResult.message);
                            }
                        }
                    }
                };

                $scope.executeFuncOnRadioClick = function(row, col, radio) {
                    row.entity[col.field] = radio.Id;
                    if (typeof $scope.radioClickHandler == 'function') {
                        $scope.radioClickHandler(row, row.entity[col.field]);
                    }
                }

                $scope.executeFuncOnCheckboxClick = function(row, col, chkBox) {
                    //var testForArray = Array.isArray(row.entity[col.field]);
                    //if chkBox is null means single checkbox.
                    if (chkBox != null) {
                        var index = row.entity[col.field].indexOf(chkBox.Id);
                        if (index > -1) {
                            row.entity[col.field].splice(index, 1);
                        } else {
                            row.entity[col.field].push(chkBox.Id);
                        }

                        if (typeof $scope.checkBoxClickHandler == 'function') {
                            $scope.checkBoxClickHandler(row, row.entity[col.field]);
                        }
                    } else {
                        if (!row.entity['rowLocked']) {
                            row.entity[col.field] = !row.entity[col.field];
                            if (typeof $scope.singleCheckBoxClickHandler == 'function') {
                                $scope.singleCheckBoxClickHandler(row, col, row.entity[col.field]);
                            }
                        }
                    }
                };

                $scope.itemsToSave = [];
                var evt;

                function getSlectedObjects(listArray) {
                    var resultArray = [];
                    for (var index = 0; index < $scope.currentTextBoxValues.length; index++) {
                        var item = $scope.currentTextBoxValues[index];
                        var resultItem = _.find(listArray, function(data) {
                            return data.name.toLocaleLowerCase() == item.toLocaleLowerCase();
                        });
                        resultArray.push({
                            "id": resultItem.id,
                            "name": resultItem.name
                        });
                    }
                    return resultArray;
                };

                $scope.totalRemovedObjects = [];
                $scope.currentTextBoxValues = [];
                $scope.selectedObjects = [];
                $scope.focusInCell = function(event) {

                    var isSearchable = event.targetScope.col.colDef.gridControlType == enums.gridControlType.getName(searchableList);
                    if (!isSearchable) {
                        return false;
                    }
                    $scope.totalRemovedObjects = [];
                    $scope.currentTextBoxValues = [];
                    $scope.selectedObjects = [];
                    var element = event.targetScope.row.elm.find("mm-searchable-list");
                    var ckBox = element.find(":checkbox");
                    var row = event.targetScope.row;
                    var col = event.targetScope.col;
                    var currentTextBoxValues = row.getProperty(col.field);
                    $scope.currentTextBoxValues = currentTextBoxValues.split(',');
                    var listArray = $scope.getData(row, col);
                    $scope.selectedObjects = getSlectedObjects(listArray);
                    $scope.totalRemovedObjects = [];
                    element.find(".scrollerBox").scroll(function() {
                        ckBox = element.find(":checkbox");
                        angular.forEach(ckBox, function(checkbox, index) {
                            checkCheckBox(checkbox, $scope.selectedObjects, true);
                        });
                    });
                    angular.forEach(ckBox, function(checkbox, index) {
                        checkCheckBox(checkbox, $scope.selectedObjects, false);
                    });
                    var textBox = element.find(":text");
                    var checkedValue = element.find(".scrollerBoxItems :checkbox");

                    var clickHandler = function(e) {
                        var checkbox = $(this);
                        var isChecked = checkbox.is(":checked");
                        var chk = angular.element(checkbox);
                        var html = chk.next("span").html();
                        var valueArray = html.split(':');
                        var name = $.trim(valueArray[0]);
                        var id = $.trim(valueArray[1]);
                        var obj = {
                            "id": id,
                            "name": name
                        };
                        var isAlreadyExist = isExist($scope.selectedObjects, obj);
                        if (isChecked) {
                            if (!isAlreadyExist)
                                $scope.selectedObjects.push(obj);
                        } else {
                            $scope.selectedObjects = _.reject($scope.selectedObjects, function(x) {
                                return x.id == obj.id;
                            });
                        }
                    };
                    element.on('click', ':checkbox', clickHandler);
                    $scope.$on('$destroy', function() {
                        element.off('click', ':checkbox', clickHandler);
                        element.find(".scrollerBox").off('scroll');
                    });

                    if (textBox != null) {
                        angular.element(document).one("mousedown", function() {
                            if ($scope.selectedObjects.length > 0) {
                                //var item = $scope.getColumnByDisplayName(col.displayName);
                                var item = col.colDef;
                                if (item != null) {
                                    var value = row.getProperty(col.field);
                                    var index = getDataIndex(row);
                                    var uniqueSelectedCheckBoxArray = removeDuplicateEntries($scope.selectedObjects);
                                    if (typeof item.functionOnCellEdit == 'function') {
                                        var result = item.functionOnCellEdit(col, uniqueSelectedCheckBoxArray, index, col.field);
                                    } else {
                                        row.entity[col.field] = uniqueSelectedCheckBoxArray;
                                    }
                                    buildChangedItemsDetails(row);
                                    prepareCommaSeparatedDataForSearchableList();
                                    //$scope.$root.safeApply();//giving error
                                    $scope.$apply();
                                    $scope.totalRemovedObjects = [];
                                }
                            }
                            $scope.$broadcast(endCellEditEvent);
                        });
                    }
                };


                function checkCheckBox(checkbox, selectedCheckBoxArray, isScrolling) {
                    var chk = angular.element(checkbox);
                    var alreadyChecked = chk.is(":checked");
                    var html = chk.next("span").html();
                    var valueArray = html.split(':');
                    var id = $.trim(valueArray[1]);
                    var name = $.trim(valueArray[0]);
                    var obj = {
                        "id": id,
                        "name": name
                    };
                    var isAlreadyExist = isExist($scope.selectedObjects, obj);
                    if (isAlreadyExist) {
                        if (!alreadyChecked) {
                            chk.click();
                            $scope.$apply();
                        }
                    }
                }

                function isExist(list, obj) {
                    var data = _.find(list, function(x) {
                        return x.id == obj.id;
                    });
                    return (typeof data != "undefined")
                }

                function removeDuplicateEntries(selectedCheckBoxArray) {
                    var fields = _.pluck(selectedCheckBoxArray, 'id');
                    var uniqueArray = uniqueCollection(fields);
                    var result = [];
                    if (uniqueArray.length > 0) {
                        for (var index = 0; index < uniqueArray.length; index++) {
                            var uniqueItem = uniqueArray[index];
                            var item = _.find(selectedCheckBoxArray, function(x) {
                                return x.id == uniqueItem;
                            });
                            if (item) {
                                result.push(item);
                            }
                        }
                    }
                    return result;
                };

                function uniqueCollection(list) {
                    var result = [];
                    $.each(list, function(i, e) {
                        if ($.inArray(e, result) == -1) result.push(e);
                    });
                    return result;
                }

                function getIndex(obj) {
                    var fields = _.pluck($scope.currentTextBoxValues, 'id');
                    var index = fields.indexOf(obj.id);
                    return index;
                }

                $scope.getData = function(row, col) {
                    //var item = $scope.getColumnByDisplayName(col.displayName);
                    var item = col.colDef;
                    var selectListdata = null;
                    if (item != null) {
                        selectListdata = item.listDataArray;
                    }
                    return selectListdata;
                };

                var originalCell = {};
                var originalCellValue = "";

                $scope.storeOnFocus = function(row, col) {
                    originalCellValue = row.getProperty(col.field);
                    angular.copy(row.entity, originalCell);
                };

                $scope.selectNameFromId = function(col, selectId, row) {
                    var item = col.colDef;
                    var selectName = "";
                    var dropdownList = [];
                    if (item.listDataArray) {
                        dropdownList = item.listDataArray;
                    } else {
                        dropdownList = row.getProperty('gridListDataArray');
                    }
                    var selectItem = _.findWhere(dropdownList, {
                        'id': selectId
                    });
                    if (typeof selectItem != "undefined") {
                        selectName = _.property('name')(selectItem);
                    }
                    return selectName;
                };

                $scope.cellFunctionToExecuteForSelectListChange = function(row, col, selectedData) {
                    if (typeof selectedData === "undefined")
                        return false;
                    //var item = $scope.getColumnByDisplayName(col.displayName);
                    var item = col.colDef;
                    var selectItem = {};
                    var selectValue = "";
                    var dropdownList = [];
                    if (item != null) {
                        var index = getDataIndex(row);
                        if (typeof item.functionOnCellEdit == 'function') {
                            //changeInteractionType(col, selectedId, index, field)
                            if (item.listDataArray != undefined) {
                                dropdownList = item.listDataArray;
                            } else {
                                dropdownList = row.getProperty('gridListDataArray');
                            }
                            selectItem = _.findWhere(dropdownList, {
                                'id': selectedData
                            });
                            var result = item.functionOnCellEdit(col, selectedData, index, col.field, row, selectItem);
                        }
                        var validationResult = "";
                        if (item.validationFunction != undefined) {
                            validationResult = item.validationFunction(selectedData, row, col);
                            if (!validationResult.isSuccess) {
                                hasErrors = true;
                                createErrorContainer(row, col.index, validationResult.message, null);
                                storeErrorMessageOnHScroll(row, col.index, validationResult.message, null);
                                return false;
                            } else {
                                removeErrorContainer(row, col.index, validationResult.message, null);
                            }
                        }
                        buildChangedItemsDetails(row);
                    }
                    $scope.$broadcast(endCellEditEvent);
                };

                var getDataIndex = function(row) {
                    var data = row.entity;
                    var index = $scope.items.indexOf(data);
                    return index;
                };

                function errorContainer(errorMessage) {
                    return '<span style="margin-left:0px;z-index:100000;min-width:160px;" class="mmErrorDiv"><div ng-show="showError" class="leftarrowdiv"><span class="bot-arrow"></span><span class="mmErrorText">' + errorMessage + '</span></div></span>';

                };

                var messages = new Array();

                function storeErrorMessageOnHScroll(row, colIndex, message, elem) {
                    var errorData = {
                        row: row,
                        colIndex: colIndex,
                        rowIndex: getDataIndex(row),
                        message: message,
                        data: function() {
                            createErrorContainer(errorData.row, errorData.colIndex, errorData.message, elem);
                        }
                    };
                    messages.push(errorData);
                }

                function createErrorContainer(row, colIndex, message, element) {
                    var elem = null;
                    if (element == null)
                        elem = angular.element(row.elm).find(".col" + colIndex);
                    else
                        elem = element;
                    var formattedMsg = "";
                    if (typeof message == "object") {
                        _.each(message, function(msg) {
                            formattedMsg += msg + "<br/>";
                        });
                        message = formattedMsg;
                    }
                    if (!elem.hasClass('clsBorderRed')) {
                        elem.addClass("clsBorderRed");
                    }

                    if (angular.element(elem).find(".mmErrorDiv")) {
                        angular.element(angular.element(elem).find(".mmErrorDiv")).remove();
                    }

                    elem.children().first().after(errorContainer(message));
                };
                var reAttachingInProgress = false;

                function removeAllErrorContainer(items) {
                    for (var k = 0; k < items.length; k++) {
                        var item = items[k];
                        var rows = _.filter($scope.options.ngGrid.rowCache, function(row) {
                            return row.entity[item.fieldName] == item.value;
                        });
                        var colIndex = _.findIndex($scope.cols, function(def) {
                            return def.field == item.fieldName;
                        });
                        if (colIndex > -1) {
                            colIndex++;
                            if (!_.isUndefined(rows) && rows.length > 0) {
                                _.each(rows, function(row, index) {
                                    var colInd = colIndex;
                                    removeErrorContainer(row.clone, colInd++, item.message, null);
                                });
                            }
                        }
                    }
                }

                function removeErrorContainer(row, colIndex, message, element) {
                    var elem = null;
                    if (element == null) {
                        elem = row.elm.find(".col" + colIndex).first();
                    } else {
                        //            row.elm.find(".col" + colIndex).removeClass("clsBorderRed");
                        elem = element;
                    }
                    elem.removeClass("clsBorderRed");
                    var elemToRemove = angular.element(elem).find("span.mmErrorDiv");
                    /*if (elemToRemove.length > 0)*/
                    angular.element(elemToRemove).remove();
                    removeErrorFromCache(row, colIndex);
                };

                function getDifferenceObjs(arr1, arr2) {
                    var result = [];
                    angular.forEach(arr1, function(key) {
                        if (_.isUndefined(_.find(arr2, {
                                'value': key.value
                            }))) {
                            result.push(key);
                        }
                    });
                    return result;
                }

                function reAttachErrorMessages() {
                    if (messages.length > 0) {
                        reAttachingInProgress = true;
                        for (var index = 0; index < messages.length; index++) {
                            var item = messages[index];
                            item.data();
                        }
                    }
                    reAttachingInProgress = false;
                };

                var ngGridEventScrollWatcher = $scope.$on('ngGridEventScroll', function(event) {
                    if (typeof $scope.pagingHandler == 'function') {
                        $scope.pagingHandler(event.targetScope.gridId);
                    }
                });

                function removeErrorFromCache(row, colIndex) {
                    var currentRowIndex = getDataIndex(row);
                    var index = -1;
                    for (var i = 0; i < messages.length; i++) {
                        var item = messages[i];
                        if (item.rowIndex == currentRowIndex && colIndex == item.colIndex) {
                            index = i;
                            break;
                        }
                    }
                    if (index != -1)
                        messages.splice(index, 1);

                };

                $scope.cellFunctionToExecuteOnTextChange = function(row, col) {
                    hasErrors = false;
                    //var item = $scope.getColumnByDisplayName(col.displayName);
                    var item = col.colDef;
                    if (item != null) {
                        var value = row.getProperty(col.field);
                        //            if (value == originalCellValue) {
                        //              return false;
                        //            }
                        var validationResult = "";
                        if (item.validationFunction != undefined) {
                            validationResult = item.validationFunction(row);
                            if (!validationResult.isSuccess) {
                                hasErrors = true;
                                createErrorContainer(row, col.index, validationResult.message, null);
                                storeErrorMessageOnHScroll(row, col.index, validationResult.message, null);
                                return false;
                            } else {
                                removeErrorContainer(row, col.index, validationResult.message, null);
                            }
                        }

                        var index = 0;
                        if ($scope.selectedItems.length <= 0) {
                            index = getDataIndex(row);
                        }
                        if (typeof item.functionOnCellEdit == 'function') {
                            var result = item.functionOnCellEdit(col, value, index, col.field, row);
                            if (!result.isSuccess) {
                                createErrorContainer(row, col.index, result.message, null);
                                hasErrors = true;
                            } else {
                                removeErrorContainer(row, col.index, result.message, null);
                            }
                        } else {
                            hasErrors = false;
                            removeErrorContainer(row, col.index, '', null);
                            angular.element(document).click();
                            row.entity[col.field] = value;
                            buildChangedItemsDetails(row);
                        }
                    }
                };

                $scope.getColumnByDisplayName = function(name) {
                    var col = null;
                    for (var index = 0; index < $scope.cols.length; index++) {
                        var item = $scope.cols[index];
                        if (item.displayName == name) {
                            col = item;
                            break;
                        }
                    }
                    return col;
                }

                mapColumnDefsProperties();

							var isShowFilter = ($scope.showFilter && !$scope.isCentralGrid);
                var checkBoxTemplate = "<div class=\"ngSelectionCell\"><div class='check-wrap'><input id=\"{{mmGridId + 'Checkbox' + row.rowIndex}}\" tabindex=\"-1\" class=\"ngSelectionCheckbox\" type=\"checkbox\" ng-checked=\"row.selected\" /><label data-ng-click='' class='mmGrid-customCheckbox click-check checkboxRowSelect' ><i class='glyphicon glyphicon-ok'></i></i></label></div></div>";
                var commonHeaderCheckBoxTemplate = "<input id=\"{{mmGridId + 'CheckboxHeader'}}\" class=\"ngSelectionHeader\" type=\"checkbox\" ng-show=\"multiSelect && enableRowSelection\" ng-model=\"allSelected\" /><label data-ng-click='clickMasterCheckBox($event)' class='mmGrid-customCheckbox' ><i class='glyphicon glyphicon-ok'></i></i></label>";
                var headerCheckBoxTemplateWithoutMaster = "<div style='display: none;' class='check-wrap'>" + commonHeaderCheckBoxTemplate + "</div>";
                var headerCheckBoxTemplateWithMaster = "<div class='check-wrap'>" + commonHeaderCheckBoxTemplate + "</div>";
                var rowTemplate = '<div ng-class="{disabledRow: row.entity[\'rowLocked\'], disabledSelect: !row.entity[\'selectEnabled\']}"><div id="{{mmGridId + col.field[0].toUpperCase() + col.field.slice(1, col.field.length) + row.rowIndex}}" ng-dblclick="onDblClickRow(row)" ng-style="{\'cursor\': row.cursor, \'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" sglclick="onRowClick(row,$event)" class="ngCell {{col.cellClass}}" ng-cell></div></div>';
                var rowTemplateNoCheckbox = '<div ng-class="{disabledRow: row.entity[\'rowLocked\']}"><div id="{{mmGridId + col.field + row.rowIndex}}" ng-dblclick="onDblClickRow(row)" ng-style="{\'cursor\': row.cursor, \'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-cell></div></div>';
                var pagingOptions = {
                    pageSizes: [250, 500, 1000],
                    pageSize: 250,
                    totalServerItems: 0,
                    currentPage: 1
                };
                if ($scope.isInfiniteScroll) {
                    pagingOptions = {
                        pageSizes: [50, 100, 200],
                        pageSize: $scope.pageSize,
                        currentPage: $scope.currentPage
                    };
                }
                var customOptions = {
                    enableCellEditOnFocus: $scope.isCellEdit,
                    showSelectionCheckbox: $scope.showSelectionCheckbox,
                    enableColumnReordering: $scope.isColumnReorder,
                    enablePinning: $scope.isColumnFreeze,
                    isSingleSelect: $scope.isSingleSelect,
                    multiSelect: !$scope.isSingleSelect,
                    enableColumnResize: $scope.enableColumnResize,
                    enableSorting: $scope.isSort,
                    showFilter: isShowFilter,
                    showColumnMenu: $scope.isShowMenu,
                    showGroupPanel: false,
                    showFooter: false,
                    jqueryUITheme: true,
                    useExternalSorting: false,
                    enablePaging: $scope.isInfiniteScroll,
                    pagingOptions: pagingOptions,
                    rowTemplate: ($scope.showSelectionCheckbox) ? rowTemplate : rowTemplateNoCheckbox,
                    checkboxCellTemplate: checkBoxTemplate,
                    selectWithCheckboxOnly: true, //required so that click and double click functions are called before afterSelectionChange
                    checkboxHeaderTemplate: ($scope.isSingleSelect || !$scope.enableRowSelection) ? headerCheckBoxTemplateWithoutMaster : headerCheckBoxTemplateWithMaster,
                    afterSelectionChange: function(rowItem, event) {
                        if (!isInit && typeof $scope.afterSelectionChange == 'function') {
                            if (!$scope.showSelectionCheckbox && rowItem.selected) {
                                $scope.afterSelectionChange(rowItem.entity);
                            } else if ($scope.showSelectionCheckbox) {
                                $scope.afterSelectionChange(rowItem.entity);
                            }
                        }
                    }
                };
                //rowTemplate: ($scope.showSelectionCheckbox) ? rowTemplate : rowTemplateNoCheckbox,

                //get selected row data for afterSelectionChange function from various click events
                $scope.clickCheck = function(row, event) {
                    if (checkSelectEnabled(row)) {
                        row.setSelection(!row.selected);
                    }
                };

                $scope.onDblClickRow = function(rowItem) {
                    if (!$scope.showSelectionCheckbox && !rowItem.selected || $scope.showSelectionCheckbox) {
                        if (checkSelectEnabled(rowItem)) {
                            rowItem.setSelection(!rowItem.selected);
                        }
                    }
                    if (typeof $scope.dbClickHandler == 'function') {
                        $scope.removePreview();
                        $scope.dbClickHandler(rowItem.entity);
                    }
                };

                //requires singleClick directive to differentiate between single and double click for the click event handling
                //only called if grid configured with checkboxes
                $scope.onRowClick = function(row, event) {
                    var checkboxTargetType = event.target.className; //on checkbox select
                    var parent = event.target.parentElement;
                    if (parent == null) return; //return from here if parent is null
                    var checkboxParentType = event.target.parentElement.className; //oncheckbox deselect
                    //ignore CSB tag filter clicks
                    if (checkboxParentType.search("tagFilter") == -1) {
                        //toggle row select on checkbox click and clear all selections then toggle row select on row click
                        if (checkboxTargetType.search("checkboxRowSelect") == -1 && checkboxParentType.search("checkboxRowSelect") == -1) {
                            //clear all selections first
                            if ($scope.selectedItems.length > 0 && $scope.enableRowSelection) {
                                $scope.options.selectAll(false);
                            }
                            if (checkSelectEnabled(row)) {
                                row.setSelection(!row.selected);
                            }
                        } else if (checkSelectEnabled(row)) {
                            row.setSelection(!row.selected);
                        }
                    }
                };

                function checkSelectEnabled(row) {
                    if ($scope.enableRowSelection) {
                        if ((!$scope.enableSelectedRowSelection || row.entity.selectEnabled == undefined || row.entity.selectEnabled)) {
                            if ($scope.selectEnabledMessage) {
                                mmAlertService.addSuccess($scope.selectEnabledMessage);
                            }
                            return true
                        }
                    }
                    if ($scope.selectDisabledError) {
                        mmAlertService.addWarning($scope.selectDisabledError);
                    }
                    return false;
                }

                $scope.clickHeaderCheck = function(event) {
                    var element = $(".gridStyle :checkbox:not(:visible):first");
                    var headerCheckbox = $("#masterCheck");
                    $timeout(function() {
                            headerCheckbox.click();
                            element.click();
                        }, 100)
                        //          $scope.$root.safeApply();
                };

                $scope.clickMasterCheckBox = function(event) {
                    var element = angular.element(angular.element(event.target).prev()[0]);
                    var unCheck = false;
                    if (!element.hasClass("ngSelectionHeader")) {
                        element = angular.element(angular.element(event.target).parent().prev()[0]);
                        unCheck = true;
                    }
                    $timeout(function() {
                        element.click();
                    }, 100)
                    for (var i = 0, len = $scope.items.length; i < len; i++) {
                        var row = {
                            entity: $scope.items[i]
                        };
                        if (checkSelectEnabled(row)) {
                            if (unCheck) {
                                $scope.options.selectRow(i, false);
                            } else {
                                $scope.options.selectRow(i, true);
                            }
                        }
                    }
                    //          $scope.$root.safeApply();
                };

                function prepareCommaSeparatedDataForSearchableList() {
                    for (var index = 0; index < $scope.items.length; index++) {
                        var item = $scope.items[index];
                        for (var property in item) {
                            if (Object.prototype.toString.call(item[property]) === "[object Array]") {
                                var arrayData = angular.copy(item[property]);
                                var checkIfSearchableList = typeof arrayData[0].name != "undefined"; //if array have name prop then it is searchable list
                                if (checkIfSearchableList) {
                                    var childArray = [];
                                    for (var childIndex = 0; childIndex < arrayData.length; childIndex++) {
                                        var arrayItem = arrayData[childIndex];
                                        childArray.push(arrayItem.name);
                                    }
                                    var commaSeparatedData = childArray.toString();
                                    item[property] = commaSeparatedData;
                                }
                            }
                        }
                    }
                }

                if (hasSearchableList) {
                    prepareCommaSeparatedDataForSearchableList();
                }

                var fixedOptions = {
                    columnDefs: $scope.cols,
                    data: 'items'
                };
                $scope.filterOptions = {
                    filterText: $scope.filterText
                };
                var defaultOptions = {
                    selectedItems: $scope.selectedItems,
                    headerRowHeight: 34,
                    rowHeight: $scope.rowHeight,
                    filterOptions: $scope.filterOptions,
                    enableRowSelection: $scope.enableRowSelection,
					selectionCheckboxColumnWidth: $scope.selectionCheckboxColumnWidth
                };

                var filterTextWatcher = $scope.$watch("filterText", function() {
                    $scope.filterOptions.filterText = $scope.filterText;
                    //          if ($scope.filterOptions.filterText != "") {
                    var ngSelectionHeader = angular.element(".ngSelectionHeader");
                    if (ngSelectionHeader.is(":checked")) {
                        var cache = $scope.options.ngGrid.rowCache;
                        if (cache.length > 0) {
                            for (var index = 0; index < cache.length; index++) {
                                var item = cache[index];
                                $scope.selectedItems.push(item.entity);
                            }
                            if ($scope.selectedItems.length > 0) {
                                $scope.options.selectAll(true);
                            }
                        }
                    }
                    //          }
                });


                var enableRowSelectionWatcher = $scope.$watch("enableRowSelection", function() {
                    if ($scope.options.ngGrid) {
                        $scope.options.ngGrid.config.enableRowSelection = $scope.enableRowSelection;
                        if (!$scope.enableRowSelection) {
                            $scope.options.ngGrid.config.enableCellEdit = $scope.options.ngGrid.config.enableCellEditOnFocus = $scope.enableRowSelection;
                        }
                    }
                });
                var sourceCol;
                var sourceRow;
                var sourceColDef;

                if ($scope.enableCellEditDragDrop) {
                    angular.element('.' + gridClass).sortable({
                        items: 'span',
                        cursor: 'crosshair',
                        connectWith: '.' + gridClass,
                        axis: 'y',
                        dropOnEmpty: false,
                        start: function(e, ui) {
                            var scope = angular.element(ui.item).scope();
                            sourceRow = scope.row;
                            sourceCol = scope.col;
                            if (typeof sourceCol != "undefined")
                                sourceColDef = sourceCol.colDef;
                        },
                        stop: function(e, ui) {
                            if (typeof sourceCol == "undefined" || !sourceColDef.enableDragDrop)
                                return false;
                            var sourceFieldName = sourceCol.colDef.field;
                            var sourceValue = ui.item[0].innerHTML;
                            if (angular.element(ui.item[0]).hasClass("mmErrorText"))
                                return false;
                            var targetOffset = ui.offset;
                            var targetElement = document.elementFromPoint(targetOffset.left, targetOffset.top);
                            angular.element(targetElement).parent().click();
                            if (evt == undefined) {
                                $scope.$broadcast(endCellEditEvent);
                                return false;
                            }
                            var targetRow = evt.targetScope.row;
                            var targetCol = evt.targetScope.col;
                            var targetColDef = targetCol.colDef;
                            if (!targetColDef.enableCellEdit) {
                                $scope.$broadcast(endCellEditEvent);
                                return false;
                            }
                            var targetFieldName = targetCol.colDef.field;
                            if (sourceFieldName == "undefined" || targetFieldName == "undefined" || sourceFieldName != targetFieldName) {
                                $scope.$broadcast(endCellEditEvent);
                                return false;
                            }
                            var entity = targetRow.entity;
                            if (targetColDef.gridControlType == enums.gridControlType.getName(textBox)) {
                                entity[targetCol.field] = sourceValue;
                                if (typeof targetColDef.functionOnCellEdit == 'function')
                                    $scope.cellFunctionToExecuteOnTextChange(targetRow, targetCol);
                            } else if (targetColDef.gridControlType == enums.gridControlType.getName(selectList)) {
                                $scope.$broadcast(endCellEditEvent);
                                return false;
                            } else if (targetColDef.gridControlType == enums.gridControlType.getName(searchableList)) {
                                $scope.$broadcast(endCellEditEvent);
                                return false;
                            }
                            $scope.$broadcast(endCellEditEvent);
                            return false;
                        }
                    });
                }
                var isInit = true;
                $scope.options = {
                    init: function() {
                        $timeout(function() {
                            angular.element('.customCheck').checkbox();
                            angular.element('.ngGrid').trigger('resize');
                            angular.element(".ngCanvas > .ngRow").find("div:first").removeClass("pinned");

                            angular.element(document).click(function(e) {
                                var target = $(e.target);
                                if (!target.hasClass("ngCell") && target.closest(".ngCell").length == 0) {
                                    var ngCell = angular.element('.ngCell');
                                    ngCell.removeClass("dpIndex");
                                }
                            });

                            if (typeof $scope.gridHeight == "undefined" || $scope.gridHeight == "") {
                                $scope.gridHeight = $element.parent().height();
                            }
                            if (typeof $scope.gridWidth == "undefined" || $scope.gridWidth == "") {
                                $scope.gridWidth = "100%";
                            }
                            //              $scope.options.ngGrid.elementDims.rowSelectedCellW = 34;
                            //              $scope.options.ngGrid.buildColumns();
                            /*angular.element('.ngViewport').scroll(function () {
                             angular.element('.check-wrap').parent().prev('.ngVerticalBar').remove();
                             });*/
                            $timeout(function() {
                                if ($scope.showSelectionCheckbox) {
                                    //                  angular.element(".gridStyle.central-grid .ngRow .ngCell:nth-child(2) .ngCellText span").css("opacity", ".65");
                                    //                  angular.element(".gridStyle.common-grid .ngRow .ngCell:nth-child(2) .ngCellText span").css("opacity", ".65");
                                } else {
                                    //                  angular.element(".gridStyle.central-grid .ngRow .ngCell:nth-child(1) .ngCellText span").css("opacity", ".65");
                                    //                  angular.element(".gridStyle.common-grid .ngRow .ngCell:nth-child(1) .ngCellText span").css("opacity", ".65");
                                }
                                angular.element('.check-wrap').parent().prev('.ngVerticalBar').remove();
                                //run selects at init if there is a function
                                if (typeof $scope.selectedRowHandler == 'function') {
                                    selectRowHandler($scope.selectedRowHandler());
                                }
                                if (typeof $scope.selectedCellHandler == 'function') {
                                    selectCellHandler($scope.selectedCellHandler());
                                }
                                $scope.isGridLoading = false;
                                isInit = false;
                            }, 1);

                        }, 100)
                    }

                };

                if ($scope.showSelectionCheckbox) {
                    angular.element(".gridStyle.common-grid").on("click", ".ngHeaderCell:not(.ngHeaderCell:nth-child(1))", function() {
                        angular.element(".ngHeaderCell").removeClass("active");
                        angular.element(this).addClass("active");

                    });
                } else {
                    angular.element(".gridStyle.common-grid").on("click", ".ngHeaderCell", function() {
                        angular.element(".ngHeaderCell").removeClass("active");
                        angular.element(this).addClass("active");
                    });
                }

                /*function getRowIndexByFieldNameAndValue(name, value) {
                  return _.findIndex($scope.items, function (item) {
                    return item[name] == value;
                  });
                }*/

                function selectRowHandler(result) {
                    if (typeof result != "undefined" && _.isArray(result)) {
                        for (var i = 0; i < result.length; i++) {
                            var res = result[i];
                            var index = _.findIndex($scope.items, function(item) {
                                return item[res.fieldName] == res.value;
                            });
                            if (index > -1)
                                $scope.options.selectRow(index, true);
                        }
                    }
                }

                function selectCellHandler(result) {
                    if (typeof result != "undefined") {
                        var row = _.find($scope.options.ngGrid.rowCache, function(row) {
                            return row.entity[result.fieldName] == result.value;
                        });
                        if (!_.isUndefined(row)) {
                            var colIndex = _.findIndex($scope.cols, function(def) {
                                return def.field == result.fieldName;
                            });
                            if (colIndex > -1) {
                                colIndex++;
                                angular.element('.ngCanvas .ngRow').eq(row.rowIndex).find('.ngCellText.col' + colIndex + '.' + 'colt' + colIndex + '.textBoxControl').children().first().click();
                            }
                        }
                    }
                };

                var selectedRowHandlerWatcher = $scope.$watch($scope.selectedRowHandler, function(newValue, oldValue) {
                    if (isInit) return false; //don't invoke on grid init as rowcache is not built at that time.
                    $timeout(function() {
                        if (typeof $scope.selectedRowHandler == 'function') {
                            selectRowHandler($scope.selectedRowHandler());
                        }
                    }, 50);
                }, true);

                var selectedCellHandlerWatcher = $scope.$watch($scope.selectedCellHandler, function(newValue, oldValue) {
                    if (isInit) return false; //don't invoke on grid init as rowcache is not built at that time.
                    $timeout(function() {
                        if (typeof $scope.selectedCellHandler == 'function') {
                            selectCellHandler($scope.selectedCellHandler());
                        }
                    }, 50);
                }, true);

                var genericValidationHandlerWatcher = $scope.$watch($scope.genericValidationHandler, function(newValue, oldValue) {
                    if (isInit) return false;
                    var fieldsToBeClean = [];
                    if (newValue && _.isEmpty(newValue.fields)) fieldsToBeClean = getDifferenceObjs(oldValue.fields, newValue.fields);
                    $timeout(function() {
                        if (typeof $scope.genericValidationHandler == 'function') {
                            var validationResult = $scope.genericValidationHandler();
                            if (_.isUndefined(validationResult) || validationResult.isSuccess) {
                                //remove the error message from the items that become valid
                                if (!_.isEmpty(fieldsToBeClean)) removeAllErrorContainer(fieldsToBeClean);
                                return false;
                            }
                            hasErrors = true;
                            if (newValue && newValue.fields) {
                                removeAllErrorContainer(newValue.fields);
                            }
                            for (var index = 0; index < validationResult.fields.length; index++) {
                                var result = validationResult.fields[index];
                                var rows = _.filter($scope.options.ngGrid.rowCache, function(row) {
                                    return row.entity[result.fieldName] == result.value && !row.entity.isValid; //TODO how to add the isValid property on the entity obj
                                });
                                var colIndex = _.findIndex($scope.cols, function(def) {
                                    return def.field == result.fieldName;
                                });
                                if (colIndex > -1) {
                                    colIndex++;
                                    if (!_.isUndefined(rows) && rows.length > 0) {
                                        _.each(rows, function(row, index) {
                                            var colInd = colIndex;
                                            //passing grid id to display message on correct grid.
                                            var elem = angular.element('.gridStyle.' + $scope.options.ngGrid.gridId + ' .ngCanvas .ngRow').eq(row.rowIndex).find('.ngCell.col' + colInd).first();
                                            createErrorContainer(row, colInd++, result.message, elem);
                                            storeErrorMessageOnHScroll(row, colInd++, result.message, elem);
                                        });
                                    }
                                }
                            }
                        }
                    }, 100);
                }, true);

                angular.extend($scope.options, defaultOptions);
                angular.extend($scope.options, customOptions);
                angular.extend($scope.options, fixedOptions);

                $scope.filteredItems = 0;
                var ngGridEventRowsWatcher = $scope.$on('ngGridEventRows', function() {
                    if (typeof($scope.options.ngGrid) != 'undefined') {
                        $scope.filteredItems = $scope.options.ngGrid.filteredRows.length;
                    }
                });
                var targetScope;

                var startCellEditEventWatcher = $scope.$on(startCellEditEvent, function(event) {
                    evt = event;
                    var instancesOfSelectListAlreadyOpen = angular.element(".gridDropdownList:visible").length;
                    if (instancesOfSelectListAlreadyOpen > 1) {
                        $scope.$broadcast(endCellEditEvent);
                    }
                    if (typeof event.targetScope == "undefined")
                        return false;
                    var colDef = event.targetScope.col.colDef;
                    if (typeof $scope.startCellEditFunction == "function") {
                        var result = $scope.startCellEditFunction({
                            parameter: event.targetScope
                        });
                        if (typeof result != undefined && typeof result == "boolean" && result == false) {
                            targetScope = undefined;
                            $timeout(function() {
                                $scope.$broadcast(endCellEditEvent);
                            }, 1)
                            return false;
                        }
                    }
                    if (colDef.gridControlType == enums.gridControlType.getName(selectList)) {
                        isEditingSelectList = true;
                    }
                    if (colDef.gridControlType == enums.gridControlType.getName(textBox)) {
                        targetScope = event.targetScope;
                        $scope.storeOnFocus(targetScope.row, targetScope.col);
                    } else targetScope = undefined;
                    $scope.focusInCell(event);
                });

                var endCellEditEventWatcher = $scope.$on(endCellEditEvent, function(event) {
                    isEditingSelectList = false;
                    if (targetScope != undefined) {
                        var row = targetScope.row;
                        var col = targetScope.col;
                        $scope.cellFunctionToExecuteOnTextChange(row, col);
                        targetScope = undefined;
                    }
                });

                var buildChangedItemsDetails = function(row) {
                    if (typeof $scope.selectedItems != undefined && $scope.selectedItems.length > 0) {
                        for (var i = 0; i < $scope.selectedItems.length; i++) {
                            var selectedItem = $scope.selectedItems[i];
                            var index = $scope.itemsToSave.indexOf(selectedItem);
                            insertOrUpsertItems(selectedItem, i);
                        }
                    } else if (typeof row != undefined) {
                        var item = row.entity;
                        insertOrUpsertItems(item, $scope.itemsToSave.indexOf(item));
                    }
                };

                var insertOrUpsertItems = function(item, index) {
                    if (index != -1) {
                        $scope.itemsToSave[index] = item;
                    } else {
                        $scope.itemsToSave.push(item);
                    }
                };

                $scope.saveData = function() {
                    if (hasErrors) {
                        mmAlertService.addError("Please correct the errors!");
                    } else if ($scope.itemsToSave.length > 0) {
                        mmAlertService.addSuccess("Changes saved successFully!");
                    } else {
                        mmAlertService.addWarning("No changes found!");
                    }
                    $scope.itemsToSave = [];
                };

                //If all items deleted and header checkbox is checked then force it to uncheck.
                var selectedItemsWatcher = $scope.$watch("selectedItems", function() {
                    if ($scope.selectedItems && $scope.selectedItems.length <= 0) {
                        var ngSelectionHeader = angular.element(".ngSelectionHeader");
                        if (typeof ngSelectionHeader != "undefined" && ngSelectionHeader.length > 0 && ngSelectionHeader.is(":checked")) {
                            $timeout(function() {
                                ngSelectionHeader.click();
                            }, 10);
                        }
                    }
                }, true);

                $scope.toggleSearch = function(event) {
                    $scope.showSearchBox = !$scope.showSearchBox;
                    var target = $(event.target).closest("li").find("button");
                    if ($scope.showSearchBox) {
                        target.addClass("active");
                    } else {
                        target.removeClass("active");
                    }
                };
                $scope.toggleSetting = function(event) {
                    var elem = $(".master-add ul.masterUl");
                    var target = $(event.target).closest("li").find("button");
                    var isVisible = elem.is(":visible");
                    if (isVisible) {
                        elem.hide();
                        target.removeClass("active");
                    } else {
                        target.addClass("active");
                        $scope.showSortBySubCategory = false;
                        elem.show();
                    }
                };

                $scope.redirectToPage = function(pgurl, paramName, paramValue) {
                    var stateDetails = {};
                    stateDetails[paramName] = paramValue;
                    $state.go(pgurl, stateDetails);
                };

                $scope.$on('$destroy', function() {
                    //de-register all watchers and on events
                    endCellEditEventWatcher();
                    startCellEditEventWatcher();
                    ngGridEventRowsWatcher();
                    ngGridEventScrollWatcher();
                    filterTextWatcher();
                    enableRowSelectionWatcher();
                    selectedRowHandlerWatcher();
                    selectedCellHandlerWatcher();
                    genericValidationHandlerWatcher();
                    selectedItemsWatcher();
                });
            }
        ]
    };
}]);
