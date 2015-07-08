function ContextualTargetAudienceRule( data ){
    this.exposure = data.exposure == 1 ? 'Exposed to' : 'Not Exposed to';
    this.type = data.type;
    this.name = data.name;
    this.logicalOperatorID = data.logicalOperatorID == 1 ? 'AND' : 'OR';
};

function Decision(data){
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.yesDecisions = data.yesDecisions || [];
    this.noDecisions = data.noDecisions || [];
    this.rules = data.rules || [];
    this.parentType = data.parentType;
    this.decisionType = data.decisionType == undefined ? '' : data.decisionType;
    this.targetAudienceContextualData = data.targetAudienceContextualData;
    this.geoType = data.geoType || null;
    this.targetAudienceID = data.targetAudienceID || null;
    this.label = data.label || null;
};

function RetargetingRule(data){
    var self = this;
    self.RetargetingID = data.RetargetingID;                            // default is NULL
    self.AdvertiserID = data.AdvertiserID;                              // The selected Advertiser id
    self.TargetingTagID = data.TargetingTagID;                          // The Tag ID
    self.TargetingTagValues = data.TargetingTagValues;                // The custom value ID?
    self.TargetingLogicalOperatorID = data.TargetingLogicalOperatorID;  // AND = 1, OR = 2
    self.TargetingViewerID = data.TargetingViewerID;                    // Expose to = 1, Not Exposed to = 2
    self.TargetAudienceID = data.TargetAudienceID;                      // default is NULL
    self.OrderID = data.OrderID;                                        // The order priority?
    self.RetargetingTagWindow = data.RetargetingTagWindow;              // The number of days the cookie is valid for
};

app.factory( 'decisionTreeService', [ '$http', '$q', 'csb', 'segmentsFactory', '$timeout',
    function( $http, $q, csb, segmentsFactory, $timeout ) {

        var pub = {};

        // mock model
        pub.decisions = [];

		// will be used to track changes made by the user in the UI
        pub.original = [];

        // current selected decision
        pub.selectedDecision = null;

        pub.addDecision = function(currentDecision, data){

            switch(data.decisionType){
                case "no-decision":
                    pub.addNoDecision(currentDecision, data);
                    break;

                default:
                    pub.addYesDecision(currentDecision, data);
            }
        };

        pub.updateDecision = function(currentDecision, data){

            if(currentDecision && data) {
//                currentDecision.name = data.name;
                currentDecision.description = data.description;
                currentDecision.rules = data.rules;
                currentDecision.label = data.label;
                currentDecision.targetAudienceContextualData = data.targetAudienceContextualData;
            }
        };

        /**
         * This method adds a yes-decision to the current decision that is passed in
         *
         * @param currentDecision
         * @param data
         */
        pub.addYesDecision = function(currentDecision, data){

            data.decisionType = 'yes-decision';
            var decision = new Decision(data);
            currentDecision.yesDecisions.push(decision);
        };

        pub.addNoDecision = function(currentDecision, data){
            data.decisionType = 'no-decision';
            var decision = new Decision(data);
            currentDecision.noDecisions.push(decision);
        };

        // delete the current decision and change it back to a Target Audience segment
        pub.deleteDecision = function(decision){

            if ( decision.type != 'Audience Segment') {

                // first we need to traverse down the no branches to see if we find a TA ID
                // We will later assign the ID to this decision so that it will update (the no branch siblings will match this rule).
                var targetAudienceNoPath = getTargetAudienceIDandNameFromNoSiblings( decision );

                decision.yesDecisions = [];
                decision.noDecisions = [];
                decision.type = 'Audience Segment';
                delete decision.data;
                delete decision.geoType;
                delete decision.icon;

                if ( pub.decisions[0].yesDecisions.length == 0 ) {
                    pub.decisions = [];
                }

                // setting the TA ID if found in the no path
                if ( targetAudienceNoPath.targetAudienceID ) {
                    decision.targetAudienceID = targetAudienceNoPath.targetAudienceID;
                }

                // if a custom name has been set on the no path we will bring it's name and custom name flag as well
                if ( targetAudienceNoPath.customName ) {
                    decision.name = targetAudienceNoPath.targetAudienceName;
                    decision.customName = targetAudienceNoPath.customName;
                }

                // and also setting the name from the no path
//                decision.name = targetAudienceNoPath.targetAudienceName;
                pub.buildAudienceSegmentsFromDiagram( csb.params.campaignId );

            }

            function getTargetAudienceIDandNameFromNoSiblings( decision ) {

                var targetAudienceID,
                    targetAudienceName,
                    customName;

                var traverseNoDecisions = function( decisions ) {

                    decisions.forEach( function( decision ){

                        if ( decision.noDecisions.length ) {
                            traverseNoDecisions( decision.noDecisions );
                        }

                        if (decision.type == 'Audience Segment' ) {
                            if ( decision.targetAudienceID ) {
                                targetAudienceID = decision.targetAudienceID;
                            }
                            targetAudienceName = decision.name;
                            customName = decision.customName;
                        }

                    });

                }

                if ( decision.noDecisions ) {
                    traverseNoDecisions( decision.noDecisions );
                }

                return {
                    targetAudienceID: targetAudienceID,
                    targetAudienceName: targetAudienceName,
                    customName: customName
                };

            };

        };

        pub.removeAllChildDecisions = function(decision){
            decision.yesDecisions = [];
            decision.noDecisions = [];
        }

        // set the current selected decision
        pub.setSelectedDecision = function(decision){
            pub.selectedDecision = decision;
        };

        // clear the current selected decision
        pub.clearSelectedDecision = function(){
            pub.selectedDecision = null;
        };

        pub.addGeoAudienceSegment = function(currentDecision, data, label, multi ){

            // chaining the rules together
            if ( currentDecision.parentType ) {
                if ( currentDecision.description != 'Default' ) {
                    if ( multi ) {
                        data.description = currentDecision.description + ' ' + currentDecision.name + ' = ' + data.description
                    }
                    else{
                        data.description = currentDecision.description + ' ' + currentDecision.name
                    }

                }
            }

            var decisionData = {
                name: data.description.substring(0, 90),
//                description: data.description,
//                description: currentDecision.name + multi ? '=' + data.description : '',
                description: data.description,
                type:'Audience Segment',
                parentType: currentDecision.type,
                decisionType: data.decisionType,
                targetAudienceContextualData: data.targetAudienceData,
                rules: [],
                label: label
            };

            if(data.rules){
                decisionData.rules.push(data.rules);
            }

            pub.addDecision(currentDecision, decisionData);

        };

        /**
         * This method creates an Audience segment for the current decision
         *
         * @param currentDecision
         * @param description
         * @param decisionType
         * TODO: figure out where targetAudience is coming from and remove
         */
        pub.addAudienceSegment = function( currentDecision, description, decisionType, targetAudience, rules, targetAudienceData, label ){

            var data = {
                name: description.substring(0,90),
                description: description,
                type: 'Audience Segment',
                parentType: currentDecision.type,
                decisionType: decisionType,
                targetAudienceContextualData: targetAudienceData,
                label: label
            };

            // if the parent has a TA ID (meaning it was an audience segment we dropped the decision on and are now saving), then we need to pass
            // that TA ID to the no branch
            if ( currentDecision.targetAudienceID && decisionType == 'no-decision' ) {
                data.targetAudienceID = currentDecision.targetAudienceID;
            }

            if ( rules ) {
                data.rules = [];
                data.rules.push( rules );
            }
            // IMPORTANT: Must pass a rules array for the TA view data to be generated
            else{
                data.rules = [];
            }

            pub.addDecision(currentDecision, data);

        };

        /**
         * This method updates the existing Audience segment for the current decision
         *
         * @param targetAudienceDecision
         * @param description
         * @param decisionType
         * @param rules
         * @param targetAudienceData
         */
        pub.updateAudienceSegment = function( targetAudienceDecision, name, description, retargetingRules, targetAudienceData, label ){
            // Need to update the decision object or this will convert it to an audience segment
            //
            //    1. Don't change the current decisionType value
            //    2. Don't update type

            var data = {
//                name: name.substring(0,100),
                description: description,
                targetAudienceContextualData: targetAudienceData,
                label: label
            };

            if ( retargetingRules ) {
                data.rules = [];
                data.rules.push( retargetingRules );
            }
            else{
                data.rules = [];
            }

            pub.updateDecision(targetAudienceDecision, data);
        };

        pub.createRule = function(rule, decision, logicalOperator, retargetingID, targetAudienceID, orderID){
            var data = {};
            data.RetargetingID = retargetingID || null;                  // default is NULL
            data.AdvertiserID = csb.params.advertiserID;                   // The selected Advertiser id
            data.TargetingTagID = rule.details.id;                                      // The Tag ID
            data.TargetingTagValues = rule.selectedTagValues ? rule.selectedTagValues : null;                // The custom value ID?
            data.TargetingLogicalOperatorID = logicalOperator.id || 1;    // AND = 1, OR = 2, Default is 1?
            data.TargetingViewerID = rule.exposure.id;                                 // Expose to = 1, Not Exposed to = 2
            data.TargetAudienceID = targetAudienceID || null;         // default is NULL
            data.OrderID = orderID == null ? 0 : orderID;                               // The order priority?
            data.RetargetingTagWindow = decision.data.selectedDay ?  decision.data.selectedDay : -1;  // The number of days the cookie is valid for

            var targetingRule = new RetargetingRule(data);
            return targetingRule;
        };

        pub.createContextualRule = function(rule, decision, logicalOperator){
            var tarule = {};
            tarule.exposure = rule.exposure.id;
            tarule.type = decision.type;
            tarule.name = rule.details.name;
            tarule.logicalOperatorID = logicalOperator.id;

            if ( rule.selectedTagValues.length ) {
				var tagValueArray = [];
				angular.forEach( rule.selectedTagValues, function( rule ) {
					tagValueArray.push( rule.name );
				});
                tarule.name += ' (' + tagValueArray.join(', ') + ')';
            }

            var targetAudienceRule = new ContextualTargetAudienceRule(tarule);
            return targetAudienceRule;

        };

        pub.createTargetAudienceData = function(decisionType, description, retargetingRules, targetAudienceData){
            var taDecision = {};
            taDecision.decisionType = decisionType;
            taDecision.name = description;
            taDecision.description = description;
            taDecision.retargetingRules = retargetingRules;
            taDecision.targetAudienceData = targetAudienceData;

            return taDecision;
        };



		pub.removeAdvertiserIfNeeded = function() {

			var advertiserDecisionFound = false;

			removeAdvertiserIfNeeded( pub.decisions );

			function removeAdvertiserIfNeeded( decisions ) {

				angular.forEach( decisions, function( decision ) {

					if ( decision.type == 'Static Retargeting' || decision.type == 'Audience Manager' ) {
						advertiserDecisionFound = true;
					}

					if ( decision.yesDecisions.length ) {
						removeAdvertiserIfNeeded( decision.yesDecisions );
					}

					if ( decision.noDecisions.length ) {
						removeAdvertiserIfNeeded( decision.noDecisions );
					}

				});

				if ( advertiserDecisionFound == false ) {
					csb.params.advertiserID = null;
					csb.params.advertiserName = null;
				}

			};


		};





        /**
         * Builds the Target Audience Object that we actually send to the server
         * @returns {{TargetAudienceInfoList: Array}}
         */
        pub.buildTargetAudienceObjectToSave = function( campaignId, currentTas ) {

            var segmentArray = pub.audienceSegmentArray;
            var error = '';
            var sameNameError = false;

            //create the save object
             var saveObject = [];

            //create the update object
            var updateObject = [];

            build( segmentArray.new, saveObject );
            build( segmentArray.existing, updateObject );

            function build( segments, object ) {

                // first we are going to loop over each array which will equal one segment
                for ( var i = 0; i < segments.length; i++ ) {

                    var segmentRules = segments[i].rules;

					var targetAudience = {
						type: 'TargetAudience',
						id: segments[i].targetAudienceID ? segments[i].targetAudienceID : undefined,
						accountId: csb.params.accountID,
						name: segments[i].name,
						targetingItems: [],
						campaignId: campaignId || csb.params.campaignID
					}

					// objects to hold the targeting data
					var geo = { __type: 'GeoTargetingInfoV2:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.Geo', type: 'GeoTargeting' },
						retargeting = { __type: 'RetargetingInfoV2:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.ReTargeting', type: 'Retargeting', advertiserId: csb.params.advertiserID, retargetingViewers: [] },
						thirdParty = { __type: 'ThirdPartyTargetingInfo:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.Dmp', type: '3rdPartyTargeting', advertiserId: csb.params.advertiserID },
						contextual = { __type: 'ContextualTargetingInfoV2:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.ContextualTargeting', type: 'Contextual', subCategoriesIds:[] },
						siteKeywords = { __type: 'SiteKeywordTargeting:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.KeyWordTargeting', type: 'SiteKeywordTargeting', siteKeywords: [] };

					var includeGeo = false,
						includeRetargeting = false,
						includeThirdParty = false,
						includeContextual = false,
						includeSiteKeywords = false;

					// loop over each of the segments rules so we can manipulate them and put them where they need to be
					angular.forEach( segmentRules, function( segmentRule ) {

                        if ( segmentRule.type == 'Contextual Targeting' ) {

                            angular.forEach(segmentRule.rules, function (rule) {

                                if (rule.subCategoryId) {
                                    contextual.subCategoriesIds.push(rule.subCategoryId);
                                }
                            });

                            includeContextual = true;
                        }

						// combine all the rules for GEO into one
						// the loop is a little ugly but it checks if the property exists and if not sets it to an empty array
						// and then pushes the rule into the array
						if ( segmentRule.type == 'Geo Targeting' ) {

							angular.forEach( segmentRule.rules, function ( rule ) {
								for( var property in rule ) {
									if ( rule[ property ] ) {
										if ( !geo[ property ] ) {
											geo[ property ] = [];
										}
										geo[ property ].push( rule[ property ] );
									}
									else{
										rule[ property ] = null;
									}
								}
							});

							includeGeo = true;

						}

						// do some translation of the static retargeting rules
						// also does some validation on checking how many rules are in the segment
						if ( segmentRule.type == 'Static Retargeting' ) {

							angular.forEach( segmentRule.rules, function( rule ) {

								var tagValues = [];
								if ( rule.TargetingTagValues ) {
									angular.forEach( rule.TargetingTagValues, function( tag, i ) {
										tagValues.push(tag.id);
									});
								}

								retargeting.retargetingViewers.push({
									type: "RetargetingViewer",
									tagId: rule.TargetingTagID,
									values: tagValues,
									viewerExpose: rule.TargetingViewerID == 1 ? "Exposed to" : "Not Exposed to",
									logicalOperator: rule.TargetingLogicalOperatorID == 1 ? "AND" : "OR"
								});

								retargeting.cookieAge = rule.RetargetingTagWindow;

							});

							if ( retargeting.retargetingViewers.length > 15 ) {
								error += ' You have more than 15 retargeting rules. Please limit to 15 or less.'
							}

							includeRetargeting = true;

						}

						// create the rule for the audience manager
						// we only allow there to be one 3rd party segment so if the data is already set
						// we will throw an error that there are too many third party segments (probably needs a more elegant solution)
						if ( segmentRule.type == 'Audience Manager' ) {

							if ( thirdParty.segmentRule ) {
								error += ' You have more than one third party targeting rule in a segment path. You may only have one.';
							}

							angular.forEach( segmentRule.rules, function( rule ) {
								thirdParty.dataProviderId = rule.Provider;
								thirdParty.segmentRule = rule.Segments;
							});

							includeThirdParty = true;

						}


						if ( segmentRule.type == 'Site Keywords' ) {

							siteKeywords.siteKeywords = segmentRule.rules;
							includeSiteKeywords = true;

						}


					});

                    includeContextual ? targetAudience.targetingItems.push(contextual) : null;
					includeGeo ? targetAudience.targetingItems.push( geo ) : null;
					includeThirdParty ? targetAudience.targetingItems.push( thirdParty ) : null;
					includeRetargeting ? targetAudience.targetingItems.push( retargeting ) : null;
					includeSiteKeywords ? targetAudience.targetingItems.push( siteKeywords ) : null;

                    // going to check if any have the same name as eachother so we can show an error message
                    // using a flag for sameNameError so we can show the error only once. Also check if the index of initial loop(variable 'i') isn't the
                    // same as the index of the second loop(variable 'index') because we don't want to check it against itself :)
                    angular.forEach( segments, function( segment, index ) {
                        if ( i != index && segments[i].name == segment.name && sameNameError == false ) {
                            error += ' Multiple segments have the same name. Please fix before trying to save.';
                            sameNameError = true;
                        }
                    });

					// push the segment model to the target audience info list so we have a complete object to send off to save
					if ( segmentRules.length ) {
						object.push( targetAudience );
					}


				}
            }


			/**
			 * This gets the TA's that need to be deleted because they aren't associated with the diagram anymore
			 * @type {Array}
			 */
			var deleteArray = [];

			if ( segmentArray.existing.length ) {

				for ( var g = 0; g < currentTas.length; g++ ) {

					var oldTA = currentTas[g];
					var foundMatch = false;

					for (var i = 0; i < segmentArray.existing.length; i++) {
						var newTA = segmentArray.existing[i];

						if (oldTA.TargetAudienceID == newTA.targetAudienceID) {
							foundMatch = true;
						}
					}

					if( foundMatch == false ) {
						// it wasnt matched in our TAs so it must be an old one that needs to be unnatched from its DG
						deleteArray.push( oldTA );
					}
				};

			}

            return {
                save: saveObject,
                update: updateObject,
				delete: deleteArray,
                error: error
            };

        }


        /**
         * This function loops over all decisions and finds the endpoints (which are target audiences) and does 2 things
         * 1. It gets all the rules assoicated with that target audience so we can send that object to the server
         * 2. It gets the decision names along the path to create the segment name ( unless the custom name flag is true )
         * @param campaignID is OPTIONAL and will append the TA name with '_campaignID' ( example: targetaudiencename -> targetaudiencename_12904 )
         * @returns {{new: Array, existing: Array}}
         */
        pub.buildAudienceSegmentsFromDiagram = function( campaignID ) {

            var targetAudiences = {
                new: [],
                existing: [],
				error: ''
            }

            if ( pub.decisions.length ) {
                getDecisionsByRecursion( pub.decisions );
            }

            function getDecisionsByRecursion( decisions, passedRules, passedName, onlyNo ) {

                decisions.forEach( function( decision ) {

                    // going to be null for the first and possibly second loop
                    var rules = passedRules || [];

                    // build the name as we go so start with an empty string
                    var name = passedName || '';

                    // slice it to get by value instead of reference
                    rules = rules.slice();

                    // check if there any rules
                    if ( decision.rules ) {

                        decision.allRules = null;

                        // if there are rules, push them into the rules array
                        decision.rules.forEach( function( rule ) {

                            // create a new rule instead of using rule above so we can stick it into an object ( ruleCopy.rules )
                            var ruleCopy = {};
                            ruleCopy.rules = rule;
                            ruleCopy.type = decision.parentType;
                            ruleCopy.tarules = decision.targetAudienceContextualData;

                            rules.push( ruleCopy );

                        });
                    }

                    // now check if there are any nodes(decisions) to loop over
                    if ( decision.yesDecisions.length > 0 && decision.type != 'Audience Segment' ) {
                        // cleaning up from previous times building TAs.. I want to strip out "allRules" so they are only on the very last node
                        decision.targetAudienceID = null;
                        if ( decision.allRules ) {
                            delete decision.allRules;
                        }
                        // cleaning up the customName flag as well
                        if ( decision.customName ) {
                            delete decision.customName;
                        }

                        // assign the name var so we don't change the original
                        var yesPathName = name;

                        // add the label if we have it
                        if ( decision.label ) {
                            yesPathName = yesPathName + ' = ' + decision.label;
                        }

                        // then add the name.. use the & if it's not the first decision
                        yesPathName == '' ? yesPathName += decision.name : yesPathName += ' & ' + decision.name;

                        // loop over them again, passing in the rules array that was used to build rules
                        getDecisionsByRecursion( decision.yesDecisions, rules.slice(), yesPathName );
                    }
                    if ( decision.noDecisions.length > 0 && decision.type != 'Audience Segment' ) {
                        // cleaning up from previous times building TAs.. I want to strip out "allRules" so they are only on the very last node
                        decision.targetAudienceID = null;
                        if ( decision.allRules ) {
                            delete decision.allRules;
                        }
                        // cleaning up the customName flag as well
                        if ( decision.customName ) {
                            delete decision.customName;
                        }

                        // assign the name var so we don't change the original
                        var noPathName = name;

                        // add the label if we have it
                        if ( decision.label ) {
                            noPathName = noPathName + ' = ' + decision.label;
                        }

                        // then add the name with 'No_' prepended (since we didn't match it)
                        noPathName == '' ? noPathName += 'No_' + decision.name : noPathName += ' & No_' + decision.name;

                        // loop over them again, passing in the rules array that was used to build rules
                        getDecisionsByRecursion( decision.noDecisions, rules.slice(), noPathName );
                    }

                    if ( decision.type == 'Audience Segment' ) {

                        // add it to the audience segments.. by value (slice).. only if there are actual rules to push in
                        // false means it's probably the default node
                        if( rules.length ) {

                            if ( decision.label ) {
                                name = name + ' = ' + decision.label;
                            }

                            decision.name = ( decision.customName ? decision.name : name ).substring(0,90);

                            // adding the data to the actual tree data so I can display it
                            decision.allRules = rules.slice();

                            // decide which.. new or existing
                            // first we will check is there is an ID
                            if ( decision.targetAudienceID ) {

                                targetAudiences.existing.push({
                                    name: campaignID ? decision.name + '_' + campaignID : decision.name,
                                    targetAudienceID: decision.targetAudienceID,
                                    rules: rules.slice()
                                });

                            }

                            else {

                                targetAudiences.new.push({
                                    name: campaignID ? decision.name + '_' + campaignID : decision.name,
                                    rules: rules.slice()
                                });

                            }

                        }

                        else{
                            // get the default audience name so that we can display it in the modal
                            // although this TA never gets saved. It's just to show the name and has a message
                            // notifying the user that it will not be saved
                            decision.name = ( decision.customName ? decision.name : 'Default' ).substring(0,90);
                            pub.defaultTargetAudienceName = decision.name;
                        }

                    }

					if ( decision.type != 'Audience Segment' && !decision.yesDecisions.length && !decision.noDecisions.length ) {
						targetAudiences.error = 'You have unfininshed segments. Please fix before trying to save.';
					}

                });

            }

            pub.audienceSegmentArray = targetAudiences;

            return targetAudiences;

        }


        /**
         * Sets the decision object as "original"
         * When switching between tabs we check if pub.decisions is equal to pub.original
         * if they aren't equal we prompt a save
         */
        pub.setOriginalDecisions = function() {
            angular.copy(pub.decisions, pub.original);
        };


        return pub;

    }
]);


app.directive( 'decisionTree', [ 'GraphFactory', 'decisionTreeService', 'panelFactory', 'csb', 'segmentsFactory', 'appService',
    function( GraphFactory, decisionTreeService, panelFactory, csb, segmentsFactory, appService ) {

        return {
            restrict: 'A',
            scope: {},
            templateUrl: 'csbApp/app/views/ui/decision-tree.html',
            link: function (scope, element, attrs) {

                // bind model to scope
                scope.decisionTreeService = decisionTreeService;
                scope.csbData = appService.csbData;


                // this is just for the first drop on the canvas.. it will only be used once if we are starting from scratch
                scope.onDropFirst = function( event, ui ) {

                    if ( csb.params.permissions.edit ) {

                        var graphItem = GraphFactory.getGraphItem( ui.draggable.data().graphId );

                        if ( graphItem
                                && graphItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_NOTE
                                && graphItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX
                                && graphItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_ARROW ) {

                            //console.log( graphItem.type );

                            var data = {
                                name: graphItem.name,
                                description: graphItem.name,
                                type: graphItem.name
                            };

                            scope.decision = new Decision(data);
                            scope.decision.icon = graphItem.icon;

                            decisionTreeService.decisions.push( scope.decision );


                            // open the panel and set the current element to be the selected decision
                            panelFactory.showPanel( scope.decision.type );
                            panelFactory.setDecisionModel( scope.decision );
                            decisionTreeService.setSelectedDecision(scope.decision);

                            appService.selectedCanvasItem = null;
                            // set focus
                            element.focus();

                        }

                    }

                }

            }
        }

    }
]);


app.directive( 'decisionTreeItem', [ 'GraphFactory', 'panelFactory','decisionTreeService', '$timeout', 'csb', 'modalFactory', 'appService',
    function( GraphFactory, panelFactory, decisionTreeService, $timeout, csb, modalFactory, appService ) {
        return {
            restrict: 'A',
            scope: {
                decision: '=',
				highlight: '='
            },
            templateUrl: 'csbApp/app/views/ui/decision-tree-item.html',
            link: function (scope, element, attrs) {

                scope.decisionTreeService = decisionTreeService;
				scope.GraphFactory = GraphFactory;

                scope.active = false;

                // action on drop
                scope.onDrop = function (event, ui) {

                    if ( csb.params.permissions.edit ) {

                        var data = ui.draggable.data();
                        var draggedItem = GraphFactory.getGraphItem(data.graphId);

                        if ( draggedItem
                            && scope.decision.type == GraphFactory.diagramTypes.AUDIENCE_SEGMENT
                            && draggedItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_NOTE
                            && draggedItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX
                            && draggedItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_ARROW ) {

                            // change the decision type
                            scope.decision.name = draggedItem.name;
                            scope.decision.type = draggedItem.type;
                            scope.decision.icon = draggedItem.icon;
                            scope.editDecision(scope.decision);

                        } else {
                            // scope.addDecision(scope.decision, event, ui);
                            // console.log('not adding because you can only drop new items on an audience segment');
                        }
                    }
                    else {
                        // console.log('no permission to add a node.. not really needed because we should be hiding any controls');
                    }
                }

                // when we want to edit a decision -> popup the panel and set the new model
                scope.editDecision = function ( decision ) {

                    panelFactory.showPanel( decision.type );
                    panelFactory.setDecisionModel( decision );

                    // set the selected decision rule in the decisionTreeService
                    decisionTreeService.setSelectedDecision(scope.decision);

                    // no sketching tools are selected when selecting a decision
                    appService.selectedCanvasItem = null;

                    // set focus // TODO what is this focusing? probably should remove
                    element.focus();

                }

            }
        }
    }
]);


/**
 * Save decision diagram as a template
 */
app.directive('saveDecisionDiagramAsTemplate', [ '$modal', '$timeout', 'strategies', 'decisionTreeService',
    function( $modal, $timeout, strategies, decisionTreeService ) {

        return {
            restrict: 'A',
            scope: {
                templates: '=',
				setStrategyVars: '&'
            },
            link: function( scope, element, attrs ) {

                // create the diagram object to store some data about it
                scope.decisionDiagram = {};

                // open the modal and init some vars
                element.bind( 'click', function() {

                    // stop if the diagram is empty.. not even going to open the modal
                    if ( !decisionTreeService.decisions.length ) {
                        return false;
                    }

                    scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-save-decision-diagram-as-template.html',
                        scope: scope
                    });

                    scope.decisionDiagram.name = '';
                    scope.saveButtonText = 'Save';

                    $timeout(function() {
                        element.find('input').first().focus().select();
                    });

                });

                // closes the modal
                scope.close = function() {
                    scope.saveErrorText = null;
                    scope.decisionDiagram.name = null;
                    scope.modal.dismiss();
                };

                // save the diagram
                scope.save = function() {

                    if ( scope.saving ) {
                        return false;
                    }

                    scope.saving = true;
                    scope.saveButtonText = 'Saving...';

                    // stop if we don't have a name
                    if ( !scope.decisionDiagram.name ) {
                        scope.saveErrorText = 'Please enter a name.';
						scope.saveButtonText = 'Save';
                        scope.saving = false;
                        return false;
                    }

					decisionTreeService.removeAdvertiserIfNeeded();

					strategies.saveStrategy( { template: true, name: scope.decisionDiagram.name } )
                        .then(function( response ) {

							// add to the templates and set this strategy as the selected one
							scope.templates.push( response );
							scope.setStrategyVars({ data: response });

                            scope.saveButtonText = 'Saved';
							scope.saving = false;
							scope.modal.dismiss();

                        },
                        function( error ) {

                            scope.saving = false;
                            scope.saveButtonText = 'Save';
                            scope.saveErrorText = error;

                        }
                    );

                }
            }
        }
    }
]);




app.directive( 'updateDecisionDiagramTemplate', [ 'appService', 'strategies', 'csb', '$modal',
    function( appService, strategies, csb, $modal ) {

        return {
            restrict: 'A',
            scope: {
				templates: '=',
				setStrategyVars: '&'
			},
            link: function( scope, element, attrs ) {

                element.bind( 'click', function() {

                    scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-update-diagram.html',
                        scope: scope
                    });

                    scope.saveButtonText = 'Save';
                    scope.templateName = csb.params.diagramName;

                });

                scope.update = function() {

                    scope.saveButtonText = 'Saving...';

                    // update the decision
                    strategies.updateStrategy().then(function( response ) {

                        // then update the templates on the left
                        angular.forEach( scope.templates, function( template, i ) {
							if ( template.id == response.id ) {
								scope.templates[i] = response;
							}
						});

						scope.setStrategyVars({ data: response });
						scope.saveButtonText = 'Saved';
						scope.modal.dismiss();

                    }, function( error ) {
                        scope.saveButtonText = 'Save';
                        scope.errorText = error;
                    });

                };

            }
        }

    }
]);


/**
 * Directive to delete diagram templates by ID
 */
app.directive( 'deleteDecisionDiagramTemplate', [ 'appService', 'strategies', 'csb', '$modal', 'decisionTreeService',
    function( appService, strategies, csb, $modal, decisionTreeService ) {

        return {
            restrict: 'A',
            scope: {
                diagramId: '=',
				templates: '='
            },
            link: function( scope, element, attrs ) {

                element.bind( 'click', function() {

                    scope.error = null;
                    scope.deleteButtonText = 'Delete Diagram';

                    scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-delete-decision-diagram-template.html',
                        scope: scope
                    });

                });

                scope.delete = function() {

                    scope.deleteButtonText = 'Deleting...';

                    strategies.deleteStrategy( scope.diagramId ).then(function( response ) {

                        // splice it out of the list
                        angular.forEach( scope.templates, function( template, i ) {
                            if ( template.id == scope.diagramId ) {
                                scope.templates.splice( i, 1 );
                            }
                        });

						// if it's the same one we have selected
                        if ( appService.selectedStrategy && scope.diagramId == appService.selectedStrategy.id ) {
                            decisionTreeService.decisions = [];
                            appService.selectedStrategy = null;
                            csb.params.advertiserName = null;
                            csb.params.advertiserID = null;
							csb.params.diagramID = null;
                        }

                        scope.deleteButtonText ="Deleted";
                        scope.modal.dismiss();

                    }, function( error) {
                        scope.deleteButtonText = 'Delete Diagram';
                        scope.error = error;
                    });
                }

            }
        }

    }
]);


/**
 * saves target audiences,
 * updates target audiences,
 * gets default priorities,
 * sets priorities,
 * unnattaches any DGS to TAs that are no longer on the diagram,
 * and finally saves or updates a decision diagram.. whew!
 */
app.directive( 'saveDecisionDiagramToCampaign', [ '$q', '$timeout', '$modal', 'decisionTreeService', 'csb', 'appService', 'strategies', 'targetAudiences', 'campaigns', 'advertisers', 'segmentsFactory',
    function( $q, $timeout, $modal, decisionTreeService, csb, appService, strategies, targetAudiences, campaigns, advertisers, segmentsFactory ) {

        return {
            restrict: 'A',
            scope: {
				setStrategyVars: '&'
			},
            link: function( scope, element, attrs ) {

				/**
				 * opens and inits the modal for saving the campaign
				 */
                element.bind( 'click', function() {

                    scope.button = {};
                    scope.button.save = "Save";
					scope.saveErrorText = null;
					scope.selected = {};
					scope.selected.campaign = {};
                    scope.campaignID = csb.params.campaignID;
                    scope.campaignName = csb.params.campaignName;
                    scope.advertiserID = csb.params.advertiserID;
                    scope.advertiserName = csb.params.advertiserName;
                    scope.showCampaignSelection = csb.params.campaignID ? false : true;
					scope.defaultTargetAudienceName = decisionTreeService.defaultTargetAudienceName;

                    // stop if the diagram is empty.. not even going to open the modal
                    if ( !decisionTreeService.decisions.length ) {
                        return false;
                    }

                    if ( !csb.params.campaignID ) {
                        // if advertiser id, call new service CampaignsListByAdvertiser
                        if ( csb.params.advertiserID ) {
                            campaigns.getCampaigns( 'advertiser', { advertiserId: csb.params.advertiserID , strategy: true} )
                                .then(function( response ) {
                                    scope.campaigns = response;
                                    if ( scope.campaigns.length == 0 ) {
                                        error('There are no campaigns available for your chosen advertiser.');
                                    }
                                }
                            )
                        }

                        // else get the list of campaigns by user account
                        else {
                            campaigns.getCampaigns( 'account', { accountId: csb.params.accountID, strategy:true } )
                                .then(function( response ) {
                                    scope.campaigns = response;
                                    if( scope.campaigns.length == 0 ) {
                                        error('There are no campaigns available for your account.');
                                    }
                                }
                            );
                        }

                    }

                    // build needed stuff for display and saving TAs
                    scope.segments = decisionTreeService.buildAudienceSegmentsFromDiagram( csb.params.campaignID );
                    scope.tas = decisionTreeService.buildTargetAudienceObjectToSave( null, appService.csbData.targetAudienceIDs );

					if ( scope.segments.error ) {
						error( scope.segments.error );
					}

					if ( scope.tas.error ) {
						error( scope.tas.error );
					}

                    scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-save-decision-diagram-and-target-audiences.html',
                        scope: scope,
                        backdrop: 'static'
                    });

                });


				/**
				 * When we select a campaign this will get and set a few vars
				 */
                scope.selected = {};
                scope.selectCampaign = function() {

                    scope.segments = decisionTreeService.buildAudienceSegmentsFromDiagram( scope.selected.campaign.id );
                    scope.tas = decisionTreeService.buildTargetAudienceObjectToSave( scope.selected.campaign.id, appService.csbData.targetAudienceIDs );
                    scope.campaignID = scope.selected.campaign.id;
                    scope.campaignName = scope.selected.campaign.name;
                    advertisers.getAdvertisers({ campaignId: scope.selected.campaign.id }).then(function(response) {
						if ( response[0] ) {
							scope.advertiserName = response[0].name;
							scope.advertiserID = response[0].id;
						}
                    });

                };


				/**
				 * Closes the modal
				 */
                scope.close = function() {
                    scope.campaign = null;
                    scope.modal.dismiss();
                };


				/**
				 * Save everything
				 */
                scope.save = function() {

					scope.saveErrorText = '';

                    // if it's mid save don't allow it to go forward
                    if ( scope.saving ) {
                        return false;
                    }

                    scope.saving = true;
                    scope.button.save = 'Saving...';

                    if( !scope.campaignID ){
                        error('Please select a Campaign. ');
                        return false;
                    }

                    if ( scope.tas.error ) {
                        error( scope.tas.error );
                        return false;
                    }

					if ( scope.segments.error ) {
						error( scope.segments.error );
						return false;
					}

                    var originalTAs = angular.copy( appService.csbData.targetAudienceIDs );

                    // first we are going to save the TA's
                    targetAudiences.saveTargetAudiences( scope.tas.save ).then(function( saveResponse ) {

                        var newTAs = saveResponse.tas;

                        // then update the TAs I need to update
                        targetAudiences.updateTargetAudiences( scope.tas.update ).then(function( updateResponse ) {

                            var existingTAs = updateResponse.tas;

                            // combine the Save and Update TA's
                            var tas = newTAs.concat( existingTAs );

							removeOldTargetAudiences( scope.tas.delete );

                            // empty before setting
                            appService.csbData.targetAudienceIDs = [];
                            setTargetAudienceIDsOnDiagramAndCreateTAsObjectForDiagram( tas, decisionTreeService.decisions, scope.campaignID );

                                //and finally save or update the diagram
                                if ( csb.params.diagramID && appService.selectedStrategy.template == false ) {
                                    strategies.updateStrategy()
                                        .then(function( strategy ) {
											finishSave( strategy, saveResponse.error += updateResponse.error );
										}, function( error ) {
											error( error );
										}
                                    );
                                }
                                else {
                                    strategies.saveStrategy({
										template: false,
										campaignID: scope.campaignID,
										advertiserID: scope.advertiserID,
										name: scope.campaignName + '_' + scope.campaignID + '_Strategy'
									}).then( function( strategy ) {
										finishSave( strategy, saveResponse.error += updateResponse.error );
									}, function( error ) {
										error( error );
									});
                                }

                        }, error);

                    }, error );

                };


                /**
                 * generic error function to change button and show error
                 * @param error
                 */
                function error( error ) {
					scope.campaign = null;
                    scope.saveErrorText = scope.saveErrorText ? scope.saveErrorText + ' ' + error : error;
                    scope.saving = false;
                    scope.button.save = "Save";
                };


                /**
                 * Wraps up the save and closes modal as well as sets the campaignID if needed
                 */
                function finishSave( strategy, saveError ) {

                    scope.saving = false;
                    scope.button.save = "Saved";

                    if ( saveError ) {
                        error( saveError );
                    }

					else {
						decisionTreeService.setOriginalDecisions();
						scope.modal.dismiss();
					}

					// timeout because it breaks binding otherwise (like "saving..." text for button)
					$timeout(function() {
						scope.setStrategyVars({ data: strategy });
					}, 200 );

                };


                /**
                 * Removes TA's that no longer are part of the diagram
                 * @param newtas
                 * @param oldtas
                 */

                function removeOldTargetAudiences( tas ) {

					angular.forEach( tas, function( ta ) {
						targetAudiences.deleteTargetAudience( ta.TargetAudienceID )
					});

                };


                /**
                 * This builds the Target Audiences to save along with the diagram
                 * This object is used so when the app loads initially it has the TAs along with its contextual data
                 * @param tas
                 * @param decisions
                 * @param campaignID is used to add to the target audience name because we prepend it with the campaignID
                 */

                function setTargetAudienceIDsOnDiagramAndCreateTAsObjectForDiagram( tas, decisions, campaignID ) {

                    decisions.forEach(function( decision ) {

                        if ( decision.yesDecisions.length > 0 ) {
                            // loop over them again, passing in the rules array that was used to build rules
                            setTargetAudienceIDsOnDiagramAndCreateTAsObjectForDiagram( tas, decision.yesDecisions, campaignID );
                        }
                        if ( decision.noDecisions.length > 0 ) {
                            // loop over them again, passing in the rules array that was used to build rules
                            setTargetAudienceIDsOnDiagramAndCreateTAsObjectForDiagram( tas, decision.noDecisions, campaignID );
                        }
                        if ( decision.type == 'Audience Segment' ) {

                            tas.forEach(function( ta ) {

								// append the campaign ID to the name on the diagram ( because we don't show the campaign ID appended to the name there )
								var diagramTargetAudienceName = decision.name + '_' + campaignID;

								// have to compare the values with the campaign ID appended to the name that comes from the diagram
								if ( ta.name == diagramTargetAudienceName ) {

									// set the ID on the decision diagram
									decision.targetAudienceID = ta.id;

									// push the TA ID's and contextual data to array
									appService.csbData.targetAudienceIDs.push({
										TargetAudienceID: decision.targetAudienceID,
										TargetAudienceName: diagramTargetAudienceName,
										Rules: decision.allRules
									});

								}

                            });

                        }

                    })

                };


                /**
                 * Method to create the default priorities.. it only sets the priorities of new TA'S
                 * It takes the count of the existing TA's and starts the count from there
                 * @param existingTAs
                 * @param newTAs
                 * @returns {Array}
                 */
                function createTargetAudiencePriorities( tas, serverDefaults ) {

                    // sort them (different orders.. weights is high-low and priority is low-high)
                    var sortedByDefault = serverDefaults.sort(function( a, b ) { return parseFloat( b.Weight ) - parseFloat( a.Weight ) } );
                    var sortedCurrent = appService.csbData.targetAudiencePriorities.sort(function( a, b ) { return parseFloat( a.Priority ) - parseFloat( b.Priority ) } );

                    // strip out any priorities that have been deleted
                    var newSortedCurrent = [];
                    for( var i = 0; i < sortedCurrent.length; i++ ) {

                        var taID = sortedCurrent[i].TargetAudienceID;

                        for ( var g = 0; g < tas.length; g++ ) {
                            if( tas[g].TargetAudienceID == taID ) {
                                newSortedCurrent.push(sortedCurrent[i]);
                            }
                        }
                    }

                    sortedCurrent = newSortedCurrent;

                    // loop over the defaults.. check if they exist from current.. if they don't push into the array
                    for ( var i = 0; i < sortedByDefault.length; i++ ) {

                        var taID = sortedByDefault[i].TargetAudienceID;

                        var exists = isInExistingPriorities( taID )

                        if ( exists == false ) {
                            sortedCurrent.push( { "TargetAudienceID": sortedByDefault[i].TargetAudienceID , "Priority" : null } );
                        }

                    }

                    // now reloop and set priorities based on the order here.. that way if we deleted one there won't be a gap from 3-5 or something(if we deleted 4)
                    for ( var i = 0; i < sortedCurrent.length; i++ ) {
                        sortedCurrent[i].Priority = i + 1;
                    }

                    // checks if the priorities exist already and returns true/false depending
                    function isInExistingPriorities( taID ) {

                        var found = false;

                        for (var i = 0; i < sortedCurrent.length; i++) {

                            var currentID = sortedCurrent[i].TargetAudienceID;

                            if (currentID == taID) {
                                found = true;
                            }

                        }

                        return found;

                    }

                    return sortedCurrent;

                };

            }
        }
    }
]);




/**
 * Injecting $timeout for testing purposes
 * EXPORT TREE
 * Directives takes the HTML from the decision diagram as well as a custom CSS file and creates a string to send to the server
 */
app.directive( 'exportTree', [ 'decisionTreeService', 'pdf', '$modal', '$timeout', '$http', '$q',
    function( decisionTreeService, pdf, $modal, $timeout, $http, $q ) {

        return {
            restrict: 'A',
            link: function( scope, element, attrs ) {


                element.bind( 'click', function() {

                    // only doing this if there some actual content on the page
                    if ( !decisionTreeService.decisions.length ) {
                        return false;
                    }

                    // create the modal object to hold the data
                    scope.modalData = {
                        title: 'Converting your PDF...'
                    };

                    // create a boostrap modal and open
                    scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-pdf.html',
                        scope: scope
                    });

                    scope.openPDF = function() {
                        window.open( scope.modalData.url, '_blank' , '' );
                    };

                    var html = $('#decision-tree').html();
                    var css = 'body,html{background:#FFF;font-size:14px;min-height:100%}#main,.canvas,.content,.sidebar,body,html{height:100%;font-family:"Titillium Web Light",Arial}*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.no-margin{margin:0}.centered{text-align:center;display:block}.clearfix:after,.clearfix:before{display:table;content:" "}.clearfix:after{clear:both}.page-content{position:relative}.main{position:absolute;padding:0;height:100%;width:110%;top:0;left:0}.main.no-sidebar{left:0;right:0;width:100%}#note-canvas{position:absolute;top:0;width:0;height:0;z-index:9}#text-box-canvas{position:absolute;top:0;width:0;height:0;z-index:10}.canvas{padding:30px}.canvas .decision-tree,.canvas .no-branch,.canvas .yes-branch{margin:0;padding:0;position:relative}.canvas .decision-tree-canvas{margin-bottom:40px}.canvas li{margin:0;padding:0;list-style-type:none}.canvas .yes-branch{position:relative;top:-80px;left:203px;display:inline-block;width:180px}.canvas .yes-branch.multi{padding-left:72px}.canvas .yes-branch.multi li{margin-bottom:25px}.canvas .yes-branch>li{position:relative}.canvas .no-branch{position:relative;margin-top:-20px}.decision-label.preview{display:none}.multi>li>div>div>.decision-label.preview{display:inline-block;left:-44px;top:25px}.decision-item{margin-bottom:10px;width:130px;height:70px;line-height:40px;text-align:center}.yes-branch:after{content:"";position:absolute;height:1px;left:-72px;right:100%;top:34px;background:#aaa}.yes-branch.multi>li>.decision-item:after{content:"";position:absolute;width:1px;bottom:35px;height:100%;left:-72px;background:#aaa}.yes-branch.multi>li:first-child>.decision-item:after{top:35px}.yes-branch.multi>li:last-child>.decision-item:after{height:95px;top:-60px}.yes-branch>li:after{content:"";position:absolute;height:1px;left:-72px;right:100%;top:34px;background:#aaa}.yes-branch:empty{display:none}.canvas li:before{content:"";position:absolute;left:65px;width:1px;top:70px;bottom:70px;background:#aaa}.decision-label{position:absolute;background:#FFF;line-height:1em;padding:3px;color:#555;z-index:2;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px}.decision-label.yes{top:24px;left:152px}.decision-label.no{top:100px;left:55px}.decision-tree-empty-item{display:none;width:130px;padding:30px 10px;border:1px dashed #555;text-align:center;color:#ccc}.decision-item-inner{width:130px;height:70px;position:relative}.decision-item-triangle{background:#FFF;border:1px solid #555;transform:rotate(150deg) skew(31deg);-moz-transform:rotate(150deg) skew(31deg);-webkit-transform:rotate(150deg) skew(31deg);width:81px;height:70px;position:relative;z-index:6;top:0;left:0;display:inline-block;cursor:pointer;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px}.decision-item-inner.audience-segment .decision-item-triangle{transform:rotate(0);-moz-transform:rotate(0);-webkit-transform:rotate(0);width:130px;height:70px;left:0;top:0}.decision-item-inner.audience-segment .csb-icon-bg,.decision-item-inner.audience-segment i{display:none}.decision-item-content{position:absolute;top:0;left:0;z-index:6;color:#555;width:130px;height:70px;line-height:1.2em;font-size:13px;display:table}.decision-item-content p{display:table-cell;vertical-align:middle}.decision-item i{display:none;position:absolute;top:-13px;left:50%;margin-left:-11px;z-index:7;color:#555;font-size:18px}.decision-item .csb-icon-bg{position:absolute;top:-15px;left:50%;margin-left:-12px;width:22px;height:22px;border-radius:35px;-moz-border-radius:35px;-webkit-border-radius:35px;background:#FFF;z-index:6}.csb-selected-note-border{border:1px solid #666!important;border-radius:3px;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.csb-selected-text-box-border{border:1px dashed #666!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.csb-selected-arrow{background:#666!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.csb-selected-arrow:after{position:absolute;content:"";right:0;top:50%;margin-top:-5px;margin-right:-10px;width:0;height:0;border-style:solid;border-width:5px 0 5px 10px;border-color:transparent transparent transparent #666!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.sketching-tools-note{font-family:"helvetica neue",arial;color:#444;display:block;cursor:move;text-align:center;font-size:12px}.sketching-tools-note .inner{position:relative;display:inline-block;background:#486E9A;border:1px solid #444;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px;padding:10px 5px 5px;min-width:120px;max-width:300px;box-shadow:0 -1px 8px rgba(255,255,255,.3),inset 0 0 37px rgba(255,255,255,.14);-moz-box-shadow:0 -1px 8px rgba(255,255,255,.3),inset 0 0 37px rgba(255,255,255,.14);-webkit-box-shadow:0 -1px 8px rgba(255,255,255,.3),inset 0 0 37px rgba(255,255,255,.14);word-wrap:break-word;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.sketching-tools-note .csb-selected-note-arrow-left:before{position:absolute;left:0;top:50%;margin-top:-11px;margin-left:-30px;content:"";width:0;height:0;border-style:solid;border-width:10px 30px 10px 0;border-color:transparent #666 transparent transparent!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.sketching-tools-note .csb-note-arrow-left:before{position:absolute;left:0;top:50%;margin-top:-11px;margin-left:-30px;content:"";width:0;height:0;border-style:solid;border-width:10px 30px 10px 0;border-color:transparent #666 transparent transparent}.sketching-tools-note .csb-selected-note-arrow-right:after{position:absolute;right:0;top:50%;margin-top:-11px;margin-right:-30px;content:"";width:0;height:0;border-style:solid;border-width:10px 0 10px 30px;border-color:transparent transparent transparent #666!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.sketching-tools-note .csb-note-arrow-right:after{position:absolute;right:0;top:50%;margin-top:-11px;margin-right:-30px;content:"";width:0;height:0;border-style:solid;border-width:10px 0 10px 30px;border-color:transparent transparent transparent #444}.sketching-tools-note .csb-selected-note-arrow-top:before{position:absolute;left:50%;top:0;margin-top:-30px;margin-left:-9px;content:"";width:0;height:0;border-style:solid;border-width:0 10px 30px;border-color:transparent transparent #666!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.sketching-tools-note .csb-note-arrow-top:before{position:absolute;left:50%;top:0;margin-top:-30px;margin-left:-9px;content:"";width:0;height:0;border-style:solid;border-width:0 10px 30px;border-color:transparent transparent #444}.sketching-tools-note .csb-selected-note-arrow-bottom:after{position:absolute;left:50%;bottom:0;margin-bottom:-30px;margin-left:-9px;content:"";width:0;height:0;border-style:solid;border-width:30px 10px 0;border-color:#666 transparent transparent!important;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.sketching-tools-note .csb-note-arrow-bottom:after{position:absolute;left:50%;bottom:0;margin-bottom:-30px;margin-left:-9px;content:"";width:0;height:0;border-style:solid;border-width:30px 10px 0;border-color:#444 transparent transparent}.sketching-tools-text-box{font-family:"helvetica neue",arial;color:#444;display:block;text-align:center;font-size:12px;cursor:move}.sketching-tools-text-box .inner{position:relative;display:inline-block;background:0 0;padding:10px 5px 5px;min-width:120px;max-width:300px;word-wrap:break-word}.sketching-tools-text-box-border{border:1px dashed #444}.sketching-tools-arrow{transform-origin:0 50%;height:2px;background:#444;width:100px;cursor:move;transition:background .5s;-moz-transition:background .5s;-webkit-transition:background .5s}.sketching-tools-arrow:after{position:absolute;content:"";right:0;top:50%;margin-top:-5px;margin-right:-10px;width:0;height:0;border-style:solid;border-width:5px 0 5px 10px;border-color:transparent transparent transparent #444;transition:border-color .5s;-moz-transition:border-color .5s;-webkit-transition:border-color .5s}.csb-arrowItem-handle{left:110px;top:-2.5px;transform-origin:50% 50%;position:absolute!important;width:5px;height:5px;border-style:solid;border-radius:5px;border-color:#444;display:inline-block;cursor:pointer}@font-face{font-family:icomoon;src:url(http://utemplate.com/jeffsfonts/icomoon.eot?-pwcfa8);src:url(http://utemplate.com/jeffsfonts/icomoon.eot?#iefix-pwcfa8) format("embedded-opentype"),url(http://utemplate.com/jeffsfonts/icomoon.woff?-pwcfa8) format("woff"),url(http://utemplate.com/jeffsfonts/icomoon.ttf?-pwcfa8) format("truetype"),url(http://utemplate.com/jeffsfonts/icomoon.svg?-pwcfa8#icomoon) format("svg");font-weight:400;font-style:normal}[class*=" icon-"],[class^=icon-]{display:none;font-family:icomoon;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.csb-icon-blank:before{content:"\e611"}.csb-icon-document:before{content:"\e612"}.csb-icon-folder-closed:before{content:"\e613"}.csb-icon-folder-open:before{content:"\e614"}.csb-icon-image:before{content:"\e615"}.csb-icon-add-btn:before{content:"\e608"}.csb-icon-remove-btn:before{content:"\e609"}.csb-icon-CSB-help:before{content:"\e60a"}.csb-icon-CSB-share:before{content:"\e60b"}.csb-icon-arrow:before{content:"\e60c"}.csb-icon-contextual-targeting:before{content:"\e60d"}.csb-icon-geo-targeting:before{content:"\e60e"}.csb-icon-interaction:before{content:"\e60f"}.csb-icon-note:before{content:"\e610"}.csb-icon-retargeting:before{content:"\e604"}.csb-icon-search-retargeting:before{content:"\e602"}.csb-icon-site-keywords:before{content:"\e605"}.csb-icon-text-box:before{content:"\e603"}';
                    var htmlString = '<!DOCTYPE html><html><head lang="en"></head><style>' + css + '</style><body><div class="main"><div class="canvas">' + html + "</div></div></body></html>";

                    htmlString = htmlString.replace(/(\r\n|\n|\r)/gm, '');

                    // function to generate the PDF
                    pdf.exportPDF( htmlString ).then(
                        function( url ) {
                            scope.modalData.title = "PDF converted"
                            scope.modalData.url = url;
                        },
                        function( error ) {
                            scope.error = error;
                        }
                    );

                });

            }
        }

    }
]);


/**
 * SHARE URL Directive
 */

app.directive( 'shareUrl', [ '$modal', 'csb', '$state',
    function( $modal, csb, $state ) {

        return{
            restrict: 'A',
            scope: {},
            link: function( scope, element, attrs ) {

                var clickHandler = function() {

                    scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-share-url.html',
                        scope: scope
                    });

                    // create the URL and assign it to a scope variable
                    // second argument of $state.href is for passing path/param variables
                    // only passing diagram ID because the EnvID is saved in $state and doesn't change after loading application
                    // NOTE: creating 2 different objects to be passed as second argument
                    // MDX2 expects to be passed 'DecisionDiagramID' through params
                    // MDX3 expects to be passed 'diagramID' through the path
                    // ( see differences in route.js )
                    var shareParams;
                    if ( csb.config.env == 'mdx2' ) {
                        shareParams = {
                            DecisionDiagramID: csb.params.diagramID,
                            EnvID: csb.config.envID
                        };
                    }
                    else{
                        shareParams = {
                            diagramID: csb.params.diagramID
                        };
                    }

                    scope.shareUrl = $state.href( 'csb-share', shareParams , { absolute: true } );

                };

                element.on( 'click',  clickHandler);

                scope.$on('$destroy', function() {
                   element.off('click', clickHandler);
                });

            }
        }

    }
]);




