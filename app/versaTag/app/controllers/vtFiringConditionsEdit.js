'use strict';

/**
 * Created by Jeff Gunderson
 */
app.controller('vtFiringConditionsEditCtrl', [ '$scope', '$rootScope', '$stateParams', 'mmAlertService', 'EC2Restangular', 'enums', '$state', 'mmModal', 'firingConditionsService', 'mmSession', '$q', 'flowToolBar', 'entityMetaData', 'vtAdvertiserService',
    function($scope, $rootScope, $stateParams, mmAlertService, EC2Restangular, enums, $state, mmModal, firingConditionsService, session, $q, flowToolBar, entityMetaData, advertiserService, $modalInstance, entity){

        var SIMPLE_MODE = 'simple';
        var ADVANCE_MODE = 'advanced';

		var mode = null;

        $scope.isEditMode = false;
        $scope.isRequired = true;
        $scope.basicView = true;
        $scope.validation = {};
        $scope.labelWidth = 250;
        $scope.labelWidthFull = 170;
        $scope.isModal = false;
        $scope.togglesStatus = { code:false, customScript:false };
        $scope.isTextArea = false;
        $scope.advertiserName = '';
        $scope.advertisersTags = [];
        $scope.advertisersIndex = {};
        $scope.advertiserList = [];
        $scope.initialSettings = {};
        $scope.subConditions = false;
        $scope.isStartOpen = true;
        $scope.infoBoxlabelWidth = 145;
		$scope.view = {};
		$scope.tagGrid = {};
		$scope.metaData = entityMetaData['firingConditions'];

        $scope.startDate = (function() {
			var now = new Date();
            return now.getTime();
		}());

		$scope.expirationDate = (function() {
			var now = new Date();
            now.setDate(now.getDate() + 30);
            return now.getTime();
		}());




		/**
		 * Status Options for the firing condition
		 * @type {{id: boolean, name: string}[]}
		 */
		$scope.statusOptions = [
            { id: true, name:'Enabled' },
            { id: false, name:'Disabled' }
        ];

		/**
		 * Duration options for how interval or time of firing condition
		 * @type {{id: boolean, name: string}[]}
		 */
		$scope.durationOptions = [
            { id: false, name: 'Unlimited' },
            { id: true, name: 'Between' }
        ];

		/**
		 * Firing condition URL options
		 * @type {{id: string, name: string}[]}
		 */
		$scope.urlOption = [
            { id: 'Any', name: 'any url' },
            { id: 'Equals', name: 'a url that equals' },
            { id: 'NotEquals', name: 'a url that doesnt equal' }
        ];

		/**
		 * conditions for when the firing condition will fire
		 * @type {{id: string, name: string}[]}
		 */
		$scope.conditions = [
            { id: 'Always', name: 'Always' },
            { id: 'PerOrderId', name: 'Once for every order id' },
            { id: 'PerUserSession', name: 'Once for each user for every session' },
            { id: 'PerUserWeek', name: 'Once for every user per week' },
            { id: 'PerUserMonth', name: 'Once for every user per month' },
            { id: 'PerUserDay', name: 'Once for every user per 24 hour period' },
            { id: 'PerUser10Min', name: 'Every 10 minutes' },
            { id: 'PerNewUser', name: 'Only for new users' },
            { id: 'PerNCReturningUser', name: 'Only for non-converting returning users' }
        ];

		$scope.siteVisit = {
			visit: [
				{ id: 'ForTheFirstTime', name: 'For the first time' },
				{ id: 'MoreThanOnce', name: 'More than once' },
				{ id: 'MoreThan', name: 'More than' }
			],
			since: [
				{ id: 'Session', name: 'Since the beginning of the Session' },
				{ id: 'Time', name: 'Since the beginning of time' }
			]
		};

		$scope.parameters = {
			trackingProtocol: [
				{ id: 'HttpOnly', name: 'Http' },
				{ id: 'HttpsOnly', name: 'Https' },
				{ id: 'HttpAndHttps', name: 'Http & Https' },
				{ id: 'ExactlyAsEntered', name: 'Exactly as Entered' },
				{ id: 'InvalidUrls', name: 'Invalid URLs' }
			]
		};


		$scope.entityLayoutInfraButtons.discardButton = {name : 'discard', func : rollback, ref : null, nodes : []};
		$scope.entityLayoutInfraButtons.saveButton = {name : 'save', func : save, ref : null, nodes : [], isPrimary : true};




		$scope.$watch( 'editObject', function( newVal, oldVal  ) {
			$rootScope.isPageDirty = true;
			// only make the entity dirty after we have an initial ID
			if ( newVal && oldVal && newVal.id == oldVal.id ) {
				$rootScope.isDirtyEntity = true;
			}
			console.log( newVal );
		}, true );


		init();

		/**
		 * Initialization function to load up the firing condition
		 */
		function init() {

			// get the advertisers for the dropdown
			advertiserService.getAdvertisersByVersaTagId( $stateParams.versaTagId ).then(function(response){
				$scope.advertiserList = response;
			});

			// if it's an existing object
			if ( $stateParams.firingCondition ) {

				firingConditionsService.getFiringConditionById( $stateParams.firingCondition ).then(function (data) {

					$scope.isEditMode = true;
					$scope.editObject = EC2Restangular.copy( data );
					$scope.originalObject = EC2Restangular.copy( data );
					$scope.showUI = true;
					$scope.view.advertiserDisabled = true;
					getAdvertiserTags();

				});

			}

			// otherwise it's a new object
			else{

				// create an edit object and a copy to rollback
				$scope.isEditMode = false;

				// TODO create a default object and add it to the entityMetaData
				$scope.editObject = {
					name: '',
					type: 'FiringCondition',
					occurs: 'Always',
					hasDuration: false,
					enabled: false,
					versaTagId: $stateParams.versaTagId,
					condition: {
						landedOn: {
							"includeUrls": "*",
							"trackingProtocol": "HttpAndHttps",
							"trackAllSubdomains": true,
							"trackStandardIndexIgnoreSlashes": true
						}
					},
					actions: [
						{
							actionType: 'Fire',
							tags: []
						}
					]
				};

				$scope.showUI = true;
				$scope.originalObject = angular.copy( $scope.editObject );

			}

			setViewMode();

		};

		/**
		 * Set's the view mode from simple to advanced
		 * TODO: add conditions.. probably should store instead of checking
		 */
		function setViewMode() {
			$scope.view.mode = ADVANCE_MODE;
		};


		/**
		 * Make the rest call to generate the list
		 */
		$scope.onAdvertiserChange = function(){
			getAdvertiserTags();
		};


		function save() {

			validateFields();

			// sets the items in the grid onto the save object
			setTagsToFireOnEditObject();

			if ( $scope.isEditMode ) {
				firingConditionsService.update( $scope.editObject ).then( function( data ) {
					$rootScope.mmIsPageDirty = false;
					mmAlertService.addSuccess('Firing condition ' + data.name + ' was successfully updated.');
				});
			}

			else{
				firingConditionsService.create( $scope.editObject ).then( function( data ) {
					$rootScope.mmIsPageDirty = false;
					mmAlertService.addSuccess('Firing condition ' + data.name + ' was successfully created.');

					// replace the URL with the new path which includes the ID of the entity
					$state.go($scope.metaData.editPageURL, {firingCondition: data.id}, {location : "replace"});

				});
			}

		};

		function rollback() {
			$scope.editObject = $scope.originalObject;
			$rootScope.isDirtyEntity = false;
		};


		function validateFields() {
			return;
		};














		/**
		 *---------------------------------------------------------------------
		 *------------------------- TAG STUFF ---------------------------------
		 *---------------------------------------------------------------------
		 */


		/**
		* This is the tag grid data
		*
		* @type {{cols: {field: string, displayName: string, isColumnEdit: boolean, gridControlType: *, listDataArray: Array, functionOnCellEdit: onCellEdit}[], list: Array, selected: Array, gridButtonActions: *[], isGridLoading: boolean, afterSelectionChanged: afterSelectionChanged}}**/
        $scope.tagGrid = {
            cols: [
                {
                    field: 'name',
                    displayName: 'Name',
                    isColumnEdit: true,
                    gridControlType: enums.gridControlType.getName('SelectList'),
                    listDataArray: [],
                    functionOnCellEdit: onCellEdit
                }
            ],
            list: [],
            selected: [],
            gridButtonActions:[
                {
                    name: 'Add',
                    func: addTag,
                    isDisable: false
                },
                {
                    name: 'Remove',
                    func: removeTag,
                    isDisable: true
                }
            ],
            isGridLoading: true,
            afterSelectionChanged: afterSelectionChanged
        };


		/**
		 * Loading boolean for tags
		 */
		$scope.isLoading = false;

		/**
		 * Get the tags from the advertiser selected
		 */
		function getAdvertiserTags(){

			$scope.isLoading = true;
			$scope.advertisersTags = [];

			if( $scope.editObject.advertiserId ){

				firingConditionsService.getAdvertiserTags($scope.editObject.advertiserId).then(function(tags){

					var list = [];

					angular.forEach(tags, function(tag){
						list.push({id:tag.id, name:tag.id + ' - ' + tag.reportingName});

						$scope.advertisersIndex[tag.id] = {
							reportingName: tag.reportingName,
							id: tag.id,
							tagType: tag.tagType
						};
					});

					$scope.advertisersTags = list;

					populateTagSelectList();
					setAdvertiserTagsList();

					$scope.isLoading = false;

				}, function(response){
					//console.log('no results', response);
					$scope.advertisersTags = [];
					$scope.isLoading = false;
				});
			}

			else {
				$scope.isLoading = false;
			}

		}

		/**
		 * Sets the Advertiser Tags list
		 */
		function setAdvertiserTagsList() {

			var list = [];

			if($scope.editObject.actions && $scope.editObject.actions.length && $scope.editObject.actions[0].tags){
				angular.forEach($scope.editObject.actions[0].tags, function(tag){

					// had to map the name to the id since a select list is being used to represent the data
					list.push({id:tag.id, name:tag.id});
				});

				$scope.tagGrid.list = list;
			}
		};

		/**
		 * Populated the tag list to select from
		 */
		function populateTagSelectList() {

			var list = [];
			var tags = $scope.advertisersTags;

			$scope.tagGrid.cols[0].listDataArray = [];

			angular.forEach(tags, function(tag){

				list.push({id:tag.id, name: tag.name});
			});

			$scope.tagGrid.cols[0].listDataArray = list;
		};


		/**
		 * This method is handled when the user edits the tag name. It will clear any errors once a name is selected
		 *
		 * @param column
		 * @param selectedId
		 * @param index
		 */
        function onCellEdit(column, selectedId, index){
            if($scope.validation.advertisersTags != null && selectedId){
                $scope.validation.advertisersTags = null;
            }
        };

        /**
        *  Adds a tag to the fire tag list
        */
        function addTag(){
            $scope.tagGrid.list.push({id:null, name:''});
        };

        /**
        *  This method updates the UI state so that the save action is enabled
        */
        function afterSelectionChanged( item, i ){
            var selectedItems = $scope.tagGrid.selected;
            $scope.tagGrid.gridButtonActions[1].isDisable = !(selectedItems.length !== 0);
            $scope.$root.isDirtyEntity = true;
        };

        /**
        *  Removes a tag from the fire tag list
        */
        function removeTag(){

            $scope.$root.isDirtyEntity = true;

            var list = $scope.tagGrid.list;
            var selectedItems = $scope.tagGrid.selected;

            if (selectedItems.length > 0) {
                var index = selectedItems.length - 1;
                while (index >= 0) {
                    var itemToDelete = selectedItems[index];
                    list.splice(list.indexOf(itemToDelete), 1);
                    if(selectedItems.length > 0){
                        selectedItems.splice(index, 1);
                    }

                    index--;
                }
            }

            $scope.tagGrid.gridButtonActions[1].isDisable = true;
        };

		/**
		 * Takes the items in the grid and sets them on the editObject
		 */
		function setTagsToFireOnEditObject(){

            // Need to update the fire tag url list
            var selectedTags = [];

            angular.forEach($scope.tagGrid.list, function(tag){

                angular.forEach($scope.advertisersTags, function(advTag){

                    if( advTag.id == tag.name ){

                        selectedTags.push({
							id: advTag.id,
							reportingName: advTag.name,
							tagType: 'Conversion'
						});

                    }
                });

            });

            $scope.editObject.actions[0].tags = selectedTags;

        };








//
//        $scope.validation = {};
//
//        var defaultAndCondition = {
//          urlList: [],
//          ifUser: 'WasReferredFrom',
//          urlThat: "Any",
//          isTextArea: false,
//          or: []
//        };
//
///**
//**
//*/
//
//        /**
//        **    Grid columns data
//        */
//        $scope.columnsFull = [
//          {field: 'value', displayName: 'Value' }
//        ];
//
//
//        $scope.statusOptions = [
//            {id: true, name:'Enabled'},
//            {id: false, name:'Disabled'}
//        ];
//
//        $scope.durationOptions = [
//            {id: false, name: 'Unlimited'},
//            {id: true, name: 'Between'}
//        ];
//
//        // MOCK DATA
//
//        $scope.urlOption = [
//            {id: 'Any', name: 'any url'},
//            {id: 'Equals', name: 'a url that equals'},
//            {id: 'NotEquals', name: 'a url that doesnt equal'},
//            {id: 'MatchesRegex', name: 'a url that matches the regex'},
//            {id: 'NotMatchesRegex', name: 'a url that doesnt match the regex'}
//        ];
//
//        $scope.urlOptionCondition = [
//            {id: 'NotEquals', name: 'a url that doesn\'t equal'},
//            {id: 'MatchesRegex', name: 'a url that matches the regex'},
//            {id: 'NotMatchesRegex', name: 'a url that doesnt match the regex'}
//        ];
//
//        $scope.conditions = [
//            {id: 'Always', name: 'Always'},
//            {id: 'PerOrderId', name: 'Once for every order id'},
//            {id: 'PerUserSession', name: 'Once for each user for every session'},
//            {id: 'PerUserWeek', name: 'Once for every user per week'},
//            {id: 'PerUserMonth', name: 'Once for every user per month'},
//            {id: 'PerUserDay', name: 'Once for every user per 24 hour period'},
//            {id: 'PerUser10Min', name: 'Every 10 minutes'},
//            {id: 'PerNewUser', name: 'Only for new users'},
//            {id: 'PerNCReturningUser', name: 'Only for non-converting returning users'}
//        ];
//
//
//        $scope.conditionActions = [
//            {id:'LandedOn', name:'landed on'},
//            {id:'WasReferredFrom', name:'was referred from'},
//            //{id:'WasExposedTo', name:'was exposed to'}
//        ];
//
//        $scope.view = {status: ''};
//
//        $scope.getConditionActionName = function(id){
//
//            var name = '';
//
//            angular.forEach($scope.conditionActions, function(action){
//
//                if(action.id == id){
//                    name = action.name;
//                }
//
//            });
//
//            return name;
//        };
//
//        /**
//        **
//        */
//        var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
//            if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
//                updateState();
//            }
//        });
//
//        initialize();
//        if(!_.isUndefined($scope.entityLayoutInfraButtons)){
//            $scope.entityLayoutInfraButtons.discardButton = {name : 'discard', func : rollback, ref : null, nodes : []};
//            $scope.entityLayoutInfraButtons.saveButton = {name : 'save', func : save, ref : null, nodes : [], isPrimary : true};
//        }
//
//        function startDate(){
//            var now = new Date();
//            return now.getTime();
//        }
//
//        function endDate(){
//            var now = new Date();
//            now.setDate(now.getDate() + 30);
//
//            return now.getTime();
//        }
//
//
//        function populateTagSelectList(){
//            var list = [];
//            var tags = $scope.advertisersTags;
//
//            $scope.tagsThenGrid.cols[0].listDataArray = [];
//
//            angular.forEach(tags, function(tag){
//
//                list.push({id:tag.id, name: tag.name});
//            });
//
//            $scope.tagsThenGrid.cols[0].listDataArray = list;
//        }
//
//        function initialize() {
//
//            advertiserService.getAdvertisersByVersaTagId($stateParams.versaTagId).then(function(response){
//
//                $scope.advertiserList = response;
//
//            });
//
//            if(!_.isNull(entity)){
//                //$scope.isModal = true;
//                //$scope.labelWidth = 165;
//
//            }else{
//                $scope.labelWidth = '100%';
//            }
//
//            $scope.metaData = entityMetaData['firingConditions'];
//              firingConditionsService.getFiringConditionInfo($state.params.versaTagId).then(function (data) {
//                  //$scope.advertisersTags = data.advertisersTags;
//                  //$scope.advertisersIndex = data.advertisersIndex;
//                  $scope.advertiserName = data.advertiserId;
//                  $scope.editObject.versaTagId = $state.params.versaTagId;
//
//                  return data;
//              }, function(error){
//                  //TODO
//                  processError(error);
//              });
//
//            updateState();
//        }
//
//         function updateState() {
//             $rootScope.mmIsPageDirty = 0;
//             if ($scope.$parent.mainEntity != null) {
//
//                 // create rollback object
//                 $scope.originalData = EC2Restangular.copy($scope.$parent.mainEntity);
//
//                 $scope.isEditMode = true;
//                 $scope.preSaveStatus = false;
//                 $scope.editObject = EC2Restangular.copy($scope.$parent.mainEntity);
//                 getMode();
//
//                 setAdvertiserId($scope.editObject.advertiserId);
//
//                 // Set date range
//                 $scope.editObject.startDate = $scope.editObject.startDate != null ? $scope.editObject.startDate : startDate();
//                 $scope.editObject.expirationDate = $scope.editObject.expirationDate != null ? $scope.editObject.expirationDate : endDate();
//
//                 // Set enable status
//                 $scope.editObject.enabled = $scope.editObject.enabled != null ? $scope.editObject.enabled : false;
//
//
//                getAdvertiserTags();
//
//             } else {
//
//                 // create rollback object
//                 $scope.originalData = EC2Restangular.copy($scope.metaData.defaultJson);
//
//                 $scope.isEditMode = false;
//                 $scope.preSaveStatus = true;
//                 $scope.isBrandsExist = false;
//                 $scope.editObject = $scope.editObject || EC2Restangular.copy($scope.metaData.defaultJson);
//                 $scope.editObject.enabled = false;
//                 $scope.editObject.hasDuration = false;
//
//                 $scope.view.status = SIMPLE_MODE;
//
//
//                 // New mode
//                 //console.log('New mode', $scope.editObject);
//
//             }
//             $scope.editObject.occurs  = !$scope.editObject.occurs ? $scope.conditions[0].id : $scope.editObject.occurs;
//             $scope.isAdvertiserDisabled = ($scope.advertiserList.length == 1) || ($scope.editObject.actions[0].tags.length >= 1);
//
//
//
//             var advertiserWatcher = $scope.$watch('advertiserList', function (list) {
//                 if(list.length == 1){
//                     $scope.editObject.advertiserId = $scope.editObject.id == null ? list[0].id : $scope.editObject.advertiserId;
//                     $scope.isAdvertiserDisabled = true;
//
//                     // update the Firing Conditions UI to be shown.
//                     getAdvertiserTags();
//
//                     // This is how to remove the watcher
//                     advertiserWatcher();
//                 }
//             });
//
//         }
//
//        function cleanData() {
//          $scope.editObject.conditions.forEach(function(condition) {
//            delete condition.isTextArea;
//          });
//        }
//
//
//        function rollback() {
//
//            $scope.editObject = $scope.originalData;
//
//            // update the grid
//            getAdvertiserTags();
//        }
//
//
//        function saveTagsToFire(){
//
//            // Need to update the fire tag url list
//            var selectedTags = [];
//
//            angular.forEach($scope.tagsThenGrid.list, function(tag){
//
//                angular.forEach($scope.advertisersTags, function(advTag){
//
//                    if(advTag.id == tag.name){
//                        //console.log(advTag.id, advTag.name);
//                        selectedTags.push({id:advTag.id, reportingName:advTag.name, tagType:'Conversion'});
//                    }
//                });
//
//            });
//
//            $scope.editObject.actions[0].tags = selectedTags;
//        }
//
//        function save() {
//
//            cleanData();
//
//            if($scope.view.status == ADVANCE_MODE){
//                saveTagsToFire();
//            }
//
//
//            if (validateBasicControls()) {
//              if($scope.isEditMode == true) {
//
//                  return firingConditionsService.update($scope.editObject).then(function (data) {
//
//                      $scope.preSaveStatus = false;
//                      $rootScope.mmIsPageDirty = 0;
//                      $scope.showSPinner = false;
//                      mmAlertService.addSuccess('Firing condition ' + data.name + ' was successfully updated.');
//
//                  }, function(error){
//                      //TODO
//                      processError(error);
//                  });
//
//              } else {
//
//                  return firingConditionsService.create($scope.editObject).then(function(data){
//
//                      $scope.preSaveStatus = false;
//                      $rootScope.mmIsPageDirty = 0;
//                      $scope.showSPinner = false;
//                      mmAlertService.addSuccess('Firing condition ' + data.name + ' was successfully created.');
//
//                      if(!!$scope.isModal){
//                          $modalInstance.close(data);
//                      }
//                      else if (!!$scope.isEntral) {
//                          $scope.$parent.mainEntity = data;
//                      } else {
//                        $state.go($scope.metaData.editPageURL, {firingCondition: data.id}, {location : "replace"});
//                      }
//                      return data;
//                  });
//
//              }
//
//            } else {
//                //console.log($scope.validation);
//                mmAlertService.addError('Please correct the errors below before saving.');
//
//            }
//        }
//
//        $scope.switchToAdvance = function () {
//          $scope.basicView = false;
//            $scope.view.status = ADVANCE_MODE;
//
//            getAdvertiserTags();
//        };
//
//
//
//        function processError(error) {
//            console.log('ohh no!');
//            console.log(error);
//            if (_.isUndefined(error.data.error)){
//                mmAlertService.addError("Server error. Please try again later.");
//            } else {
//                //mmAlertService.addError(error.data.error);
//
//                var errorMsg = '';
//
//                if(error.data.error && error.data.error.errors && error.data.error.errors.length > 0){
//
//                    for(var i = 0; i < error.data.error.errors.length; i++){
//
//                        var errorObj = error.data.error.errors[i];
//
//                        errorMsg += errorObj.innerMessage + '\n';
//                    }
//
//                    mmAlertService.addError(errorMsg);
//                }
//                else{
//                    mmAlertService.addError(error.data.error);
//                }
//
//            }
//        }
//
//        $scope.isLoading = false;
//
//        function getAdvertiserTags(){
//            $scope.isLoading = true;
//            $scope.advertisersTags = [];
//
//            if($scope.editObject.advertiserId){
//
//                firingConditionsService.getAdvertiserTags($scope.editObject.advertiserId).then(function(tags){
//
//                    var list = [];
//
//                    angular.forEach(tags, function(tag){
//                        list.push({id:tag.id, name:tag.id + ' - ' + tag.reportingName});
//
//                        $scope.advertisersIndex[tag.id] = {
//                            reportingName: tag.reportingName,
//                            id: tag.id,
//                            tagType: tag.tagType
//                        };
//                    });
//
//                    $scope.advertisersTags = list;
//
//                    populateTagSelectList();
//                    setAdvertiserTagsList();
//
//                    $scope.isLoading = false;
//
//                }, function(response){
//                    //console.log('no results', response);
//                    $scope.advertisersTags = [];
//                    $scope.isLoading = false;
//                });
//            } else {
//
//                setAdvertiserTagsList();
//            }
//
//
//        }
//
//        function setAdvertiserTagsList(){
//
//            var list = [];
//
//            if($scope.editObject.actions && $scope.editObject.actions[0].tags){
//                angular.forEach($scope.editObject.actions[0].tags, function(tag){
//
//                    // had to map the name to the id since a select list is being used to represent the data
//                    list.push({id:tag.id, name:tag.id});
//                });
//
//                $scope.tagsThenGrid.list = list;
//            }
//        }
//
//        $scope.onAdvertiserChange = function(){
//
//            // make the rest call to generate the list
//            getAdvertiserTags();
//
//        };

        //$scope.addOrCondition = function (index) {
        //    var defaultOrCondition = {
        //        urlList: [],
        //        ifUser: 'LandedOn',
        //        urlThat: "Equals",
        //        id: 0
        //    };
        //    if (!_.has($scope.editObject.conditions[index], 'or') || $scope.editObject.conditions[index].or === null) {
        //        $scope.editObject.conditions[index].or = [];
        //        $scope.subConditions =  true;
        //    }
        //    defaultOrCondition.id = Math.round(Math.random() * 100);
        //    $scope.editObject.conditions[index]['or'].push(defaultOrCondition);
        //};
		//
        //$scope.addAndCondition = function(type){
		//
        //    var condition = {
        //        urlList: [],
        //        ifUser: type,
        //        urlThat: "Any",
        //        or: [],
        //        moreThan_Times: 0,
        //        trackURLParams: false,
        //        trackAnySubdomain: false,
        //        trackStandardIndexIgnoreSlashes: false
        //    };
		//
        //    $scope.editObject.conditions.push(condition);
        //    $scope.$root.isDirtyEntity = true;
        //};
		//
        //$scope.changeInternalNameTag = function (obj, index) {
		//
        //    //console.log(obj, index);
		//
        //    //console.log($scope.advertisersIndex[obj]);
		//
        //    angular.copy( $scope.advertisersIndex[obj], $scope.editObject.actions[0].tags[index]);
		//
        //    //console.log('selected', $scope.advertisersIndex[obj]);
        //    //console.log('tags', $scope.editObject.actions[0].tags);
        //};
		//
		//
        //function setAdvertiserId(advertiserId) {
        //  $scope.advertiserName = advertiserId;
        //}

        //function getMode() {
        //  var visualizationOptions ={
        //    isTextArea : false
        //  };
        //    //console.log($scope.editObject);
		//
        //    // Don't show basic view if there are 'OR' conditions
        //  if($scope.editObject.conditions && $scope.editObject.conditions.length > 0){
        //      $scope.basicView = (!(_.has($scope.editObject.conditions[0], 'or')) || $scope.editObject.conditions[0].or === null);
        //  }
		//
        //    // Don't show basic view if there is more than one condition
        //    $scope.basicView =  $scope.basicView && !($scope.editObject.conditions && $scope.editObject.conditions.length > 1);
		//
        //    // Don't show basic view if there are more than one assigned tag
        //    $scope.basicView = $scope.basicView && !($scope.editObject.actions != null && $scope.editObject.actions.length > 0 && $scope.editObject.actions[0].tags.length > 1);
		//
        //  if($scope.basicView) {
        //      //TODO
        //      $scope.view.status = SIMPLE_MODE;
        //  } else {
        //    $scope.subConditions = !$scope.basicView;
		//
        //      $scope.view.status = ADVANCE_MODE;
		//
		//
        //    if($scope.editObject.conditions.length > 0 ){
		//
        //        $scope.editObject.conditions.forEach(function (subCondition) {
        //            _.extend(subCondition, visualizationOptions);
		//
        //            if(subCondition['or'] && subCondition['or'].length > 0){
        //                subCondition.or.forEach(function (orCondition) {
        //                    _.extend(orCondition, visualizationOptions);
        //                });
        //            }
		//
        //        });
        //        //console.log('SUB CONDITIONS - OR', $scope.subConditions);
        //    }
		//
        //  }
        //}

		//
        //// this is for the Modal whithin     Assigned to all campaings button //-------------- Modal parts __________
        // $scope.openFireTagsGrid = function (index) {
        //    if ($scope.isModalOpen) {
        //        return;
        //    }
		//
        //    $scope.isModalOpen = true;
        //    var modalInstance = mmModal.open({
        //        templateUrl: 'versaTag/app/views/firingConditionsGrid.html',
        //        controller: 'fireTagsCtrl',
        //        title: "Fire Tags",
        //        modalWidth: 750,
        //        bodyHeight: 380,
        //        confirmButton: { name: "Assign", funcName: "save", hide: false, isPrimary: true},
        //        discardButton: { name: "Cancel", funcName: "cancel" },
        //        resolve: {
        //            tags: function () {
        //                return $scope.advertisersTags
        //            },
        //            selectedTags: function () {
        //                return $scope.isEditMode ? $scope.editObject.actions[0].tags : [];
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (tags) {
        //      $scope.editObject.actions[0].tags = [];
        //      for (var i = 0; i < tags.length; i++) {
        //        $scope.editObject.actions[0].tags.push({});
        //        $scope.changeInternalNameTag(tags[i], i);
        //      }
        //      $scope.isModalOpen = false;
        //    }, function () {
        //        $scope.isModalOpen = false;
        //    });
        //};
		//
		//
        //  /// open Landing Urls
        // $scope.landingUrlModal = function (index) {
        //    if ($scope.isModalOpen) {
        //        return;
        //    }
		//
        //    $scope.isModalOpen = true;
        //    var modalInstance = mmModal.open({
        //        templateUrl: 'versaTag/app/views/landingUrlsGrid.html',
        //        controller: 'landingUrlsCtrl',
        //        title: "Landing Urls",
        //        modalWidth: 750,
        //        bodyHeight: 380,
        //        confirmButton: { name: "Done", funcName: "save", hide: false, isPrimary: true},
        //        discardButton: { name: "Cancel", funcName: "cancel" },
        //        resolve: {
        //            urls: function () {
        //                return (!$scope.basicView && $scope.isEditMode) ?  $scope.editObject.conditions[0].or[index].urlList : [];
        //            }
        //        }
		//
        //    });
		//
        //    modalInstance.result.then(function (urls) {
        //      $scope.editObject.conditions[0].or[index].urlList = urls;
        //      $scope.isModalOpen = false;
        //    }, function () {
        //        $scope.isModalOpen = false;
        //    });
        //};








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
            if ($scope.editObject.conditions[0].urlThat !== 'Any' && ($scope.editObject.conditions[0].urlList[0] === undefined || $scope.editObject.conditions[0].urlList[0] === null ||
              _.isEmpty($scope.editObject.conditions[0].urlList[0]))) {
              $scope.validation.basicUrl = "Please enter a valid url";
              isValid = false;
            }

            //console.log($scope.editObject.actions[0].tags);

            if ($scope.editObject.actions[0].tags.length == 0 || $scope.editObject.actions[0].tags[0].id === undefined || $scope.editObject.actions[0].tags[0].id === null ||
              _.isEmpty($scope.editObject.actions[0].tags[0].id)) {
              $scope.validation.advertisersTags = "Please Select a Tag";
              isValid = false;
            }
            if ($scope.editObject.occurs === undefined || $scope.editObject.occurs === null ||
              _.isEmpty($scope.editObject.occurs)) {
              $scope.validation.occurs = "Please Select an Option";
              isValid = false;
            }

            //console.log($scope.validation);

          return isValid;
        }

        $scope.validateUrl =  function ($event) {
          $event.preventDefault();
          if (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test($scope.editObject.conditions[0].urlList[0])) {
            $scope.validation.basicUrl = '';
            window.open($scope.editObject.conditions[0].urlList[0],'_blank');
          } else {
            $scope.validation.basicUrl = "Please enter a valid url";
          }
        }


    }
]);
