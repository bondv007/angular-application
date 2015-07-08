/**
 * Created by liad.ron on 10/27/14.
 */
app.controller('advertisersCtrl', ['$scope', 'adminUtils', 'entityMetaData', 'infraEnums', function ($scope, adminUtils, entityMetaData, infraEnums) {
	var type = 'advertiser';
	$scope.hideGoTo = true;
  var centralAdvertiserActions = [
    { name: 'Delete',  func: onDeleteBtnClicked, relationType: infraEnums.buttonRelationToRowType.any}
  ];

  $scope.centralDataObject = [
    {type: type, centralActions: centralAdvertiserActions, dataManipulator: dataManipulator, isEditable: true, editButtons: []}
  ];

	function dataManipulator(data){
		var relatedEntitiesName = ["brands", "campaigns"];
		//add countLink property for the central display
		data.forEach(function(entity){
			var generatedLink = adminUtils.linksBuilder.linksForList(relatedEntitiesName, entity.type, entity.relationsBag);
			relatedEntitiesName.forEach(function(name){
				if(entity.relationsBag && entity.relationsBag.children){
					entity.relationsBag.children[name].countLink = generatedLink[name].text;
				}
			});
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
