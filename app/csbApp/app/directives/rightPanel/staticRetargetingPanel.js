/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('staticRetargetingPanel', ['panelFactory', 'decisionTreeService', 'modalFactory', 'appService', 'advertisers', 'csb', 'segmentsFactory', '$timeout',
  function (panelFactory, decisionTreeService, modalFactory, appService, advertisers, csb, segmentsFactory, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        decision: '=',
        showPanel: '=',
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/staticRetargetingDecisionUI.html',
      link: function (scope, element, attrs) {
        var YES_DECISION = 'yes-decision',
          NO_DECISION = 'no-decision',
          DEFAULT_DECISION = 'default-decision';
        var originalDecisionData;

        function defaultTargetingGroups() {

          var groups = [
            {rules: [], type: YES_DECISION}
          ];

          return groups;
        }

        function getDaysOfTheYear() {
          var days = [];
          for (var i = 0; i < 365; i++) {
            var d = (i + 1);
            var dayString;
            if (i == 0) {
              dayString = ' day';
            }
            else {
              dayString = ' days';
            }
            days.push({id: d, name: d + dayString});
          }
          scope.advertiserDays = days;
        }

        getDaysOfTheYear();

        // making the csbData available to the panel
        // It seemed unnecessary to include the whole appService
        // but could be done if needed
        scope.csbData = appService.csbData;
        scope.csb = csb;
        scope.removeItems = [];

        if (!scope.decision) {
          scope.decision = csb.createDecision({});
        }

        // This is a boolean that shows the UI based on its value
        scope.showUI = false;

        scope.advertiserChanged = function (shouldAddNewRules) {
          if(shouldAddNewRules){
            angular.forEach(scope.decision.data.targetingGroups, function (group) {
              group.rules = [];
              scope.addRule(group);
            });
          }
          scope.updateTags();
        };

        // then when we select the advertiser from the drop down, we show different tags
        scope.updateTags = function (callback) {
          scope.tags = [];
          // get the tags by advertiser id.. this will populate the selections
          if(scope.advertiser.id){
            advertisers.getRetargetingTags({advertiserId: scope.advertiser.id}).then(
              function (response) {
                if (csb.config.env == 'mdx3') {
                  scope.tags = response[0].retargetingTagList;
                } else {
                  scope.tags = response;
                }

                if (callback) {
                  $timeout(function () {callback();});
                }
              });
          }
        };

        /**
         * This method gets the custom tags associated by the tag id
         *
         * @param id INT The tag id
         */
        scope.updateTagValues = function (rule, change) {
          if (scope.tags.length && rule.details && rule.details.id) {
            var tag = scope.tags[scope.tags.indexOfObjectByKey('id', rule.details.id)];

            if (change) {
              rule.selectedTagValues = [];
            }

            rule.tagValues = tag.values;
          }
        };

        // This is called to initialize the form UI controls
        var init = function () {

          // clearing out any errors
          scope.errorText = '';

          // set the name
          scope.name = {};
          scope.name.text = scope.decision.name;
          scope.disableType = decisionTreeService.shouldDisableType(scope.decision);
          scope.selectedDay = {value: 90};
          scope.ruleTypeOptions = [
            {
              'id': 'yes-no',
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


          //scope.advertiserDays = getAdvertiserDays();

          // select the name input when opening the panel
          $timeout(function () {
            element.find('input').first().focus().select();
          });

          if (!scope.decision.data) {

            // This is an object that holds the value of the form data
            scope.decision.data = {
              isYesNo: "yes-no"
            };

            // update Retargeting Rules dropdown
            scope.changeTargetType(scope.decision.data.isYesNo);
          } else if (scope.decision.data.selectedDay) {
            scope.selectedDay.value = scope.decision.data.selectedDay;
          }

          originalDecisionData = angular.copy(scope.decision);

          // when the tab loads we need to get the list of advertisers if one isn't selected yet
          scope.advertiser = {id: csb.params.advertiserID || null};

          // show the spinner
          scope.loading = true;

          // hide the UI
          scope.staticAvailable = false;

          advertisers.getAdvertisers({accountId: csb.params.accountID, hasStaticTags: true}).then(function (response) {
              scope.advertisers = response;
              scope.advertisers.index = {};

              // we need to see if we already have one selected.. if so we need to check to see if it's available in this list
              angular.forEach(response, function (advertiser) {
                scope.advertisers.index[advertiser.id] = advertiser.name;

                if (csb.params.advertiserID) {
                  if (advertiser.id == csb.params.advertiserID) {
                    scope.staticAvailable = true;
                  }
                } else {
                  scope.staticAvailable = true;
                }
              });

              scope.loading = false;
            },
            function () {
              scope.staticAvailable = false;
              scope.loading = false;
            }
          );

          // the decision has an advertiser already selected
          if (scope.advertiser.id) {
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
          angular.forEach(scope.decision.data.targetingGroups, function (group) {
            angular.forEach(group.rules, function (rule) {
              scope.updateTagValues(rule);
            });
          });
        };

        panelFactory.validatePanel(scope, panelFactory.diagramTypes.STATIC_RETARGETING, init);

        // This is the handler that changes the UI base on if the dropdown for yes-no is set
        scope.changeTargetType = function (value) {

          if (scope.decision.data.targetingGroups && scope.decision.data.targetingGroups.length) {
            scope.decision.data.targetingGroups = [scope.decision.data.targetingGroups[0]];
          }
          else {
            scope.decision.data.targetingGroups = [];
            if (value == 'yes-no') {
              scope.decision.data.targetingGroups = defaultTargetingGroups();
            }
            else {
              var group = {rules: [], type: 'multi'};
              scope.decision.data.targetingGroups.push(group);
            }
          }

        };

        scope.addRule = function (audienceGroup) {

          var rule = {
            id: 1,
            details: {id: null, name: null},
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
          $timeout(function () {scope.updateTags(updateTagValuesForRules);});
        };

        scope.addGroup = function () {
          scope.decision.data.targetingGroups.push({rules: [], type: 'multi'});
        };

        scope.removeGroup = function (group) {

          var i = scope.decision.data.targetingGroups.indexOf(group);

          if (i > -1) {
            scope.decision.data.targetingGroups.splice(i, 1);
            scope.removeItems.push(i);
          }

        }

        scope.closePanel = function () {
          scope.closePanelUi();
          scope.showUI = false;
          decisionTreeService.clearSelectedDecision();
          // if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
          if (!scope.decision.yesDecisions.length) {
            decisionTreeService.deleteDecision(scope.decision);
          }
        };

        scope.save = function () {
          var isUpdating = (scope.decision.yesDecisions.length > 0 && scope.decision.noDecisions.length > 0);
          var isValid = true;

          angular.forEach(scope.decision.data.targetingGroups, function (group) {

            if (group.rules.length == 0 && group.type != 'default-decision') {
              isValid = false;
            }

            angular.forEach(group.rules, function (rule) {

              if (group.type != 'default-decision') {
                if (!rule.exposure
                  || !rule.details
                  || rule.tagValues
                  && rule.tagValues.length
                  && !rule.selectedTagValues.length) {

                  isValid = false;
                }
              }

            });
          });

          // remove any groups that we deleted
          for (var i = 0; i < scope.removeItems.length; i++) {
            scope.decision.yesDecisions.splice(scope.removeItems[i], 1);
          }

          scope.removeItems = [];

          // validation

          scope.errorText = '';

          if (!isValid) {
            scope.errorText += 'You didn\'t complete a rule. ';
          }
          if (!scope.decision.name) {
            scope.errorText += 'You must enter a name. ';
          }
          if (!scope.advertiser.id) {
            scope.errorText += 'You must select an advertiser. ';
          }
          if (scope.errorText) {
            return false;
          }

          scope.decision.name = scope.name.text;
          scope.decision.data.selectedDay = scope.selectedDay.value;
          csb.params.advertiserID = scope.advertiser.id || csb.params.advertiserID;
          csb.params.advertiserName = scope.advertisers.index[scope.advertiser.id] || csb.params.advertiserName;

          var yesTAs = [];

          var tagIndex = {};
          scope.tags.forEach(function (tag) {
            tagIndex[tag.id] = tag;
          });

          angular.forEach(scope.decision.data.targetingGroups, function (group) {

            var retargetingRules = [];
            var targetAudienceData = [];

            if (group.type != 'default-decision') {

              var rules = group.rules;

              if (rules.length > 0) {

                angular.forEach(rules, function (rule, i) {

                  rule.details.tagOrdinal = tagIndex[rule.details.id].tagOrdinal;

                  var logicalOperator = rule.logicalOperator ? rule.logicalOperator : null;

                  // create rule
                  var targetingRule = decisionTreeService.createRule(rule, scope.decision, logicalOperator, null, null, i);
                  retargetingRules.push(targetingRule);

                  // create the contextual TA rule
                  var targetAudienceRule = decisionTreeService.createContextualRule(rule, scope.decision, logicalOperator);
                  targetAudienceData.push(targetAudienceRule);

                });
              }

              // No need to update anything if nothing changed
              if (retargetingRules.length > 0 && targetAudienceData.length > 0) {

                var description = scope.decision.name;

                // chain the rules together
                if (scope.decision.parentType) {
                  if (scope.decision.description != 'Default Audience') {
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
            if (scope.decision.data.isYesNo == 'multi') {
              var label = '';
              angular.forEach(taData.targetAudienceData, function (rule, g) {
                label += rule.exposure + ' ' + rule.name;
                g < taData.targetAudienceData.length - 1 ? label += ' ' + rule.logicalOperatorID + ' ' : null;
              });
            }


            if (scope.decision.yesDecisions.length < yesTAs.length && i > scope.decision.yesDecisions.length - 1) {
              decisionTreeService.addAudienceSegment(scope.decision, taData.description, taData.decisionType, null, taData.retargetingRules, taData.targetAudienceData, label);
            }

            else {

              var currentTADecision = scope.decision.yesDecisions[index];
              // Update existing decisions
              decisionTreeService.updateAudienceSegment(currentTADecision, taData.name, taData.description, taData.retargetingRules, taData.targetAudienceData, label);

            }

            // terrible place to put this.. but make sure if it's yes/no that it removes any of the other decisions
            if (scope.decision.data.isYesNo == 'yes-no') {
              scope.decision.yesDecisions = [scope.decision.yesDecisions[0]];
            }

            index++;

          });

          if (!isUpdating) {
            // create Default audience segment
            var description;
            if (scope.decision.parentType) {
              description = scope.decision.description;
            }
            else {
              description = 'Default Audience';
            }

            decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null, null);
          }

          // don't remove
          decisionTreeService.buildAudienceSegmentsFromDiagram();

          scope.closePanel();

        };

        scope.cancelChanges = function () {
          angular.copy(originalDecisionData, scope.decision);
          scope.closePanel();
          // if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
          if (!scope.decision.yesDecisions.length) {
            decisionTreeService.deleteDecision(scope.decision);
          }
        };
      }
    }
  }
]);
