/**
 * Created by roi.levy on 1/8/15.
 */
app.controller('inStreamRuleCtrl', ['$scope', '$modalInstance', 'siteId', 'inStreamTemplateService', 'mmRest', 'enums', 'templateData', 'inStreamTemplatesJson', 'inStreamTemplatesValidator',
	function($scope, $modalInstance, siteId, inStreamTemplateService, mmRest, enums, templateData, inStreamTemplatesJson, inStreamTemplatesValidator){

		var indexedSections = {};
		var indexedTemplates = {};

		$scope.errorObj = {
			sectionMsg: '',
			templateMsg: ''
		};
		$scope.labelWidth = '150';
		$scope.sections = [{id: "-1", name: "All"}];
		$scope.baseTemplates = [];

		$scope.templateData = templateData ? templateData : inStreamTemplatesJson.createSiteTemplateData();

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

		$scope.xmlVariablesCols = [
			{field: 'name', displayName: 'Name', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox"), isPinned: true},
			{field: 'value', displayName: 'Value', isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'editLevel', displayName: 'Edit Level', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'source', displayName: 'Source', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")}
		];

		mmRest.siteSections.getList({siteId: siteId} ).then(function(response){
			$scope.sections = $scope.sections.concat(response)
		});

		function indexEntity(id, entityArr, indexedObject){
			for (var i = 0; i < entityArr.length; i++) {
				var entity = entityArr[i];
				if(entity.id === id){
					indexedObject[id] = entity;
					break;
				}
			}
		}

		inStreamTemplateService.getBaseTemplates().then(function(templates){
			for (var i = 0; i < templates.length; i++ ) {
				var baseTemplate = templates[i];
				$scope.baseTemplates.push(baseTemplate);
			}
		});

		$scope.onSectionSelect = function(){
			$scope.errorObj.sectionMsg = '';
			var sectionId= $scope.templateData.sectionId;
			if(!indexedSections[sectionId]){
				indexEntity(sectionId, $scope.sections, indexedSections);
			}
			$scope.templateData.sectionName = indexedSections[sectionId].name;
		};

		$scope.onBaseTemplateSelect = function(){
			$scope.errorObj.templateMsg = '';
      var templateId = $scope.templateData.templateId;
			if(!indexedTemplates[templateId]){
				indexEntity(templateId, $scope.baseTemplates, indexedTemplates);
			}
			$scope.templateData.templateName = indexedTemplates[templateId].name;
			$scope.templateData.vastVariables = indexedTemplates[templateId].vastVariables;
		};

		$scope.apply = function(){
			$scope.errorObj = {};
			if(inStreamTemplatesValidator.validateInStreamRule($scope.templateData, $scope.errorObj)){
				$modalInstance.close($scope.templateData);
			}
		};

		$scope.cancel = function () {
			$scope.errorObj = {};
			$modalInstance.dismiss('cancel');
		};

}]);