/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'contextualTargetingPanel', [ 'panelFactory', 'decisionTreeService', '$timeout', 'categories', 'csb', 'ruleFactory',
  function( panelFactory, decisionTreeService, $timeout, categories, csb, ruleFactory) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        decision: '=',
        showPanel: '=',
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/contextualTargetingUI.html',
      link: function( scope, element, attrs ) {
        scope.csb = csb;
        panelFactory.validatePanel(scope, panelFactory.diagramTypes.CONTEXTUAL_TARGETING, init);

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
          scope.disableType = decisionTreeService.shouldDisableType(scope.decision);
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
                scope.categories = prepareDataSource(response);
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

        }
        // TODO: patch because the mdx2 & mdx3 APIs don't return the same object
        function prepareDataSource(data){
          var finalArray = [];
          if(data && data.length){
            var isMds3 = (data[0].id !== undefined);
            angular.forEach(data, function(item){
              if(isMds3){
                finalArray.push(item);
              } else {
                finalArray.push({id: item.categoryItemID, name: item.categoryItemName});
              }
            });
          }
          return finalArray;
        }

        /**
         * This method is called when a category is selected.
         * @param categoryID ID to be used when calling the API to retreive subcategories.
         */
        scope.loadSubCategories = function (categoryID) {
          categories.getSubCategories({categoryId: categoryID}).then(function( response ) {
                //console.log(response);
                // NOTE: it currently uses 'categoryItemID' and 'categoryItemName' as the keys
                scope.subCategories = prepareDataSource(response);
              });
        }
        scope.save = function() {
          var rules = [];

          if ( scope.selectedSubCategories.length ) {
            ruleFactory.createContextualTargetingRules(rules, scope.selectedSubCategories, scope.decision.type);
            scope.decision.data.selectedSubCategories = scope.selectedSubCategories;
          }

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
              description = 'Default Audience'
            }
            decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
          }

          // don't remove
          decisionTreeService.buildAudienceSegmentsFromDiagram();

          scope.closePanel();

        }
        scope.closePanel = function(){
          scope.closePanelUi();
          decisionTreeService.clearSelectedDecision();
          // if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
          if (!scope.decision.yesDecisions.length ) {
            decisionTreeService.deleteDecision( scope.decision );
          }
        }
        scope.cancelChanges = function(){
          scope.closePanel();
          scope.model = angular.copy(scope.model);
        }
      }
    }
  }
]);
