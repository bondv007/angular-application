/**
 * Created by roi.levy on 1/1/15.
 */
app.controller('inStreamTemplateEditCtrl', ['$scope',  'entityMetaData', 'mmRest', 'enums','mmAlertService', 'x2js', 'inStreamTemplatesValidator', 'inStreamTemplateService', '$stateParams', '$state', 'inStreamTemplatesJson',
	function($scope, entityMetaData, mmRest, enums, mmAlertService, x2js, inStreamTemplatesValidator,  inStreamTemplateService, $stateParams, $state, inStreamTemplatesJson){

		$scope.isEditMode = !!$stateParams.inStreamTemplateId || !!$scope.isEntral;

		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: revert, ref: 'spa.configuration.inStreamTemplates', nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};

		$scope.togglesStatus = {
			adFormats: true
		}

		$scope.adFormatTitle = "Available Ad Formats";
		$scope.labelWidth = 150;

		$scope.errors = {
			nameMsg: '',
			descMsg: '',
			adFormatMsg: ''
		}
		$scope.errorMinWidth = '100px';

		$scope.xmlVariablesCols = [
			{field: 'name', displayName: 'Name', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox"), isPinned: true},
			{field: 'value', displayName: 'Value', isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'editLevel', displayName: 'Edit Level', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'source', displayName: 'Source', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")}
		];

		$scope.applicableAdFormats = _.filter(enums.adFormats, function(format){
			return format.id === 'INSTREAM_AD' || format.id === 'INSTREAM_ENHANCED_AD' || format.id === 'INSTREAM_INTERACTIVE_AD';
		});
		$scope.applicableIds = [];
		$scope.baseXmlVariables = [];
		$scope.xsltFiles = [];
		$scope.customXmlVariables = [];
		$scope.baseTemplates = [];

		$scope.xslt = {file: null, meta: null};
		$scope.customXsltFileName = "Click to browse for an XSL/XSLT file";

		var mainEntityWatch = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
			if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
				updateState();
        initControls();
			}
		});

		var xsltWatch = $scope.$watch('xslt.file', function (newValue, oldValue) {
			if(!newValue){
				return;
			}

			if(!$scope.xslt.meta || $scope.xslt.meta.name.indexOf('.xslt') === -1){
				mmAlertService.addWarning('Only XSL/XSLT files may be imported');
				return;
			}

			var xsltAsJson = x2js.xml_str2json($scope.xslt.file);
			if(!xsltAsJson){
				mmAlertService.addWarning('File is not valid XML');
				return;
			}

			clearCustomXsltData();
			fillCustomXsltData(xsltAsJson);
			var xsltTemplate = btoa(newValue);
			var inStreamTemplate = inStreamTemplatesJson.createInStreamTemplate();
			inStreamTemplate.template = xsltTemplate;

			inStreamTemplateService.saveXSlt(inStreamTemplate).then(function(result){
				$scope.template.customXsltFileId = result;
				mmAlertService.addSuccess("XSLT_successfully_uploaded");
				$scope.$root.isDirtyEntity = true;
			}, function(error){
				clearCustomXsltData();
			});
			cleanXsltFile();
		});

		function fillCustomXsltData(xsltAsJson){
			if(xsltAsJson){
				$scope.template.customXsltFileName = $scope.xslt.meta.name;
				$scope.customXmlVariables = [];
				for (var i = 0; i < xsltAsJson.stylesheet.variable.length; i++) {
					var xmlVar = xsltAsJson.stylesheet.variable[i];
					var editLevel =  xmlVar._name.substring(0, 4) === 'Base' ? 'SITE_RULES' : 'AD';
					$scope.customXmlVariables.push(
							{
								type: "VastVariable",
								name: xmlVar._name,
								value: xmlVar._select,
								editLevel: editLevel,
								source: 'CUSTOM'
							}
					)
				}
				$scope.template.vastVariables = $scope.template.vastVariables.concat($scope.customXmlVariables);
			}
		}

		function clearCustomXsltData(){
			$scope.template.customXsltFileName = null;
			$scope.template.customXsltFileId = null;
			$scope.customXmlVariables = [];
			var baseTemplate = getBaseTemplateById($scope.template.baseTemplateId);
			baseTemplate && baseTemplate.vastVariables ? $scope.template.vastVariables = baseTemplate.vastVariables : $scope.template.vastVariables = [];
		}

		function cleanXsltFile(){
			$scope.xslt.file = null;
			$scope.xslt.meta = null;
		}

		function updateState(){
			if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
				$scope.template = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
			}
			else if(!$scope.isEditMode){
				$scope.template = mmRest.EC2Restangular.copy(entityMetaData["inStreamTemplate"].defaultJson);
			}
		}

		$scope.removeTemplateFile = function(){
			clearCustomXsltData();
			$scope.$root.isDirtyEntity = true;
		}

    $scope.onBaseTemplateChange = function() {
      var baseTemplate = getBaseTemplateById( $scope.template.baseTemplateId );
      var baseVariables = (baseTemplate && baseTemplate.vastVariables) ? baseTemplate.vastVariables : [];

      if (!$scope.isEditMode ) {
        $scope.template.vastVariables = baseVariables;
        $scope.template.vastVariables = $scope.template.vastVariables.concat( $scope.customXmlVariables );
      }
      else {
        if (!$scope.template.customXsltFileId ) {
          $scope.template.vastVariables = baseVariables;
        }
        else {
          $scope.template.vastVariables = _.filter( $scope.template.vastVariables, {"source": "CUSTOM"} );
          $scope.template.vastVariables = $scope.template.vastVariables.concat( baseVariables );
        }
      }
    }

    $scope.onDescriptionChange = function() {
			$scope.errors.descMsg = '';
		}

		$scope.onNameChange = function(){
			$scope.errors.nameMsg = '';
		}

		$scope.onAdFormatChange = function(){
			$scope.errors.adFormatMsg = '';
		}

		function getBaseTemplateById(id){

   		for (var i = 0; i < $scope.baseTemplates.length; i++) {
				var obj = $scope.baseTemplates[i];
				if(obj.id === id){
					return obj;
				}
			}
      return null;
		}

		function save(){
			if(!inStreamTemplatesValidator.validateBeforeSave($scope.template, $scope.errors)){
				displayValidationErrors();
				return;
			}

			if(!$scope.isEditMode){
				return inStreamTemplateService.saveTemplate($scope.template).then(processData);
			}
			else{
				return inStreamTemplateService.updateTemplate($scope.template).then(processData);
			}
		}

		function displayValidationErrors(){

      if($scope.errors.adFormatMsg || $scope.errors.descMsg || $scope.errors.nameMsg)
      {
        if($scope.errors.adFormatMsg){
          $scope.togglesStatus.adFormats = true;
        }
        mmAlertService.addError("error_fill_all_required_fields");
      }
			if($scope.errors.noCustomOrBase){
				mmAlertService.addError($scope.errors.noCustomOrBase);
			}


		}

		function processData(template){
			$scope.template = template;
			mmAlertService.addSuccess("Template_successfully_saved");
			if(!$scope.isEntral){
				$state.go("spa.inStreamTemplate.inStreamTemplateEdit", {inStreamTemplateId: template.id},{location : "replace"});
			}
			return template;
		};

		function revert(){
			$scope.$root.isDirtyEntity = false;
			$scope.errors.nameMsg = '';
			$scope.errors.descMsg = '';
			$scope.errors.adFormatMsg = '';
			$scope.errors.noCustomOrBase = '';
			if($scope.isEditMode){
				$scope.template = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
			}
			else{
				$scope.template = mmRest.EC2Restangular.copy(entityMetaData["inStreamTemplate"].defaultJson);
			}

		}

    function initControls(){
      if(!$scope.template){
        return;
      }
      fillBaseTemplatesDataModel();
    }

    function fillBaseTemplatesDataModel(){
      inStreamTemplateService.getBaseTemplates().then(function(templates){
        $scope.baseTemplates = [];
        for (var i = 0; i < templates.length; i++ ) {
          var template = templates[i];
          if(template.id !== $scope.template.id){
            if(template.vastVariables){
              for(var j=0; j < template.vastVariables.length; j++){
                template.vastVariables[j].source = "BASE";
              }
            }
            $scope.baseTemplates.push(template);
          }
        }
      });
    }

    $scope.$on('$destroy', function () {
      $scope.template = null;
      if (mainEntityWatch)  mainEntityWatch();
      if(xsltWatch) xsltWatch();
    });

	}]);
