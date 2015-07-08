/**
 * Created by roi.levy on 1/1/15.
 */
app.controller('inStreamTemplatesCtrl', ['$scope', 'inStreamTemplateBl', function($scope, inStreamTemplateBl){

    var centralInStreamTemplatesActions = [
        { name: 'Disable Template', func: null, disableFunc: inStreamTemplateBl.disableActionRules.disableButton},
        { name: 'Enable Template', func: null,  disableFunc: inStreamTemplateBl.disableActionRules.enableButton},
        { name: 'Delete', func: inStreamTemplateBl.deleteTemplates, disableFunc: inStreamTemplateBl.disableActionRules.deleteButton},
        { name: 'Download XSLT', func: null, disableFunc: inStreamTemplateBl.disableActionRules.downloadXsltButton}
    ];

    $scope.centralDataObject = [
        { type: 'inStreamTemplate', centralActions: centralInStreamTemplatesActions, dataManipulator: manipulateData, isEditable: true, editButtons: [] }
    ];

		function manipulateData(templates){
			for ( var i = 0; i < templates.length; i++ ) {
				var obj = templates[i];
				obj.isBase = templates[i].baseTemplateId ? "NO" : "YES";
				obj.status = templates[i].enabled ?  "ENABLED" : "DISABLED";
				obj.associatedAdFormatsStr = templates[i].applicableAdFormats + "";
			}
		}

}])