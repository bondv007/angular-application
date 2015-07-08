/**
 * Created by Asaf David on 2/12/15.
 */

app.directive('centralGridRow',centralGridRowDirective);

/**
 * @ngdoc directive
 * @name centralGridRowDirective
 * @module MediaMindApp
 *
 * @restrict E
 *
 * @description
 * `<central-grid-row>` represents one row in in central-grid directive.
 *
 *
 * @usage
 * <hljs lang="html">
 *
 * <central-grid-row>
 * </central-grid-row>
 *
 * </hljs>
 */
function centralGridRowDirective() {
  return {
    restrict: 'E',
    require: '^central',
    scope: false,
    controller: ['$scope', rowController],
    templateUrl: 'infra/central/views/centralGridRow.html'
  };

  function rowController($scope) {
    /**
     * Select a specific row in the grid
     *
     * @param dataObj
     * @param item
     */
    $scope.selectRowCheckBox = function(dataObj, item){
      $scope.removeSelectedItems(dataObj, item);
      $scope.displayData.dataObj = dataObj;
      if (item.isSelected){
        dataObj.selectedItems.push(item);
        $scope.displayData.currentSelectedItem = item;
        dataObj.isAllSelected = dataObj.selectedItems.length == dataObj.filteredList.length;
      }
      else{
        _.remove(dataObj.selectedItems, {'id': item.id});
        dataObj.isAllSelected = false;
      }

      $scope.changeButtonsState(dataObj);
      $scope.setSelectionInColumn(dataObj, item);
    };

    /**
     * Handles double click
     * @param dataObj
     * @param item
     */
    $scope.rowDoubleCLick = function (dataObj, item){
      if (dataObj.isEditable){
        $scope.goToFullPage();
      }
    };

    /**
     * Opens an entral
     * @param dataObj
     * @param item
     */
    $scope.openEntralOnLinkClick = function (dataObj, item){
      if(!dataObj.allowEditInEntral){
        $scope.selectGridRow(dataObj.indexLocation, item);
        $scope.rowDoubleCLick(dataObj, item);
      } else if (dataObj.isEditable || dataObj.allowNewInEntral){
        $scope.displayData.shouldOpenEntral = true;
      }
    };

    /**
     * Returns the value of a specific column
     * @param item
     * @param col
     * @returns {*}
     */
    $scope.getInnerField = function (item, col) {
      var field = item;
      if (col.isInner) {
        field = $scope.getInnerMember(item, col.field);
      } else {
        field = item[col.field];
      }

      return field;
    };
    /**
     * Evaluates cell value using "dot notation" expression.
     *
     * @param item
     * @param innerField
     * @returns {*}
     */
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
  };
}
