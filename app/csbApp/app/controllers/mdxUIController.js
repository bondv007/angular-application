app.controller( 'panelController', [ '$scope', 'panelFactory',
    function( $scope, panelFactory ) {

        $scope.closePanelUI = function() {
            panelFactory.showPanelUI = false;
            panelFactory.decisionModel = null;
        };

        $scope.panelFactory = panelFactory;

    }
]);

/**
 * This is a helper method that is used to validate
 * if a panel is to be shown for a given element on the canvas
 *
 * @param scope
 * @param type
 */
function validatePanel(scope, panelType, callback){

    scope.$watch('showPanel', function(newVal){

        scope.showUI = false;

        // If value is equal to the panel type value, then show the panel
        if(newVal != false && newVal == panelType) {

            // set to true to show the panel
            scope.showUI = true;

            if(callback != undefined && typeof callback == 'function'){
                callback();
            }
        }
    });
}

var YES_DECISION = 'yes-decision',
    NO_DECISION = 'no-decision',
    DEFAULT_DECISION = 'default-decision';

function defaultTargetingGroups(){

    var groups = [
        {rules:[], type:YES_DECISION}
    ];

    return groups;
}

function getAdvertiserDays(){

    var days = [];

    for(var i = 0; i < 365; i++){

        var d = (i + 1);

        var dayString;
        if ( i == 0 ) {
            dayString = ' day';
        }
        else{
            dayString = ' days';
        }

		// modifying keys to be named "id" and "name" so that
		// mm-dropdown would display the items
        days.push({id: d, name: d + dayString});
    }

    return days;
}

/**
 * NEW DIRECTIVES FOR EACH SLIDEOUT PANEL UI
 * Removed the MDXui directive as it wasn't needed. These should be seperated as they could each interact with the model differently...
 * so isolating is a good idea here
 * TODO: Seems weird to pass closePanelUI function through. Maybe we could call GraphFactory directly
 * NOTE: I used lowercase 'i' inside of directive because using uppercase would have caused attribute to be 'close-panel-u-i'...
 *       we could probably just rename the fuction in the controller to use the lowercase "i" to stop any confusion
 */

app.directive( 'staticRetargetingPanel', [ 'panelFactory', 'decisionTreeService', 'modalFactory', 'appService', 'advertisers', 'csb', 'segmentsFactory', '$timeout',
    function( panelFactory, decisionTreeService, modalFactory, appService, advertisers, csb, segmentsFactory, $timeout ) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                decision: '=',
                showPanel: '=',
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/staticRetargetingDecisionUI.html',
            link: function( scope, element, attrs ) {

                // handle iteractions with the dom and model here
                // in a completely isolated scope.. no worrying about conflicting issues

                var originalDecisionData;

                // making the csbData available to the panel
                // It seemed unnecessary to include the whole appService
                // but could be done if needed
                scope.csbData = appService.csbData;

                // doing the same with the csb service so that the dropdown for advertiser can be disabled
                scope.csb = {};
                scope.csb.params = csb.params;

                if( !scope.decision ) {
                    scope.decision = new Decision({});
                }

                // This is a boolean that shows the UI based on its value
                scope.showUI = false;

                scope.advertiserChanged = function() {
					scope.tags = [];
					angular.forEach(scope.decision.data.targetingGroups, function (group){
						group.rules = [];
						scope.addRule(group);
					});
					scope.updateTags();
                };

                // then when we select the advertiser from the drop down, we show different tags
                scope.updateTags = function( callback ) {

                    // get the tags by advertiser id.. this will populate the selections
                    advertisers.getRetargetingTags({ advertiserId: scope.advertiser.value.id } ).then(
                      function( response ) {
                        scope.tags = response;

                        if (callback) {
                            callback();
                        }

                      });

                };

                /**
                 * This method gets the custom tags associated by the tag id
                 *
                 * @param id INT The tag id
                 */
                scope.updateTagValues = function( rule, change ) {

					if ( scope.tags.length && rule.details ) {
						var tag = scope.tags[ scope.tags.indexOfObjectByKey('id', rule.details.id) ];

						if( change ) {
							rule.selectedTagValues = [];
						}

						rule.tagValues = tag.values;
					}

                };

                // This is called to initialize the form UI controls
                var init = function(){

                    // clearing out any errors
                    scope.errorText = '';


                    scope.tags = [];

                    // set the name
                    scope.name = {};
                    scope.name.text = scope.decision.name;

                    scope.selectedDay = {};
                    scope.selectedDay.value = {};
                    scope.ruleTypeOptions = [
                      {
                        'id' : 'yes-no',
                        'name': 'Yes-No'
                      },
                      {
                        'id': 'multi',
                        'name': 'Multiple Yes branches'
                      }
                    ];


                  // hardcoded values here
                  scope.exposures = [
                    {
                      'id': 1,
                      'name': "Exposed to"
                    },
                    {
                      'id': 2,
                      'name': "Not Exposed to"
                    }
                  ];

                  scope.logicalOperater = [
                    {
                      id: 1,
                      name: "And"
                    },
                    {
                      id: 2,
                      name: "Or"
                    }
                  ];


                  scope.advertiserDays = getAdvertiserDays();

                  // select the name input when opening the panel
                  $timeout(function() {
                    element.find('input').first().focus().select();
                  });

                  if(!scope.decision.data){

                    // This is an object that holds the value of the form data
                      scope.decision.data = {
                        isYesNo: "yes-no"
                      };

                      scope.selectedDay.value.id = -1;

                      // update Retargeting Rules dropdown
                      scope.changeTargetType(scope.decision.data.isYesNo);
                  } else if (scope.decision.data.selectedDay) {
                    scope.selectedDay.value.id = scope.decision.data.selectedDay;
                  }

                    originalDecisionData = angular.copy(scope.decision);

                    // when the tab loads we need to get the list of advertisers if one isn't selected yet
                    scope.advertiser = {};
				    scope.advertiser.value = {};
                    scope.advertiser.value.id = csb.params.advertiserID || null;


                    // show the spinner
                    scope.loading = true;

                    // hide the UI
                    scope.staticAvailable = false;

                    advertisers.getAdvertisers({ accountId: csb.params.accountID, hasStaticTags: true })
                        .then(function( response ) {

                            // we need to see if we already have one selected.. if so we need to check to see if it's available in this list
                            if ( csb.params.advertiserID ) {
                                angular.forEach( response, function( advertiser ) {
                                    if ( advertiser.id == csb.params.advertiserID ){
                                        scope.staticAvailable = true;
                                    }
                                });
                            }

                            else {
                                scope.staticAvailable = true;
                            }

                            scope.advertisers = response;
                            scope.loading = false;

                        },
                        function() {

                            scope.staticAvailable = false;
                            scope.loading = false;

                        }
                    );

                    // the decision has an advertiser already selected
                    if( scope.advertiser.value.id ){
                        // it means the dropdown should be filled with it's tags
                        // and the tag values should be filled as well
                        // NOTE: notice the extra parameter is a function that serves as a callback
                        // to acomplish filling the tagValues, otherwise the scope.tags array could not be available until later
                        scope.updateTags(updateTagValuesForRules);
                    }

                };

                /**
                * This function will fill in the tagValues array for the rules in a targetingGroup
                */
                function updateTagValuesForRules() {

                  angular.forEach(scope.decision.data.targetingGroups, function (group){
                    angular.forEach(group.rules, function(rule) {
                      scope.updateTagValues(rule);
                    });
                  });
                };

                validatePanel(scope, panelFactory.diagramTypes.STATIC_RETARGETING, init);


                // This is the handler that changes the UI base on if the dropdown for yes-no is set
                scope.changeTargetType = function( value ){

					if ( scope.decision.data.targetingGroups && scope.decision.data.targetingGroups.length ) {
						scope.decision.data.targetingGroups = [ scope.decision.data.targetingGroups[0] ];
					}
					else{
						scope.decision.data.targetingGroups = [];
						if ( value == 'yes-no' ) {
							scope.decision.data.targetingGroups = defaultTargetingGroups();
						}
						else{
							var group = {rules:[], type:'multi'};
							scope.decision.data.targetingGroups.push( group );
						}
					}

                };

                scope.addRule = function(audienceGroup){

                    var rule = {
                      id: 1,
                      exposure: {
                        id: 1
                      },
                      logicalOperator: {
                        id: 1
                      },
						tagValues: [],
						selectedTagValues: []
                    };

                  audienceGroup.rules.push(rule);

                };

                scope.addGroup = function(){
                    scope.decision.data.targetingGroups.push({ rules:[], type:'multi' });
                };

                scope.removeItems = [];


                scope.removeGroup = function(group) {

                    var i = scope.decision.data.targetingGroups.indexOf(group);

                    if (i > -1) {
                        scope.decision.data.targetingGroups.splice(i, 1);
                        scope.removeItems.push(i);
                    }

                }

                scope.closePanel = function(){
                    scope.closePanelUi();
                    scope.showUI = false;
                    decisionTreeService.clearSelectedDecision();
					// if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
					if (!scope.decision.yesDecisions.length ) {
						decisionTreeService.deleteDecision( scope.decision );
					}
                };

                scope.save = function() {

                    var isUpdating = (scope.decision.yesDecisions.length > 0 && scope.decision.noDecisions.length > 0);
                    var isValid = true;

                    angular.forEach( scope.decision.data.targetingGroups, function(group){

                        if(group.rules.length == 0 && group.type != 'default-decision'){
                            isValid = false;
                        }

                        angular.forEach( group.rules, function(rule){

							if ( group.type != 'default-decision' ) {
								if ( !rule.exposure
									|| !rule.details
									|| rule.tagValues
									&& rule.tagValues.length
									&& !rule.selectedTagValues.length ) {

									isValid = false;
								}
							}

                        });
                    });

                    // remove any groups that we deleted
                    for ( var i = 0; i < scope.removeItems.length; i++ ) {
                        scope.decision.yesDecisions.splice( scope.removeItems[i], 1 );
                    }

                    scope.removeItems = [];

                    // validation

                    scope.errorText = '';

                    if(!isValid){
                        scope.errorText += 'You didn\'t complete a rule. ';
                    }
                    if ( !scope.decision.name ) {
                        scope.errorText += 'You must enter a name. ';
                    }
                    if ( !scope.advertiser.value.id ){
                        scope.errorText += 'You must select an advertiser. ';
                    }
                    if ( scope.errorText ) {
                        return false;
                    }

                    scope.decision.name = scope.name.text;
                    scope.decision.data.selectedDay = scope.selectedDay.value.id;
                    csb.params.advertiserID = scope.advertiser.value.id || csb.params.advertiserID;
					csb.params.advertiserName = scope.advertiser.value.name || csb.params.advertiserName;

                    var yesTAs = [];

                    angular.forEach(scope.decision.data.targetingGroups, function (group) {

                        var retargetingRules = [];
                        var targetAudienceData = [];

                        if (group.type != 'default-decision') {

                            var rules = group.rules;

                            if (rules.length > 0) {

                                angular.forEach(rules, function (rule, i) {

                                  var logicalOperator = rule.logicalOperator ? rule.logicalOperator : null;

                                    // create rule
                                    var targetingRule = decisionTreeService.createRule(rule, scope.decision, logicalOperator, null, null, i );
                                    retargetingRules.push(targetingRule);

                                    // create the contextual TA rule
                                    var targetAudienceRule = decisionTreeService.createContextualRule(rule, scope.decision, logicalOperator );
                                    targetAudienceData.push(targetAudienceRule);

                                });
                            }

                            // No need to update anything if nothing changed
                            if( retargetingRules.length > 0 && targetAudienceData.length > 0) {

                                var description = scope.decision.name;

                                // chain the rules together
                                if( scope.decision.parentType ) {
                                    if ( scope.decision.description != 'Default' ) {
                                        description = scope.decision.description + ' ' + scope.decision.name;
                                    }
                                }

                                var taDecision = decisionTreeService.createTargetAudienceData('yes-decision', description, retargetingRules, targetAudienceData);
                                yesTAs.push(taDecision);
                            }

                        }

                    });

                    var index = 0;

                    angular.forEach(yesTAs, function (taData, i) {

                        // create the label if it's multi
						if ( scope.decision.data.isYesNo == 'multi' ) {
							var label = '';
							angular.forEach( taData.targetAudienceData, function( rule, g ) {
								label += rule.exposure + ' ' + rule.name;
								g < taData.targetAudienceData.length - 1 ? label += ' ' + rule.logicalOperatorID + ' ' : null;
							});
						}


                        if ( scope.decision.yesDecisions.length < yesTAs.length && i > scope.decision.yesDecisions.length - 1 ) {
                            decisionTreeService.addAudienceSegment(scope.decision, taData.description, taData.decisionType, null, taData.retargetingRules, taData.targetAudienceData, label );
                        }

                        else {

                            var currentTADecision = scope.decision.yesDecisions[index];
                            // Update existing decisions
                            decisionTreeService.updateAudienceSegment(currentTADecision, taData.name, taData.description, taData.retargetingRules, taData.targetAudienceData, label  );

                        }

                        // terrible place to put this.. but make sure if it's yes/no that it removes any of the other decisions
                        if ( scope.decision.data.isYesNo == 'yes-no' ) {
                            scope.decision.yesDecisions = [ scope.decision.yesDecisions[0] ];
                        }

                        index++;

                    });

                    if(!isUpdating){
                        // create Default audience segment
                        var description;
                        if ( scope.decision.parentType ) {
                            description = scope.decision.description;
                        }
                        else{
                            description = 'Default';
                        }

                        decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null, null);
                    }

                    // don't remove
                    decisionTreeService.buildAudienceSegmentsFromDiagram();

                    scope.closePanel();

                };

                scope.cancelChanges = function(){
                    angular.copy( originalDecisionData, scope.decision );
                    scope.closePanel();
					// if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
					if (!scope.decision.yesDecisions.length ) {
						decisionTreeService.deleteDecision( scope.decision );
					}
                };
            }
        }

    }
]);


/**
 * The geo panel directive
 *
 */
app.directive( 'geoTargetingPanel', [ 'panelFactory', 'geo', 'decisionTreeService', '$timeout', 'segmentsFactory',
    function( panelFactory, geo, decisionTreeService, $timeout, segmentsFactory) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                decision: '=',
                showPanel: '=',
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/geoTargetingUI.html',

            link: function( scope, element, attrs ) {

                // validate and init the panel
                validatePanel(scope, panelFactory.diagramTypes.GEO_TARGETING, init);

                // This is called to initialize the geo panel (load countries, show selected, etc )
                function init(){

                    // clearing out any errors
                    scope.errorText = '';

                    // set the scope decision data as an object
                    scope.decision.data = scope.decision.data || {};

                    // set the inital value of the geo decision type (yes/no or multi).. could come from decision data or fallback to 'yes-no'
                    scope.ruleType = scope.decision.data.ruleType || 'yes-no';

                    // get the original decision so we can revert later
                    scope.originalDecision = angular.copy(scope.decision);

                    // get the name and set to scope
                    scope.name = scope.decision.name;

                    // and select the name input when opening the panel
                    $timeout( function() {
                        element.find('input').first().focus().select();
                    });


                    /**
                     * These sections load and set the needed date for each tab
                     */

                    // init the selected object to hold temporary values.. like the selected state value when choosing a city (selected.cityState)
                    scope.selected = {};

                    /**
                     * tab: Countries
                     * @type {number}
                     */
                    scope.countries = [];
                    scope.selectedCountries = scope.decision.data.selectedCountries || [];
                    geo.getGeo('countries').then(function( countries ) {
                      scope.countries = countries;
                    });


                    /**
                     * tab: States/Regions
                     * @type {number}
                     */
                    scope.states = [];
                    scope.selectedStates = scope.decision.data.selectedStates || [];
                    geo.getGeo( 'countries', { type: 'states' } ).then(function(countries) {
                        scope.stateCountries = countries;
                    });

                    scope.pickStateCountry = function( stateCountry ) {
                        geo.getGeo( 'states', { countryId: stateCountry } ).then(function(states) {
                            scope.states = states;
                        });
                    };


                    /**
                     * tab: Cities
                     * @type {number}
                     */
                    scope.cities = [];
                    scope.selectedCities = scope.decision.data.selectedCities || [];
                    geo.getGeo( 'countries', { type: 'cities' } ).then(function(countries) {
                        scope.cityCountries = countries;
                    });

                    scope.pickCityCountry = function ( cityCountry ) {
                        geo.getGeo( 'states', { type: 'cities', countryId: cityCountry } ).then(function(states) {
                            scope.cityStates = states;
                        });
                    };

                    scope.pickCityState = function( cityState ) {
                        geo.getGeo( 'cities', { stateId: cityState } ).then(function(cities) {
                            scope.cities = cities;
                        });
                    };


                    /**
                     * tab: Nielsen DMA
                     * @type {number}
                     */
                    scope.nielsen = [];
                    scope.selectedNielsen = scope.decision.data.selectedNielsen || [];
                    geo.getGeo( 'countries', { type: 'dma' } ).then(function( countries ) {
                        scope.nielsenCountries = countries;
                    });

                    scope.pickNielsenCountry = function ( nielsenCountry ) {
                        geo.getGeo( 'states', { type: 'dma', countryId: nielsenCountry } ).then(function(states) {
                            scope.nielsenStates = states;
                        });
                    };

                    scope.pickNielsenState = function ( nielsenState ) {
                        geo.getGeo( 'dmas', { stateId: nielsenState } ).then(function(dmas ) {
							// add the selected state and country for TA save
							angular.forEach( dmas, function( dma ) {
								dma.country = scope.selected.nielsenCountry;
								dma.state = scope.selected.nielsenState;
							});
                            scope.nielsen = dmas;
                        });
                    };


                    /**
                     * tab: Area Codes
                     * @type {number}
                     */
                    scope.areaCodes = [];
                    scope.selectedAreaCodes = scope.decision.data.selectedAreaCodes || [];
                    geo.getGeo( 'countries', { type: 'areaCode' } ).then(function(countries) {
                        scope.areaCodeCountries = countries;
                    });

                    scope.pickAreaCodeCountry = function ( areaCodeCountry ) {
                        geo.getGeo( 'states', { type: 'areaCode', countryId: areaCodeCountry } ).then(function(states) {
                            scope.areaCodeStates = states;
                        });
                    };

                    scope.pickAreaCodeState = function ( areaCodeState ) {
                        geo.getGeo( 'areaCodes', { stateId: areaCodeState } ).then(function(areaCodes) {
							// add the selected country and state for TA save
							angular.forEach( areaCodes, function( areaCode ) {
								areaCode.country = scope.selected.areaCodeCountry;
								areaCode.state = scope.selected.areaCodeState;
							});
                            scope.areaCodes = areaCodes;
                        });
                    };


                    /**
                     * tab: Postal Codes
                     * @type {number}
                     */
                    // have to make this an object so that the scope updates from the textarea
                    scope.postalCodes = {};
                    scope.postalCodes.selected = scope.decision.data.selectedPostalCodes || '';
					          scope.selected.postalCodeCountry = scope.decision.data.selectedPostalCodesCountry || null;
                    geo.getGeo( 'countries', { type: 'postalCode' } ).then(function(countries) {
                        scope.postalCodeCountries = countries;
                    });


                    /**
                     * tab: ISP
                     * @type {number}
                     */
                    scope.ISPs = [];
                    scope.selectedISPs = scope.decision.data.selectedISPs || [];
                    geo.getGeo( 'countries', { type: 'isp' } ).then(function(countries) {
                        scope.ISPCountries = countries;
                    });

                    scope.pickISPCountry = function ( country ) {
                        geo.getGeo( 'isps', { countryId: country } ).then(function( ISPs ) {
                            scope.ISPs = ISPs;
                        });
                    };

                };

				// The Geo TA model for creating GEO rules
				function GeoRule( data ) {
					this.countries = data.countries || null;
					this.regions = data.regions || null;
					this.cities = data.cities || null;
					this.areaCodes = data.areaCodes || null;
					this.nielsenDMAs = data.nielsenDMAs || null;
					this.zipCodes = data.zipCodes || null;
					this.isps = data.isps || null;
				};

                function ContextualGeoRule( data ) {
                    this.exposure = data.exposure == 1 ? 'From' : 'Not from';
                    this.type = scope.decision.type;
                    this.name = data.name;
                    this.logicalOperatorID = data.logicalOperatorID == 1 ? 'AND' : 'OR';
                };


                scope.save = function(){

                    // an array to hold all the rules from each tab
                    var rules = [];

                    // a helper function to push to rules
                    function pushToRules( rule, name, label ) {

                        var contextualRule = new ContextualGeoRule({
                            exposure: 1,
                            name: name,
                            logicalOperator: 2
                        });

                        rules.push({
                            description: name,
                            targetingRule: rule,
                            label: label,
                            contextualTargetingRule: contextualRule
                        });

                    };

                    /**
                     * First we are going to start with setting the decision type on the decision
                     */
                    scope.decision.data.ruleType = scope.ruleType;

                    /**
                     * For the selected Countries
                     */
                    if ( scope.selectedCountries.length ) {
                        angular.forEach( scope.selectedCountries, function( country ) {

                            var rule = new GeoRule({
                                countries: country.geoItemID
                            });

                            pushToRules( rule, country.geoItemName + ' (Country)', country.geoItemName + ' (Country)' );

                            scope.decision.data.selectedCountries = scope.selectedCountries;

                        });
                    }

                    /**
                     * For the selected States
                     */
                    if ( scope.selectedStates.length ) {

                        angular.forEach( scope.selectedStates, function( state ) {

                            var rule = new GeoRule({
                                regions: state.geoItemID
                            });

                            pushToRules( rule, state.geoItemName + ' (State/Region)', state.geoItemName + ' (State/Region)' );

                            scope.decision.data.selectedStates = scope.selectedStates;

                        });
                    }


                    /**
                     * For the selected Cities
                     */
                    if ( scope.selectedCities.length ) {
                        angular.forEach( scope.selectedCities, function( city ) {

                            var rule = new GeoRule({
                                cities: city.geoItemID
                            });

                            pushToRules( rule, city.geoItemName + ' (City)', city.geoItemName + ' (City)' );

                            scope.decision.data.selectedCities = scope.selectedCities;

                        });
                    }

                    /**
                     * For the selected Nielsen data
                     */
                    if ( scope.selectedNielsen.length ) {
                        angular.forEach( scope.selectedNielsen, function( nielsen ) {

							var rule = new GeoRule({
								nielsenDMAs: {
									countryId: nielsen.country.geoItemID,
									regionId: nielsen.state.geoItemID,
									id: nielsen.geoItemID,
									type: 'NielsenDMA'
								}
							});

                            pushToRules( rule, nielsen.geoItemName + ' (Nielsen)', nielsen.geoItemName + ' (Nielsen)' );

                            scope.decision.data.selectedNielsen = scope.selectedNielsen;

                        });
                    }

                    /**
                     * For the selected Area Codes
                     */
                    if ( scope.selectedAreaCodes.length ) {
                        angular.forEach( scope.selectedAreaCodes, function( areaCode ) {

							var rule = new GeoRule({
								areaCodes: {
									countryId: areaCode.country.geoItemID,
									regionId: areaCode.state.geoItemID,
									id: areaCode.geoItemID,
									type: 'AreaCode'
								}
							});

                            pushToRules( rule, areaCode.geoItemName + ' (Area Code)', areaCode.geoItemName + ' (Area Code)' );

                            scope.decision.data.selectedAreaCodes = scope.selectedAreaCodes;

                        });
                    }

                    /**
                     * For the selected postal codes
                     */
                    if ( scope.postalCodes.selected.length ) {

                        // first split them between commas
                        var postalCodes = scope.postalCodes.selected.replace(/\s/g, '').split(',');
                        angular.forEach( postalCodes, function( postalCode ) {

                            var rule = new GeoRule({
                                zipCodes: {
									countryId: scope.selected.postalCodeCountry.geoItemID,
									countryZipCodes: postalCode,
									type: 'ZipCode'
								}
                            });

                            pushToRules( rule, postalCode + ' (Postal Code)', postalCode + ' (Postal Code)');

                            scope.decision.data.selectedPostalCodesCountry =  scope.selected.postalCodeCountry;
                            scope.decision.data.selectedPostalCodes = scope.postalCodes.selected;

                        });
                    }

                    /**
                     * For the selected ISPs
                     */
                    if ( scope.selectedISPs.length ) {
                        angular.forEach( scope.selectedISPs, function( isp ) {

                            var rule = new GeoRule({
                                isps: isp.geoItemID
                            });

                            pushToRules( rule, isp.geoItemName + ' (ISP)', isp.geoItemName + ' (ISP)' );

                            scope.decision.data.selectedISPs = scope.selectedISPs;

                        });
                    }

                    scope.errorText = '';
                    // now we can do some validation
                    if ( !rules.length ) {
                        scope.errorText += 'You have not selected any geo options. ';
                    }
                    if ( !scope.name ) {
                        scope.errorText += 'You must enter a name. ';
                    }
                    if ( scope.errorText ) {
                        return false;
                    }

                    // copy the decisions first
                    // we need to clear out the decisions so that we don't have any unncessary paths (for instance if we remove a rule)
                    var scopeYesDecisions = angular.copy( scope.decision.yesDecisions );
                    scope.decision.yesDecisions = [];

                    /**
                     * SAVE FOR YES-NO DECISIONS
                     * if the decision is yes-no, we will combine all data into one TA
                     */
                    if ( scope.ruleType == 'yes-no' ) {

                        // create some vars to push to
                        var taDescription = '';
                        var taRules = [];
                        var taData = [];

                        // loop over the audience segments array (created from each of the tabs)
                        angular.forEach( rules, function ( rule, i ) {

                            // create the description by stringing together the descriptions
                            taDescription += rule.description + ( i < rules.length - 1 ? ' - ': '');

                            // push the rules
                            taRules.push( rule.targetingRule);

                            // push the contextual data
                            taData.push( rule.contextualTargetingRule );

                        });

                        // now create the object that we can pass to the addGeoAudienceSegment function
                        var decisionData = {
                            description: taDescription,
                            decisionType: 'yes-decision',
                            targetAudienceData: taData,
                            rules: taRules
                        };

                        // we will update it if yes decisions already exist
                        if (scopeYesDecisions && scopeYesDecisions.length == 1 ) {
                            scope.decision.yesDecisions.push( scopeYesDecisions[0] );
                            var taDecision = scope.decision.yesDecisions[0];
                            decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, decisionData.rules, decisionData.targetAudienceData );
                        }

                        // otherwise we are going to create a new TA
                        else {
                            // and finally create the audience segment
                            decisionTreeService.addGeoAudienceSegment( scope.decision, decisionData );

                        }
                    }

                    /**
                     * SAVE FOR MULTIPLE CHOICE DECSISION
                     * we will create a target audience for each possible rule
                     */
                    else{

                        angular.forEach( rules, function( rule ) {

                            // now create the object that we can pass to the addGeoAudienceSegment function
                            var decisionData = {
                                description: rule.description,
                                decisionType: 'yes-decision',
                                targetAudienceData: [ rule.contextualTargetingRule ],
                                rules: [ rule.targetingRule ],
                                label: rule.label
                            };

                            var updated = false;

                            // see if we can update any of them
                            if ( scopeYesDecisions.length ) {
                                angular.forEach( scopeYesDecisions, function( decision, i ) {
                                    if ( angular.equals( decision.rules, [ decisionData.rules ] ) ) {
                                        scope.decision.yesDecisions.push( decision );
                                        var taDecision = scope.decision.yesDecisions[ scope.decision.yesDecisions.length - 1];
                                        decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, decisionData.rules, decisionData.targetAudienceData, decisionData.label );
                                        updated = true;
                                    }
                                });
                            }

                            // create a rule for each one that wasn't updated
                            if ( !updated ) {
                                decisionTreeService.addGeoAudienceSegment(scope.decision, decisionData, decisionData.label, true);
                            }


                        });

                    }

                    /**
                     * ALWAYS CREATING A NO DECISION IF IT DOESN'T EXIST YET
                     */
                    if ( scope.decision.noDecisions.length == 0 ) {
                        var description;
                        if( scope.decision.parentType ) {
                            description = scope.decision.description;
                        }
                        else{
                            description = 'Default'
                        }
                        decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
                    }

                    scope.decision.name = scope.name;

                    // don't remove
                    decisionTreeService.buildAudienceSegmentsFromDiagram();

                    scope.closePanel();

                };

                scope.closePanel = function(){
                    scope.closePanelUi();
                    decisionTreeService.clearSelectedDecision();

                };

                scope.cancelChanges = function(){
                    scope.closePanel();
                    scope.model = angular.copy(scope.model);
					// if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
					if (!scope.decision.yesDecisions.length ) {
						decisionTreeService.deleteDecision( scope.decision );
					}
                }

            }
        }

    }
]);



app.directive( 'siteKeywordsPanel', [ 'GraphFactory', 'panelFactory', 'csb', 'decisionTreeService',
	function( GraphFactory, panelFactory, csb, decisionTreeService ) {

		return {
			restrict: 'A',
			replace: true,
			scope: {
				showPanel: '=',
				closePanelUi: '&',
				decision: '='
			},
			templateUrl: 'csbApp/app/views/ui/keywordsTargetingUI.html',
			link: function( scope, element, attrs ) {

				// This will show the panel when the 'showPanel' value is changed
				// and the new value is equal to the panelFactory.diagramTypes.SITE_KEYWORDS
				validatePanel(scope, panelFactory.diagramTypes.SITE_KEYWORDS, init);

				function init() {

					scope.originalDecision = angular.copy( scope.decision );
					scope.decision.data = scope.decision.data || {};
					scope.segments = scope.decision.data.segments || [ { sites: [ {} ] } ];
					scope.name = {};
					scope.name.text = scope.decision.name;
					scope.ruleType = {};
					scope.ruleType.id = scope.decision.data.ruleType || 'yes-no';
					scope.segmentsToDelete = [];
					scope.errorText = '';

					scope.ruleTypeOptions = [
						{
							'id' : 'yes-no',
							'name': 'Yes-No'
						},
						{
							'id': 'multi',
							'name': 'Multiple Yes branches'
						}
					];

				};

				scope.changeRuleType = function() {

					if ( scope.ruleType.id === 'yes-no' ) {
						scope.segments = [ scope.segments[0] ];
					}

				};

				scope.addRule = function() {
					scope.segments.push( { sites: [ {} ] } );
				};

				scope.addSite = function( segment ) {
					segment.sites.push( {} );
				};

				scope.removeSite = function( segment, index ) {
					segment.sites.splice( index, 1 );
				};

				scope.removeSegment = function( segments, index ) {
					scope.segmentsToDelete.push( index );
					segments.splice( index, 1 );
				};

				scope.cancelChanges = function() {
					scope.decision = scope.originalDecision;
					// if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
					if (!scope.decision.yesDecisions.length ) {
						decisionTreeService.deleteDecision( scope.decision );
					}
					scope.closePanel();
				};

				scope.closePanel = function(){
					scope.closePanelUi();
					decisionTreeService.clearSelectedDecision();
				};



				function ContextualSiteKeywordsRule( data ) {
					this.exposure = data.exposure == 1 ? '' : '';
					this.type = scope.decision.type;
					this.name = data.name;
					this.logicalOperatorID = '';
				};

				/**
				 * creates the rules to pass to the create/update segment funciton
				 * @param segments
				 * @param description
				 * @returns {{rule: ThirdPartyRule, contextualRule: ContextualThirdPartyRule}}
				 */
				function createRules( sites, description ) {

					var contextualRule = new ContextualSiteKeywordsRule({
						exposure: 2,
						name: description
					});

					angular.forEach( sites, function( site ) {
						if ( !site.additionalKeywords ) {
							site.additionalKeywords = '';
						}

					});

					return {
						rule: sites,
						contextualRule: contextualRule
					};
				};

				scope.save = function() {

					// some validation
					scope.errorText = '';

					// name
					if ( !scope.name.text ) {
						scope.errorText += 'You have not selected a name. ';
					}

					// check for empty fields
					var emptySegment = false;
					angular.forEach( scope.segments, function( segment ) {
						angular.forEach( segment.sites, function( site ) {
							if ( site.site == '' || site.site == undefined || site.keywords == '' || site.keywords == undefined ) {
								emptySegment = true;
							}
						})
					});
					if ( emptySegment ) {
						scope.errorText += 'You have not finished filling out site or keyword information.';
					}

					// return without moving forward
					if ( scope.errorText ) {
						return false;
					}


					// copy the decisions first
					// we need to clear out the decisions so that we don't have any unncessary paths (for instance if we remove a rule)
					var scopeYesDecisions = angular.copy( scope.decision.yesDecisions );
					scope.decision.yesDecisions = [];

					// first let's delete the ones we need to (if they exist)
					angular.forEach( scope.segmentsToDelete, function( segment ) {
						if ( scopeYesDecisions[segment] ) {
							scopeYesDecisions.splice( segment, 1 );
						}
					});

					var audienceSegments = [];

					// create rules
					angular.forEach( scope.segments, function( segment ) {

						var description = '';

						angular.forEach( segment.sites, function( site, i ) {

							description += site.site + ': ' + site.keywords.replace(/,/g,' OR ').replace(/&/g, ' AND ');
							if ( site.additionalKeywords && site.additionalKeywords.length ) {
								description = '(' + description + ')' + ' and ' + site.additionalKeywords;
							}
							i == segment.sites.length - 1 ? null : description += ' OR ';

						});

						var siteRule = createRules( segment.sites, description );

						audienceSegments.push( siteRule );

					});

					angular.forEach( audienceSegments, function( audienceSegment, i ) {

						if ( scope.ruleType.id === 'yes-no' ) {

							if ( scopeYesDecisions.length ) {
								scope.decision.yesDecisions.push( scopeYesDecisions[0] );
								var taDecision = scope.decision.yesDecisions[0];
								decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, audienceSegment.rule , [ audienceSegment.contextualRule], null );
							}

							else {
								decisionTreeService.addAudienceSegment( scope.decision, audienceSegment.contextualRule.name, 'yes-decision', null, audienceSegment.rule, [ audienceSegment.contextualRule ], null );
							}

						}

						else{


							// see if we can update any of them
							if ( scopeYesDecisions.length ) {

								var updated = false;

								angular.forEach( scopeYesDecisions, function( decision, g ) {

									if ( g == i ) {
										scope.decision.yesDecisions.push( decision );
										var taDecision = scope.decision.yesDecisions[ scope.decision.yesDecisions.length - 1 ];

										decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, audienceSegment.rule , [ audienceSegment.contextualRule ], audienceSegment.contextualRule.name );
										updated = true;

									}

								});

							}

							// create a rule for each one that wasn't updated
							if ( !updated ) {
								decisionTreeService.addAudienceSegment( scope.decision, audienceSegment.contextualRule.name, 'yes-decision', null, audienceSegment.rule , [ audienceSegment.contextualRule ], audienceSegment.contextualRule.name );
							}

						}

					});

					/**
					 * ALWAYS CREATING A NO DECISION IF IT DOESN'T EXIST YET
					 */
					if ( scope.decision.noDecisions.length == 0 ) {
						var description;
						if( scope.decision.parentType ) {
							description = scope.decision.description;
						}
						else{
							description = 'Default'
						}
						decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
					}


					scope.decision.name = scope.name.text;
					scope.decision.data.ruleType = scope.ruleType.id;
					scope.decision.data.segments = scope.segments;

					// don't remove
					decisionTreeService.buildAudienceSegmentsFromDiagram();

					scope.closePanelUi();

				};

			}
		}

	}
]);




app.directive( 'externalAudiencePanel', [ 'csb', 'panelFactory', 'decisionTreeService', 'appService', 'advertisers', '$timeout',
    function( csb, panelFactory, decisionTreeService, appService, advertisers, $timeout ){

        return {
            restrict: 'A',
            replace: true,
            scope: {
                showPanel: '=',
                closePanelUi: '&',
                decision: '='
            },
            templateUrl: 'csbApp/app/views/ui/externalAudienceUI.html',
            link: function( scope, element, attrs ) {


                scope.csb = {};
                scope.csb.params = csb.params;

                // This will show the panel when the 'showPanel' value is changed
                // and the new value is equal to the panelFactory.diagramTypes.THIRD_PARTY_SEGMENT
                validatePanel(scope, panelFactory.diagramTypes.THIRD_PARTY_TARGETING, init);

                // This is called to initialize the form UI controls
                function init() {

                    // clearing out any errors
                    scope.errorText = '';

                    // the list of providers
                    scope.providers = [];

                    scope.ruleTypeOptions = [
                      {
                        'id' : 'yes-no',
                        'name': 'Yes-No'
                      },
                      {
                        'id': 'multi',
                        'name': 'Multiple Yes branches'
                      }
                    ];

                    // set the scope decision data is an object
                    scope.decision.data = scope.decision.data || {};

                    // get the original decision so we can revert later
                    scope.originalDecision = angular.copy(scope.decision);

                    // and select the name input when opening the panel
                    $timeout(function () {
                        element.find('input').first().focus().select();
                    });

                    scope.name = {};
                    scope.name.text = scope.decision.name;
                    scope.ruleType = {};
                    scope.ruleType.id = scope.decision.data.ruleType || 'yes-no';
					scope.provider = {};
                    scope.provider.value = scope.decision.data.provider || null;
                    scope.segments = scope.decision.data.segments || [ {} ];
                    scope.segmentsToDelete = [];

                    scope.loading = true;
                    scope.dmpAvailable = false;
                    advertisers.getAdvertisers({ accountId: csb.params.accountID, isAssociateDmp: true })
                        .then(function (response) {

                            // if we have an advertiser we will check if DMP is available
                            if ( csb.params.advertiserID ) {
                                angular.forEach(response, function (advertiser) {
                                    if (advertiser.id == csb.params.advertiserID) {
                                        scope.dmpAvailable = true;
                                    }
                                });
                            }

                            // if we don't have one we need to show all in the list to select
                            else {
                                scope.dmpAvailable = true;
                            }
                            // I moved the assignment here so that the advertisers dropdown could be populated always
                            scope.advertisers = response;

                            if (scope.advertiser.value.id) {
                              scope.updateProviderValues();
                            }

                            scope.loading = false;

                        },
                        function() {

                            scope.dmpAvailable = false;
                            scope.loading = false;

                        }
                    );

                  // when the tab loads we need to get the list of advertisers if one isn't selected yet
                  scope.advertiser = {};
				  scope.advertiser.value = {};
                  scope.advertiser.value.id = csb.params.advertiserID || null;

                };

                scope.updateProviderValues = function() {

                  if (scope.advertisers) {
                    var advertiser = _.find(scope.advertisers,function(item){return item.id == scope.advertiser.value.id });
                    if(advertiser){
                      scope.providers = advertiser.providers;
                    }

                  }
                };

                scope.changeRuleType = function() {
                    if ( scope.ruleType.id === 'yes-no' ) {
                        scope.segments = [ scope.segments[0] ];
                    }
                }

                scope.addSegment = function() {
                    scope.segments.push( {} );
                }

                scope.removeSegment = function( $index ) {
                    scope.segments.splice( $index, 1 );
                    scope.segmentsToDelete.push( $index );
                }



                // The Third party targeting model
                function ThirdPartyRule( data ) {
                    this.Provider = data.provider;
                    this.Segments = data.segments;
                    this.AdvertiserID = data.advertiserID;
                }

                function ContextualThirdPartyRule( data ) {
                    this.exposure = data.exposure == 1 ? '' : '';
                    this.type = scope.decision.type;
                    this.name = data.name;
                    this.logicalOperatorID = '';
                }

                /**
                 * creates the rules to pass to the create/update segment funciton
                 * @param segments
                 * @param description
                 * @returns {{rule: ThirdPartyRule, contextualRule: ContextualThirdPartyRule}}
                 */
                function createRules( segments, description ) {

                    var rule = new ThirdPartyRule({
                        provider: scope.provider.value.id,
                        segments: segments,
                        advertiserID: csb.params.advertiserID || scope.advertiser.id
                    });

                    var contextualRule = new ContextualThirdPartyRule({
                        exposure: 2,
                        name: description
                    });

                    return {
                        rule: rule,
                        contextualRule: contextualRule
                    };
                }

                /**
                 * The save function to create/update the audience segments
                 */
                scope.save = function() {

                    // handle some error validation first

                    scope.errorText = '';

                    if ( !scope.advertiser.value.id) {
                        scope.errorText += 'You have not selected an advertiser. ';
                    }
                    if ( !scope.segments ) {
                        scope.errorText += 'You have not selected any segments. ';
                    }
                    if ( !scope.name.text ) {
                        scope.errorText += 'You must enter a name. ';
                    }
                    if ( !scope.provider.value.id ) {
                        scope.errorText += 'You must select a provider. ';
                    }
                    angular.forEach( scope.segments, function( segment, i ) {
                        if ( !segment.string ) {
                            scope.errorText += 'Segment ' + (i + 1) + ' has not been filled out. ';
                        }
                    });
                    if ( scope.errorText ) {
                        return false;
                    }

//                    var segments = scope.segments.split(',');
                    var audienceSegments = [];
//                    scope.decision.yesDecisions = scope.decision.data.ruleType == scope.ruleType ? scope.decision.yesDecisions : [];

                    angular.forEach( scope.segments, function( segments ) {

                      var description = segments.string.replace(/,/g,' OR ').replace(/&/g, ' AND ');

                      description += ' (' + scope.provider.value.name + ')';

                      var rules = createRules( segments.string, description );
                      audienceSegments.push( rules );


                    });


                    /**
                     * Now add the audiece segments to the diagram
                     */

                    // copy the decisions first
                    // we need to clear out the decisions so that we don't have any unncessary paths (for instance if we remove a rule)
                    var scopeYesDecisions = angular.copy( scope.decision.yesDecisions );
                    scope.decision.yesDecisions = [];

                    // first let's delete the ones we need to (if they exist)
                    angular.forEach( scope.segmentsToDelete, function( segment ) {
                        if ( scopeYesDecisions[segment] ) {
                            scopeYesDecisions.splice( segment, 1 );
                        }
                    });

                    angular.forEach( audienceSegments, function( audienceSegment, i ) {

                        if ( scope.ruleType.id === 'yes-no' ) {

                            if ( scopeYesDecisions.length ) {
                                scope.decision.yesDecisions.push( scopeYesDecisions[0] );
                                var taDecision = scope.decision.yesDecisions[0];
                                decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, [ audienceSegment.rule ], [ audienceSegment.contextualRule], null );
                            }

                            else{
                                decisionTreeService.addAudienceSegment( scope.decision, audienceSegment.contextualRule.name, 'yes-decision', null, [ audienceSegment.rule ], [ audienceSegment.contextualRule ], null );
                            }

                        }

                        else{

                            // see if we can update any of them
                            if ( scopeYesDecisions.length ) {

                                var updated = false;

                                angular.forEach( scopeYesDecisions, function( decision, g ) {

                                    if ( g == i ) {
                                        scope.decision.yesDecisions.push( decision );
                                        var taDecision = scope.decision.yesDecisions[ scope.decision.yesDecisions.length - 1 ];

                                        decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, [ audienceSegment.rule ], [ audienceSegment.contextualRule ], audienceSegment.contextualRule.name );
                                        updated = true;

                                    }

                                });

                            }

                            // create a rule for each one that wasn't updated
                            if ( !updated ) {
                                decisionTreeService.addAudienceSegment( scope.decision, audienceSegment.contextualRule.name, 'yes-decision', null, [ audienceSegment.rule ], [ audienceSegment.contextualRule ], audienceSegment.contextualRule.name );
                            }

                        }

                    });

                    /**
                     * ALWAYS CREATING A NO DECISION IF IT DOESN'T EXIST YET
                     */
                    if ( scope.decision.yesDecisions.length > 0 && scope.decision.noDecisions.length == 0 ) {
                        var description;
                        if( scope.decision.parentType ) {
                            description = scope.decision.description;
                        }
                        else{
                            description = 'Default'
                        }
                        decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
                    }

                    // set the vars that have been saved
                    csb.params.advertiserID = scope.advertiser.value.id || csb.params.advertiserID;
					csb.params.advertiserName = scope.advertiser.value.name || csb.params.advertiserName;

                    scope.decision.name = scope.name.text;

                    scope.decision.data.ruleType = scope.ruleType.id;
                    scope.decision.data.provider = scope.provider.value;
                    scope.decision.data.segments = scope.segments;

                    // don't remove
                    decisionTreeService.buildAudienceSegmentsFromDiagram();

                    scope.closePanel();

                };

                scope.closePanel = function(){
                    scope.closePanelUi();
                    decisionTreeService.clearSelectedDecision();
                };

                scope.cancelChanges = function(){
                    scope.closePanel();
                    scope.model = angular.copy(scope.model);
					// if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
					if (!scope.decision.yesDecisions.length ) {
						decisionTreeService.deleteDecision( scope.decision );
					}
                };


            }
        }
    }
]);



app.directive( 'audienceSegmentPanel', [ 'panelFactory', 'decisionTreeService', '$timeout',
    function( panelFactory, decisionTreeService, $timeout ) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                decision: '=',
                showPanel: '=',
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/audienceSegmentUI.html',
            link: function( scope, element, attrs ) {

                // validate and init the panel
                validatePanel(scope, panelFactory.diagramTypes.AUDIENCE_SEGMENT, init);

                function init() {

                    scope.originalDecision = angular.copy( scope.decision );

                    // setting a var on scope so we don't edit decision directly
                    scope.segmentName = {};
                    scope.segmentName.text = angular.copy( scope.decision.name );
                    // and making another copy so we can reset it
                    scope.originalName = angular.copy( scope.decision.name );

                    // select the name input when opening the panel.. have to use timeout on this one
                    $timeout(function() {
                        element.find('input').first().focus().select();
                    });

                };// select the name input when opening the panel


                scope.save = function() {
                    // set the var as the decision name and limit to 90 (also have maxlength on the html input)
                    scope.decision.name = scope.segmentName.text.substring(0,90);

                    // we are going to set a flag for whether it has a custom name so we know whether to update it or not
                    if ( scope.segmentName.text != scope.originalName ) {
                        scope.decision.customName = true;
                    }

                    // don't remove
                    decisionTreeService.buildAudienceSegmentsFromDiagram();
                    scope.closePanelUi();
                }

                scope.cancel = function() {
                    // reset the decision name back to the original
                    scope.decision.name = scope.originalName;

                    scope.closePanelUi();
                }

            }
        }

    }
]);





/**
 * NEED TO UPDATE THESE DIRECTIVES TO USE THE NEW CODE
 */

app.directive( 'dynamicRetargetingPanel', [ 'GraphFactory',
    function( GraphFactory ) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/dynamicRetargetingUI.html',
            link: function( scope, element, attrs ) {

                // handle iteractions with the dom and model here
                // in a completely isolated scope.. no worrying about conflicting issues

                scope.showUI = false;

                WatcherUtils.watchFactoryChange(scope, GraphFactory, 'currentSelectedItem', function(){

                    if(GraphFactory.currentSelectedItem != null)
                        scope.showUI = GraphFactory.currentSelectedItem.type == GraphFactory.diagramTypes.DYNAMIC_RETARGETING;

                });

            }
        }

    }
]);






app.directive( 'contextualTargetingPanel', [ 'panelFactory', 'decisionTreeService', '$timeout', 'categories',
    function( panelFactory, decisionTreeService, $timeout, categories ) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                decision: '=',
                showPanel: '=',
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/contextualTargetingUI.html',
            link: function( scope, element, attrs ) {

                validatePanel(scope, panelFactory.diagramTypes.CONTEXTUAL_TARGETING, init);

                function init() {

                    // display the spinner instead of the UI
                    scope.loading = true;

                    // clearing out any errors
                    scope.errorText = '';

                    // options to be displayed in the dropdown
                    scope.ruleTypeOptions = [
                        {
                            'id' : 'yes-no',
                            'name': 'Yes-No'
                        },
                        {
                            'id': 'multi',
                            'name': 'Multiple Yes branches'
                        }
                    ];

                    // initializing the decision object to be saved
                    scope.decision.data = scope.decision.data || {};

                    // and select the name input when opening the panel
                    $timeout(function () {
                        element.find('input').first().focus().select();
                    });

                    // decision name mmText
                    scope.name = {};
                    scope.name.text = scope.decision.name;

                    // rule type (yes-no | multiple yes branches) mmDropDown
                    scope.ruleType = {};
                    scope.ruleType.id = scope.decision.data.ruleType || 'yes-no';

                    // categories mmDropDown
                    scope.categories = [];
                    categories
                        .getCategories()
                        .then(function( response ){
                            //console.log(response);
                            // TODO: remove loop when keys have the 'id', 'name' convention from the API
                            angular.forEach(response, function(category){
                                scope.categories.push({id: category.categoryItemID, name: category.categoryItemName});
                            });
                        });

                    scope.category = {};
                    scope.category.value = {};
                    scope.category.value.id = scope.decision.data.category || null;

                    //console.log('decision', scope.decision.data );

                    // subcategories filtered-select
                    scope.subCategories = scope.decision.data.categories || []; // list-to-chose-from
                    scope.selectedSubCategories = scope.decision.data.selectedSubCategories || []; // list-chosen

                    // now the UI is ready to be displayed
                    scope.loading = false;

                }; // init()

                /**
                 * This method is called when a category is selected.
                 * @param categoryID ID to be used when calling the API to retreive subcategories.
                 */
                scope.loadSubCategories = function (categoryID) {
                    categories
                        .getSubCategories({categoryId: categoryID})
                        .then(function( response ) {
                            //console.log(response);
                            // NOTE: it currently uses 'categoryItemID' and 'categoryItemName' as the keys
                            scope.subCategories = response;
                        });
                };

                // The Contextual TA model for creating Contextual Targeting rules
                function ContextualTargetingRule( data ){
                    this.subCategoryId = data.subCategoryId;
                    this.subCategoryName = data.subCategoryName;
                };

                // metadata for the TA
                function ContextualContextualTargetingRule( data ){
                    this.type = scope.decision.type;
                    this.name = data.name;
                    this.logicalOperatorID = 'OR';
                    this.exposure = 'Exposed to';

                };

                scope.save = function() {

                    var rules = [];

                    function pushToRules( rule, name, label) {
                        var contextualRule = new ContextualContextualTargetingRule({
                            name: name
                        });

                        rules.push({
                            description: name,
                            targetingRule: rule,
                            label: label,
                            contextualTargetingRule: contextualRule
                        });

                    };

                    if ( scope.selectedSubCategories.length ) {
                        angular.forEach(scope.selectedSubCategories, function(subCategory) {

                            var rule = new ContextualTargetingRule({
                                    subCategoryId: subCategory.categoryItemID,
                                    subCategoryName: subCategory.categoryItemName
                            }),
                                name = subCategory.categoryItemName,
                                description = subCategory.categoryItemName;

                            pushToRules(rule, name, description);

                        });

                        scope.decision.data.selectedSubCategories = scope.selectedSubCategories;
                    }

                    //console.log('rules',rules );

                    scope.errorText = '';

                    // now we can do some validation
                    if ( !scope.category.value.id ) {
                        scope.errorText += 'You must select a category. ';
                    }
                    if ( !rules.length ) {
                        scope.errorText += 'You have not selected any subcategories. ';
                    }
                    if ( !scope.name.text ) {
                        scope.errorText += 'You must enter a name. ';
                    }
                    if ( scope.errorText ) {
                        return false;
                    }

                    // validation passed, we can assign values to our decision
                    scope.decision.data.ruleType = scope.ruleType.id;
                    scope.decision.name = scope.name.text;
                    scope.decision.data.category = scope.category.value.id;


                    // copy the decisions first
                    // we need to clear out the decisions so that we don't have any unncessary paths (for instance if we remove a rule)
                    var scopeYesDecisions = angular.copy( scope.decision.yesDecisions );
                    scope.decision.yesDecisions = [];

                   /**
                    * SAVE FOR YES-NO DECISIONS
                    * if the decision is yes-no, we will combine all data into one TA
                    */
                    if (scope.ruleType.id === 'yes-no') {

                        var taDescription = '',
                            taRules = [],
                            taData = [];

                        angular.forEach( rules, function(rule, i) {
                            // create the description by stringing together the descriptions
                            taDescription += rule.description + ( i < rules.length - 1 ? ' - ': '');

                            // push the rules
                            taRules.push( rule.targetingRule);

                            // push the contextual data
                            taData.push( rule.contextualTargetingRule );
                        });


                        // now create the object that we can pass to the addGeoAudienceSegment function
                        var decisionData = {
                            description: taDescription,
                            decisionType: 'yes-decision',
                            targetAudienceData: taData,
                            rules: taRules
                        };

                        // we will update it if yes decisions already exist
                        if (scopeYesDecisions && scopeYesDecisions.length == 1 ) {
                            scope.decision.yesDecisions.push( scopeYesDecisions[0] );
                            var taDecision = scope.decision.yesDecisions[0];
                            decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, decisionData.rules, decisionData.targetAudienceData );
                        }
                        // otherwise we are going to create a new TA
                        else {
                            // and finally create the audience segment
                            decisionTreeService.addGeoAudienceSegment( scope.decision, decisionData );

                        }


                    }
                    /**
                     * SAVE FOR MULTIPLE CHOICE DECSISION
                     * we will create a target audience for each possible rule
                     */
                    else {

                        angular.forEach( rules, function( rule ) {

                            // now create the object that we can pass to the addGeoAudienceSegment function
                            var decisionData = {
                                description: rule.description,
                                decisionType: 'yes-decision',
                                targetAudienceData: [ rule.contextualTargetingRule ],
                                rules: [ rule.targetingRule ],
                                label: rule.label
                            };

                            var updated = false;

                            // see if we can update any of them
                            if ( scopeYesDecisions.length ) {
                                angular.forEach( scopeYesDecisions, function( decision, i ) {
                                    if ( angular.equals( decision.rules, [ decisionData.rules ] ) ) {
                                        scope.decision.yesDecisions.push( decision );
                                        var taDecision = scope.decision.yesDecisions[ scope.decision.yesDecisions.length - 1];
                                        decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, decisionData.rules, decisionData.targetAudienceData, decisionData.label );
                                        updated = true;
                                    }
                                });
                            }

                            // create a rule for each one that wasn't updated
                            if ( !updated ) {
                                decisionTreeService.addGeoAudienceSegment(scope.decision, decisionData, decisionData.label, true);
                            }


                        }); //forEach(rules)

                    } // else

                    /**
                     * ALWAYS CREATING A NO DECISION IF IT DOESN'T EXIST YET
                     */
                    if ( scope.decision.noDecisions.length == 0 ) {
                        var description;
                        if( scope.decision.parentType ) {
                            description = scope.decision.description;
                        }
                        else{
                            description = 'Default'
                        }
                        decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
                    }

                    // don't remove
                    decisionTreeService.buildAudienceSegmentsFromDiagram();

                    scope.closePanel();

                }; // save()

                scope.closePanel = function(){
                    scope.closePanelUi();
                    decisionTreeService.clearSelectedDecision();
                };

                scope.cancelChanges = function(){
                    scope.closePanel();
                    scope.model = angular.copy(scope.model);
                    // if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
                    if (!scope.decision.yesDecisions.length ) {
                        decisionTreeService.deleteDecision( scope.decision );
                    }
                }

            } // link:
        } // return
    } // function()
]);

app.directive( 'notePanel', [ 'panelFactory', '$timeout', 'textAngularManager',
    function( panelFactory, $timeout, textAngularManager ) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                showPanel: '=',
                selectedNote: '=',
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/addNoteUI.html',
            link: function( scope, element, attrs ) {

                /**
                    TextAngular: This is going to aid to select the text inside the textArea whenever the panel is open
                    https://github.com/fraywing/textAngular/issues/453#issuecomment-66935547
                 */
                function createCaretPlacer(atStart) {
                    return function(el) {
                        el.focus();
                        if (typeof window.getSelection != "undefined"
                            && typeof document.createRange != "undefined") {
                            var range = document.createRange();
                            range.selectNodeContents(el);
                            var sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(range);
                        } else if (typeof document.body.createTextRange != "undefined") {
                            var textRange = document.body.createTextRange();
                            textRange.moveToElementText(el);
                            textRange.select();
                        }
                    };
                }

                var placeCaretAtStart = createCaretPlacer(true);
                var placeCaretAtEnd = createCaretPlacer(false);


                // handle interactions with the dom and model here
                // in a completely isolated scope.. no worrying about conflicting issues
                validatePanel(scope, panelFactory.diagramTypes.SKETCHING_TOOLS_NOTE, init);

                function init(){

                    scope.setArrowDirection(scope.selectedNote.arrow);

                    var editorScope = textAngularManager.retrieveEditor('noteEditor').scope;

                    scope.noteLabel = angular.copy(scope.selectedNote.label);

                    scope.noteArrow = angular.copy(scope.selectedNote.arrow);

                    scope.originalLabel = angular.copy(scope.selectedNote.label);

                    scope.originalArrow = angular.copy(scope.selectedNote.arrow);

                     // select the name input when opening the panel.. have to use timeout on this one
                    $timeout(function() {

                        var innerTaTextElementId = editorScope.displayElements.text[0].id;

                        // TODO: this is a hack, since textAngular was not updating it's text, this needs to be addressed
                        $('#'+innerTaTextElementId).html(scope.noteLabel);

//                        console.log(editorScope.displayElements.text);
//                        console.log(document.getElementById(innerTaTextElementId));

                        // editorScope.displayElements.text.trigger('focus');
                        placeCaretAtEnd( document.getElementById(innerTaTextElementId));

                        // the following line seems not to be doing any difference
                        // textAngularManager.refreshEditor('noteEditor');
                    });

                };

                scope.setArrowDirection = function(direction) {
                  scope.selectedNote.arrow = direction;
                }

                scope.closePanel = function(){

                    scope.selectedNote = null;
                    // hide panel
                    scope.closePanelUi();
                };


                scope.cancelChanges = function(){
                    scope.selectedNote.label = scope.originalLabel;
                    scope.selectedNote.arrow = scope.originalArrow;
                    scope.closePanel();
                };

                scope.save = function(){
                  scope.closePanel();
                };
            }
        }

    }
]);

app.directive( 'textBoxPanel', [ 'panelFactory', '$timeout', 'textAngularManager',
    function( panelFactory, $timeout, textAngularManager ) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                showPanel: '=',
                selectedTextBox: '=',
                closePanelUi: '&'
            },
            templateUrl: 'csbApp/app/views/ui/addTextBoxUI.html',
            link: function( scope, element, attrs ) {

                /**
                    TextAngular: This is going to aid to select the text inside the textArea whenever the panel is open
                    https://github.com/fraywing/textAngular/issues/453#issuecomment-66935547
                 */
                function createCaretPlacer(atStart) {
                    return function(el) {
                        el.focus();
                        if (typeof window.getSelection != "undefined"
                            && typeof document.createRange != "undefined") {
                            var range = document.createRange();
                            range.selectNodeContents(el);
                            var sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(range);
                        } else if (typeof document.body.createTextRange != "undefined") {
                            var textRange = document.body.createTextRange();
                            textRange.moveToElementText(el);
                            textRange.select();
                        }
                    };
                }

                var placeCaretAtStart = createCaretPlacer(true);
                var placeCaretAtEnd = createCaretPlacer(false);

                // handle interactions with the dom and model here
                // in a completely isolated scope.. no worrying about conflicting issues

                validatePanel(scope, panelFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX, init);

                /*
                 * This method will toggle the border around the textbox
                 */
                scope.toggleBorder = function() {

                // toggling the border
                scope.selectedTextBox.showBorder = !scope.selectedTextBox.showBorder;

                // switching the text on the button's label
                scope.borderLabel = scope.selectedTextBox.showBorder ? 'Hide Border' : 'Show Border';

              };

              function init() {

                    // default values for the border variables
                    if (typeof scope.selectedTextBox.showBorder === 'undefined') {
                      scope.selectedTextBox.showBorder = true;
                      scope.borderLabel = 'Hide Border';
                    } else {
                      scope.borderLabel = scope.selectedTextBox.showBorder ? 'Hide Border' : 'Show Border';
                    }

                    var editorScope = textAngularManager.retrieveEditor('defaultEditor').scope;

                    scope.textBoxLabel = angular.copy(scope.selectedTextBox.label);

                    scope.originalLabel = angular.copy(scope.selectedTextBox.label);

                     // select the name input when opening the panel.. have to use timeout on this one
                    $timeout(function() {

                       var innerTaTextElementId = editorScope.displayElements.text[0].id;
                        placeCaretAtEnd( document.getElementById(innerTaTextElementId));
                    });

                };

                scope.closePanel = function(){

                    scope.selectedTextBox = null;

                    // hide panel
                    scope.closePanelUi();
                };


                scope.cancelChanges = function(){
                    scope.selectedTextBox.label = scope.originalLabel;
                    scope.closePanel();
                };

                scope.save = function(){
                  scope.closePanel();
                };
            }
        }

    }
]);
