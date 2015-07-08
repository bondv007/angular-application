/**
 * Created by alon.shemesh on 3/31/14.
 */
'use strict';

app.controller('mmHistoryCtrl', ['$scope', '$modalInstance', 'enums', '$filter', 'obj', 'mmUtils', function ($scope,  $modalInstance, enums, $filter, obj, mmUtils) {
	$scope.gridColumns = {
		main : [
			{field: 'iconPanel', displayName: '', isRequired: false, width: 50, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Tooltip")},
			{field: 'changeDate', displayName: 'Date Time', isColumnEdit: false, width: 170, gridControlType: enums.gridControlType.getName("Label")},
			{field: 'name', displayName: 'Name', review: true, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Label")},
			{field: 'action', displayName: 'Action', isColumnEdit: false, width: 100, gridControlType: enums.gridControlType.getName("Label")},
			{field: 'perfomedBy', displayName: 'Preformed by', isColumnEdit: false, gridControlType: enums.gridControlType.getName("Label")}]
	};
	initialPage();
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	function initialPage(){
		$scope.history = {items: [],
                                  filterText:"",
                                  filteredItemCount :""};
		if(obj && obj instanceof Array) {
			for(var i=0 ; i < obj.length; i++){
                if(obj[i].propertyChange){
                    var expansionItem = {changeDate: $filter('date')(obj[i].changedDate,'yyyy-MM-dd HH:mm:ss'), name:$filter("translate")("History." + obj[i].propertyChange.field) + ' (' + (obj[i].entityId) + ')',
                        action:'Updated',perfomedBy: obj[i].changerUserName + ' : ' + obj[i].changerUserId + ' (' + obj[i].changerAccountName + ' : ' + obj[i].changerAccountId  + ')',
                        iconPanel:[{template: "infra/views/mmHistoryExtansion.html",  width: 400, function: toggleHistory, showControl: true, cssClass: "overrideHide"}],
                        showChild: false,
                        extansions:[]}
                    if(obj[i].propertyChange && obj[i].propertyChange.propertyChanges && obj[i].propertyChange.propertyChanges.length > 0){
                                SearchForChanges(obj[i].propertyChange.propertyChanges,  obj[i].changedDate, obj[i].changerUserId, expansionItem.extansions);
                    }
                    if(expansionItem.extansions.length > 0){
                      $scope.history.items.push(expansionItem);
                    }
                }
                else{ //custom history

                    $scope.history.items.push({changeDate: $filter('date')(obj[i].changedDate,'yyyy-MM-dd HH:mm:ss'),
                        name:mmUtils.utilities.replaceParams($filter("translate")(obj[i].historyCodeInt.toString()), obj[i].params),
                        action:obj[i].operationType,
                        perfomedBy:  obj[i].changerUserName + ' : ' + obj[i].changerUserId + ' (' + obj[i].changerAccountName + ' : ' + obj[i].changerAccountId  + ')'})
                }
			}
		}
	}
	function toggleHistory(row, col, action) {
			var openHistoryRow = _.findWhere($scope.history.items, {showChild: true});
			if (openHistoryRow === undefined) {
				//nothing opened
				row.entity.showChild = !row.entity.showChild;
			} else if (openHistoryRow != undefined && row.entity.showChild) {
				row.entity.showChild = !row.entity.showChild;
			} else if (openHistoryRow != undefined && !row.entity.showChild) {
				row.entity.showChild = !row.entity.showChild;
				openHistoryRow.showChild = false;
			}
	}
    function SearchForChanges(list, date, userId, expansionItem, userName){
            for(var i=0 ; i < list.length ; i++){
                if(list[i].propertyChanges && list[i].propertyChanges.length > 0){
                    if(list[i].changeType && list[i].changeType == 'Add' || list[i].changeType == 'Delete' || list[i].changeType == 'Modify'){
                        var expansionInnerItem = {changeDate: $filter('date')(date,'yyyy-MM-dd HH:mm:ss'), name: $filter("translate")("History." + list[i].parentField + '.' + list[i].changeType) , action:'Updated',perfomedBy: userId,
                            iconPanel:[{template: "infra/views/mmHistoryExtansion.html",  width: 400, function: toggleHistory, showControl: true, cssClass: "overrideHide"}],
                            showChild: false,
                            extansions:[]}
                            addExtension(list[i].propertyChanges, expansionInnerItem.extansions);
                            $scope.history.items.push(expansionInnerItem);
                    }
                    else{
                        SearchForChanges(list[i].propertyChanges, date, userId, expansionItem );
                    }
                }
                else if(list[i].objectPropertyChangeList && list[i].objectPropertyChangeList.length > 0){
                    SearchForChanges(list[i].objectPropertyChangeList, date, userId);
                }
                else{
                    addExtensionRow(expansionItem, list[i])
                }
            }
        }

    function addExtension(changeList, extension){
        for(var i=0 ; i< changeList.length ; i++){
            addExtensionRow(extension, changeList[i]);
        }
    }

    function addExtensionRow(extension, row){
        extension.push({oldValue:  row.field && row.field.indexOf("Type") > -1 ?  $filter("translate")(row.valueOld) : row.valueOld ,
                        newValue:  row.field && row.field.indexOf("Type") > -1 ? $filter("translate")(row.valueNew) : row.valueNew,
                        field: $filter("translate")("History." + row.parentField + "." + row.field)});
    }
}]);
