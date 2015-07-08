/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('campaignsCtrl', ['$scope', 'mmModal', 'EC2Restangular', 'mmAlertService', '$stateParams', 'adminUtils', 'infraEnums', 'mmPermissions', 'entityMetaData',
  function ($scope, mmModal, EC2Restangular, mmAlertService, $stateParams, adminUtils, infraEnums, mmPermissions, entityMetaData) {
		var type = 'campaign';
    var hasCreateCampaignPermission = mmPermissions.hasPermissionBySession(entityMetaData['campaign'].permissions.entity.createEdit);

    if ($stateParams.brandId) {
      $scope.contextEntityType = 'brand';
    } else if ($stateParams.advertiserId) {
      $scope.contextEntityType = 'advertiser';
    } else if ($stateParams.accountId) {
      $scope.contextEntityType = 'account';
    }

    var centralCampaignActions = [
      { name: 'Delete',  func: onDeleteBtnClicked, relationType: infraEnums.buttonRelationToRowType.any}
    ];

    $scope.centralDataObject = [
      {
        type: type,
        centralActions: centralCampaignActions,
        dataManipulator: dataManipulator,
        isEditable: true,
        editButtons: [],
        contextEntityType: $scope.contextEntityType,
        hideAddButton:!hasCreateCampaignPermission,
				isEditMultiple: false
      }
    ];

    function dataManipulator(data) {
      //add countLink property for the central display
      data.forEach(function (entity) {
        entity.placementsCountLink = entity.placementsCount + ' Placement';
        if (entity.placementsCount == 0 || entity.placementsCount > 1)
          entity.placementsCountLink += 's';

        entity.placementAdsCountLink = entity.placementAdsCount + ' Placement Ad';
        if (entity.placementAdsCount == 0 || entity.placementAdsCount > 1)
          entity.placementAdsCountLink += 's';
      });
    }

		var isModalConfirmDeleteOpen = false;
		function onDeleteBtnClicked(items, selectedItems){
			if(isModalConfirmDeleteOpen){
				return;
			}
			isModalConfirmDeleteOpen = adminUtils.crudOperations.deleteEntities(items, selectedItems, entityMetaData[type].name);
		}
  }]);