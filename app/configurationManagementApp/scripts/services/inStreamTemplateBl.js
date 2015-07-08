/**
 * Created by roi.levy on 1/29/15.
 */
app.service('inStreamTemplateBl', ['mmAlertService', 'mmModal', 'inStreamTemplateService',
															function(mmAlertService, mmModal, inStreamTemplateService){

	var disableActionRules = {
		deleteButton: function(selectedItems){
			var disableButton = false;
			if(!selectedItems.length || selectedItems.length === 0){
				disableButton = true;
			}
			return disableButton;
		},
		disableButton: function(selectedItems){
//			if(!selectedItems.length || selectedItems.length === 0){
//				return true;
//			}
//			return false;
			return true;
		},
		enableButton: function(selectedItems){
//			if(!selectedItems.length || selectedItems.length === 0){
//				return true;
//			}
//			return false;
			return true;
		},
		downloadXsltButton: function(selectedItems){
			return true;
		}
	}

	function deleteTemplates(templatesList, selectedItems){
		var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");

		modalInstance.result.then(function() {
			inStreamTemplateService.deleteTemplates(selectedItems ).then(function(deletedIds){
				for (var i = 0; i < deletedIds.length; i++ ) {
					var deletedId = deletedIds[i];
					for (var j = templatesList.length - 1; j >=0; j--) {
						var template = templatesList[j];
						if(template.id === deletedId){
							templatesList.splice(j,1);
						}
					}
				}
				templatesList.refreshCentral();
				mmAlertService.addSuccess("Templates successfully deleted");
			});
		})
	}

	return{
		disableActionRules: disableActionRules,
		deleteTemplates: deleteTemplates
	}

}]);