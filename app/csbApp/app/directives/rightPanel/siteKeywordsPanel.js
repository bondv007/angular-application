/**
 * Created by rotem.perets on 2/8/15.
 */
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
      templateUrl: 'csbApp/app/directives/views/rightPanel/keywordsTargetingUI.html',
      link: function( scope, element, attrs ) {
        scope.csb = csb;
        // This will show the panel when the 'showPanel' value is changed
        // and the new value is equal to the panelFactory.diagramTypes.SITE_KEYWORDS
        panelFactory.validatePanel(scope, panelFactory.diagramTypes.SITE_KEYWORDS, init);

        function init() {

          scope.maxItems = 10;
          if(scope.decision.allRules && scope.decision.allRules.length){
            scope.decision.allRules.forEach(function(item){
              scope.maxItems -= item.rules.length;
            });
          }

          scope.originalDecision = angular.copy( scope.decision );
          scope.disableType = decisionTreeService.shouldDisableType(scope.decision);
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

        }
        function ContextualSiteKeywordsRule( data ) {
          this.exposure = data.exposure == 1 ? '' : '';
          this.type = scope.decision.type;
          this.name = data.name;
        }
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
        }

        scope.changeRuleType = function() {

          if ( scope.ruleType.id === 'yes-no' ) {
            scope.segments = [ scope.segments[0] ];
          }

        }
        scope.addRule = function() {
          scope.segments.push( { sites: [ {} ] } );
        }
        scope.addSite = function( segment ) {
          segment.sites.push( {} );
        }
        scope.removeSite = function( segment, index ) {
          segment.sites.splice( index, 1 );
        }
        scope.removeSegment = function( segments, index ) {
          scope.segmentsToDelete.push( index );
          segments.splice( index, 1 );
        }
        scope.cancelChanges = function() {
          scope.closePanel();
          scope.decision = scope.originalDecision;
        }
        scope.closePanel = function(){
          scope.closePanelUi();
          if(scope.maxItems <= 0){
            decisionTreeService.deleteDecision(scope.decision);
          } else {
            decisionTreeService.clearSelectedDecision();
            // if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
            if (!scope.decision.yesDecisions.length ) {
              decisionTreeService.deleteDecision( scope.decision );
            }
          }
        }
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
              if ( site.keywords == '' || site.keywords == undefined ) {
                scope.errorText += 'You have not finished filling out site or keyword information.';
              } else if(site.keywords.length >= 4000){
                scope.errorText += 'Your keywords phrase exceed the maximum allowed size of 4000 characters.';
              } else {
                var specialChars = "<>'\";:";
                for (var i = 0; i < specialChars.length; i++) {
                  if (site.keywords.indexOf(specialChars[i]) > -1) {
                    scope.errorText += 'You keywords contains unsupported characters.';
                    break;
                  }
                }
              }
            })
          });

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
            var label = '';
            var contextualRules = [];

            angular.forEach( segment.sites, function( site, i ) {
              var keywords = site.keywords.replace(/,/g,' OR ').replace(/&/g, ' AND ');
              var description = (site.site) ? site.site + ': ' + keywords : keywords;
              if ( site.additionalKeywords && site.additionalKeywords.length ) {
                description = '(' + description + ')' + ' and ' + site.additionalKeywords;
              }
              label += description;
              //i == segment.sites.length - 1 ? null : description += ' OR ';
              var rule = new ContextualSiteKeywordsRule({
                exposure: 2,
                name: description
              });
              if(i < segment.sites.length - 1){
                rule.logicalOperatorID = 'OR';
                label += ' OR ';
              }

              contextualRules.push(rule);

              if ( !site.additionalKeywords ) {
                site.additionalKeywords = '';
              }
            });

            //var siteRule = createRules( segment.sites, description );
            var siteRule = {
              rule: segment.sites,
              contextualRules: contextualRules,
              label: label
            };

            audienceSegments.push( siteRule );

          });

          angular.forEach( audienceSegments, function( audienceSegment, i ) {
            if ( scope.ruleType.id === 'yes-no' ) {
              if ( scopeYesDecisions.length ) {
                scope.decision.yesDecisions.push( scopeYesDecisions[0] );
                var taDecision = scope.decision.yesDecisions[0];
                decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, audienceSegment.rule , audienceSegment.contextualRules, null );
              }
              else {
                decisionTreeService.addAudienceSegment( scope.decision, audienceSegment.contextualRules[0].name, 'yes-decision', null, audienceSegment.rule, audienceSegment.contextualRules, null );
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

                    decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, audienceSegment.rule , audienceSegment.contextualRules, audienceSegment.label );
                    updated = true;
                  }
                });
              }
              // create a rule for each one that wasn't updated
              if ( !updated ) {
                decisionTreeService.addAudienceSegment( scope.decision, audienceSegment.label, 'yes-decision', null, audienceSegment.rule , audienceSegment.contextualRules, audienceSegment.label );
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
              description = 'Default Audience'
            }
            decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
          }


          scope.decision.name = scope.name.text;
          scope.decision.data.ruleType = scope.ruleType.id;
          scope.decision.data.segments = scope.segments;

          // don't remove
          decisionTreeService.buildAudienceSegmentsFromDiagram();

          scope.closePanelUi();

        }
      }
    }
  }
]);
