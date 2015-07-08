/**
 * Created by Cathy Winsor on 6/9/14.
 */
app.controller('sitesectionsCtrl', ['$scope', 'EC2Restangular', 'mmModal', 'infraEnums', 'adminUtils', 'entityMetaData',
  function ($scope, EC2Restangular, mmModal, infraEnums, adminUtils, entityMetaData) {

    var type = 'sitesection';
    var centralSiteSectionActions = [
      { name: 'Delete', func: onDeleteBtnClicked, relationType: infraEnums.buttonRelationToRowType.any}
    ];

    $scope.centralDataObject = [
      { type: 'sitesection', centralActions: centralSiteSectionActions, dataManipulator: null, isEditable: true, editButtons: [] }
    ];

    var isModalConfirmDeleteOpen = false;
    function onDeleteBtnClicked(items, selectedItems){
      if(isModalConfirmDeleteOpen){
        return;
      }
      isModalConfirmDeleteOpen = adminUtils.crudOperations.deleteEntities(items, selectedItems, entityMetaData[type].name);
    }
}]);
