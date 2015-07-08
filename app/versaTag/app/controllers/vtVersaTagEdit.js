/**
 * Created by Rick.Jones on 12/15/14.
 */
app.controller('vtVersaTagEditCtrl', ['$scope', '$rootScope', '$stateParams', 'mmAlertService', 'mmFeatureFlagService', 'mmPermissions', 'EC2Restangular', 'enums', '$state', '$q', 'entityMetaData', 'versaTagService','vtAdvertiserService',
    function($scope, $rootScope, $stateParams, mmAlertService, mmFeatureFlagService, mmPermissions, EC2Restangular, enums, $state, $q, entityMetaData, versaTagService, advertiserService, $modalInstance, entity ){

        $scope.isEditMode = false;
        $scope.isRequired = true;
        $scope.validation = {};
        $scope.labelWidth = 80;
        $scope.labelWidthFull = 170;
        $scope.isModal = false;
        $scope.togglesStatus = { code:false, customScript:false };

        function getMetaData(property){
            return entityMetaData['versaTag'][property];
        };

        $scope.codeTypes = [
            { name:'html script', id:'HTMLScript' },
            { name:'iFrame', id:'iFrame' },
            { name:'ActionScript (ver1)', id:'ActionScriptVer1' },
            { name:'ActionScript (ver2)', id:'ActionScriptVer2' },
            { name:'ActionScript (ver3)', id:'ActionScriptVer3' },
        ];

        $scope.codeGenerationMode = [
            {name: 'Partial', id:'Partial'},
            {name:'Full', id:'Full'}
        ];

        $scope.loadingMethod = [
            { name:'Synchronous', id:'Synchronous' },
            { name:'Asynchronous', id:'Asynchronous' }
        ];

        $scope.customScriptColumnDefs = [
            { field:'group', displayName: 'Group', isColumnEdit: false}
        ];


        $scope.editObject = {
            name: '',
            advertiserId: null,
            pageURL: '',
            vtType: 'HTMLScript',
            codeGeneration: 'Full',
            loadingMethod: 'Synchronous',
            forceHTTPS: true,
            removeComments: false,
            advertiserIds: []
        };


        initialize();

        if(!_.isUndefined($scope.entityLayoutInfraButtons)){
            $scope.entityLayoutInfraButtons.discardButton = {name : 'discard', func : rollback, ref : null, nodes : []};
            $scope.entityLayoutInfraButtons.saveButton = {name : 'save', func : save, ref : null, nodes : [], isPrimary : true};
        }


        function initialize(){
            
			// get the feature flags
			mmFeatureFlagService.GetFlagsAsync().then(function(result){

				// get the specific feature flag
				$scope.feature = {
					versaTag: mmFeatureFlagService.IsFeatureOn('VersaTagUI')
				};

				// create the permissions
				$scope.permission = {
					view: mmPermissions.hasPermissionBySession('VersaTag - View VersaTags'),
					edit: mmPermissions.hasPermissionBySession('VersaTag - Create/Full Edit'),
					delete: mmPermissions.hasPermissionBySession('VersaTag - Delete/Archive VersaTag'),
					archive: mmPermissions.hasPermissionBySession('VersaTag - Delete/Archive VersaTag')
				};

				// init the grid
				initGridModel ();

			});

			$scope.labelWidth = 165;


            if(!$scope.$parent.mainEntity && (watcher == null || watcher == undefined)){

                var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
                    if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
                        updateState();
                    }
                });

            } else {
                 updateState();
            }
        };

        function updateState(){

            $scope.listOfAdvertisers = [];
            $rootScope.mmIsPageDirty = 0;

            if ($scope.$parent.mainEntity != null) {

                $scope.isEditMode = true;
                $scope.preSaveStatus = false;
                $scope.editObject.advertiserId = null;
                $scope.editObject = EC2Restangular.copy($scope.$parent.mainEntity);

            }

			else {

				$scope.isEditMode = false;
                $scope.preSaveStatus = true;
                $scope.isBrandsExist = false;
                $scope.editObject = $scope.editObject || EC2Restangular.copy(getMetaData("defaultJson"));

            }

            $scope.originalCopy = EC2Restangular.copy($scope.editObject);

            advertiserService.getAdvertisers().then(function( advertisers ) {
				$scope.listOfAdvertisers = advertisers;
			});

        };

        function rollback() {

            //console.log($scope.originalCopy);
            $scope.editObject = EC2Restangular.copy($scope.originalCopy);

            if($state.current.name != getMetaData('listPageURL'))
                reloadView(getMetaData('listPageURL'));
        }

        function save() {

            // need to validate
          if (validateBasicControls()) {
            // process form
            if($scope.isEditMode == true){

                //console.log('save data:', $scope.editObject);

                var vTag = EC2Restangular.one('versaTag', $scope.editObject.id);

                $scope.showSPinner = true;
                return versaTagService.update($scope.editObject).then(function(data){

                    $scope.preSaveStatus = false;
                    $rootScope.mmIsPageDirty = 0;
                    $scope.showSPinner = false;
                    mmAlertService.addSuccess('VersaTag ' + data.name + ' was successfully updated.');
                    return data;

                }, function(error){

                    processError(error);

                });
            } else {

                return versaTagService.create($scope.editObject).then(function(data){

                    $scope.preSaveStatus = false;
                    $rootScope.mmIsPageDirty = 0;
                    $scope.showSPinner = false;
                    mmAlertService.addSuccess('VersaTag ' + data.name + ' was successfully created.');

                    if(!$scope.isEntral){
                        // Add current edit page to the browser history along with the id
                        $state.go(getMetaData('editPageURL'), {versaTagId: data.id}, {location: "replace"});
                    }

                    return data;
                });
            }
          }

        };

        function processError(error) {
            console.log('ohh no!');
            console.log(error);
            if (_.isUndefined(error.data.error)){
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                mmAlertService.addError(error.data.error);
            }
        };

        function changeView(state){
            $state.go(state, {}, {location: "replace"});
        };

        function reloadView(state){
            $state.go(state, {}, {reload: true});
        };

        //   Dummy Data for grid
         var sector = [
              {id: "activityParam", name: "Activity Params"},
              {id: "retargetingParam", name: "Retarget Params"},
              {id: "dynamicRetargetingParam", name: "Dynamic Retarget Params"},
              {id: "conditionalParam", name: "Conditional Params"}
            ];
        $scope.columnsFull = [
          {field: 'name', displayName: 'Name' },
          {field: 'sector', displayName: 'Section', listDataArray: sector, gridControlType: enums.gridControlType.getName("SelectList") },
          {field: 'comments', displayName: 'Comments'},
        ];


        $scope.gridButtonActions = [
           {
               name: "Add",
               func: createNewParameter,
               isDisable: false
           },
           {
               name: "Remove",
               func: removeFromGrid,
               isDisable: true
           }
       ];

        function initGridModel () {
           $scope.parameters = [];
           $scope.parameters.selectedItems = [];
           $scope.parameters.numberFilteredItems = 0;
        }

        function createNewParameter() {
         var parametersDefault = {
            name: '',
            sector: 'activityParam',
            comments: ''
         };

          if($scope.editObject.parameters == null){
              $scope.editObject.parameters = [];
          }

          $scope.editObject.parameters.push(parametersDefault);
        }

        function removeFromGrid() {
          $scope.$root.isDirtyEntity = true;

            //console.log('parameters', $scope.editObject.parameters);
            //console.log('parameters selected', $scope.parameters.selectedItems);

            angular.forEach($scope.parameters.selectedItems, function(item, index){

                $scope.editObject.parameters.remove(item);
            });

            $scope.parameters.selectedItems = [];


          //deleteParameter($scope.parameters.selectedItems, $scope.parameters);
          $scope.gridButtonActions[1].isDisable = true;
        }

        $scope.afterSelectionChanged = function () {
            var selectedItems = $scope.parameters.selectedItems;
            $scope.gridButtonActions[1].isDisable = !(selectedItems.length !== 0);
            $scope.$root.isDirtyEntity = true;
        };


		/**
		 * Updates the code when clicking the "update code" button
		 */
		$scope.updateCode = function() {

			$scope.updatingCode = true;

			versaTagService.updateCode( $scope.editObject ).then( function( response ) {

				$scope.updatingCode = false;
				$scope.editObject.tagCode = response;

			});

		};





        /**
        *   Validations Section....
        **/
        function validateBasicControls() {
          var isValid = true;
            if ($scope.editObject.name === undefined || $scope.editObject.name === null ||
              _.isEmpty($scope.editObject.name)) {
              $scope.validation.name = "Please enter a name";
              isValid = false;
            }
            if ($scope.editObject.pageURL === undefined || $scope.editObject.pageURL === null ||
              _.isEmpty($scope.editObject.pageURL)) {
              $scope.validation.pageUrl = "Please enter a valid url";
              isValid = false;
            }
            if ($scope.editObject.advertiserIds === undefined || $scope.editObject.advertiserIds === null ||
              _.isEmpty($scope.editObject.advertiserIds)) {
              $scope.validation.advertiser = "Please Select an Advertiser";
              isValid = false;
              }
            if ($scope.editObject.vtType === undefined || $scope.editObject.vtType === null ||
              _.isEmpty($scope.editObject.vtType)) {
              $scope.validation.codeType = "Please Select an Option";
              isValid = false;
            }
          return isValid;
        }

    }
]);
