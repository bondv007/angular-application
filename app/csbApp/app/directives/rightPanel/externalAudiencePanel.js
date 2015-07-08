/**
 * Created by rotem.perets on 2/8/15.
 */
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
      templateUrl: 'csbApp/app/directives/views/rightPanel/externalAudienceUI.html',
      link: function( scope, element, attrs ) {
        scope.csb = csb;

        // This will show the panel when the 'showPanel' value is changed
        // and the new value is equal to the panelFactory.diagramTypes.THIRD_PARTY_SEGMENT
        panelFactory.validatePanel(scope, panelFactory.diagramTypes.THIRD_PARTY_TARGETING, init);

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
          scope.disableType = decisionTreeService.shouldDisableType(scope.decision);
          // and select the name input when opening the panel
          $timeout(function () {
            element.find('input').first().focus().select();
          });

          scope.name = {};
          scope.name.text = scope.decision.name;

          scope.ruleType = {};
          scope.ruleType.id = scope.decision.data.ruleType || 'yes-no';
          scope.provider = {};
          scope.provider.value = {};

          if(scope.decision.data.provider){
            scope.provider.value.id = scope.decision.data.provider;
          } else {
            scope.provider.value.id = null;
          }


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
              description = 'Default Audience'
            }
            decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
          }

          // set the vars that have been saved
          csb.params.advertiserID = scope.advertiser.value.id || csb.params.advertiserID;
          csb.params.advertiserName = scope.advertiser.value.name || csb.params.advertiserName;

          scope.decision.name = scope.name.text;

          scope.decision.data.ruleType = scope.ruleType.id;
          scope.decision.data.provider = scope.provider.value.id;
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
