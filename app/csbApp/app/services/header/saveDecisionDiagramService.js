/**
 * Created by rotem.perets on 2/11/15.
 *
 * This factory holds all the common logic previously held by the header directives (mdx2).
 * we call it from both header directives (mdx2) and entity layout buttons (mdx3)
 */
app.factory('saveDecisionDiagramService', ['$q', '$timeout', 'mmModal', 'decisionTreeService',
  'csb', 'appService', 'strategies', 'targetAudiences', 'campaigns', 'advertisers', '$state',
  function ($q, $timeout, mmModal, decisionTreeService, csb, appService, strategies, targetAudiences, campaigns, advertisers, $state) {
    var pub = {};

    pub.saveToCampaign = function(scope){
      scope.button = {};
      scope.selected = {};
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
          campaigns.getCampaigns({ advertiserId: csb.params.advertiserID , strategy: true})
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
          // TODO: if added due to lack of support by server to execute this API. Replaced with the bellow
          if(csb.config.env == 'mdx2'){
            campaigns.getCampaigns({ accountId: csb.params.accountID, strategy:true })
              .then(function( response ) {
                scope.campaigns = response;
                if( scope.campaigns.length == 0 ) {
                  error('There are no campaigns available for your account.');
                }
              }
            )
          } else {
            campaigns.getUnAssignedCampaigns({ accountId: csb.params.accountID })
              .then(function( response ) {
                scope.campaigns = response;
                if( scope.campaigns.length == 0 ) {
                  error('There are no campaigns available for your account.');
                }
              }
            )
          }
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

      scope.modalInstance = mmModal.open({
        templateUrl: './csbApp/app/views/ui/modal-save-decision-diagram-and-target-audiences.html',
        scope: scope,
        title: (scope.campaignID) ? "Save your Campaign" : "Save to Campaign",
        modalWidth: 550,
        bodyHeight: 350,
        confirmButton: { name: "Save", funcName: "doSaveToCampaign", hide: false, isPrimary: true},
        discardButton: { name: "Cancel", funcName: "closeAndCancelSaveToCampaign"}
      });

      /**
       * Closes the modal
       */
      scope.closeAndCancelSaveToCampaign = function() {
        scope.campaign = null;
        scope.modalInstance.dismiss();
      };

      /**
       * When we select a campaign this will get and set a few vars
       */
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
       * Save everything
       */
      scope.doSaveToCampaign = function() {

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

        if(scope.tas.delete && scope.tas.delete.length > 0){
          removeOldTargetAudiences( scope.tas.delete ).then(
              function() {
                createAndThenUpdateTargetAudiences();
              },
              function() {
                error('One of the Target Audiences that you attempted to unassociate with the strategy cannot be deleted. Because of this we are going to revert your strategy back to a safe state.')
                // the deletes failed so we need to set the diagram back to a safe state
                $timeout(function() {
                  decisionTreeService.decisions = decisionTreeService.original;
                }, 3000 );
              });
        } else {
          createAndThenUpdateTargetAudiences();
        }
      };

      function createAndThenUpdateTargetAudiences(){
        if(scope.tas.save && scope.tas.save.length > 0){
          targetAudiences.saveTargetAudiences( scope.tas.save ).then(function( saveResponse ) {
            updateTargetAudiences(saveResponse.tas, saveResponse.error);
          }, error );
        } else {
          updateTargetAudiences([], "");
        }
      }

      function updateTargetAudiences(newTAs, saveError){
        var tas;

        if(scope.tas.update && scope.tas.update.length > 0){
          // then update the TAs I need to update
          targetAudiences.updateTargetAudiences( scope.tas.update ).then(function( updateResponse ) {
            var existingTAs = updateResponse.tas;
            // combine the Save and Update TA's
            tas = newTAs.concat(existingTAs);
            onServerResponse(tas, saveError, updateResponse.error);
          });
        } else {
          onServerResponse(newTAs, saveError, "");
        }
      }

      function onServerResponse(tas, saveError, updateError){
        // empty before setting
        appService.csbData.targetAudienceIDs = [];
        setTargetAudienceIDsOnDiagramAndCreateTAsObjectForDiagram( tas, decisionTreeService.decisions, scope.campaignID );

        //and finally save or update the diagram
        if ( csb.params.diagramID && appService.selectedStrategy.template == false ) {
          strategies.updateStrategy()
              .then(function( strategy ) {
                finishSave( strategy, saveError += updateError );
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
            finishSave( strategy, saveError += updateError );
          }, function( errorData ) {
            error( errorData );
          });
        }
      }

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
console.log(strategy);
        scope.saving = false;
        scope.button.save = "Saved";

        if ( saveError ) {
          error( saveError );
        } else {
          csb.params.diagramID = strategy.id;
          decisionTreeService.setOriginalDecisions();
          scope.modalInstance.dismiss();
        }

        // timeout because it breaks binding otherwise (like "saving..." text for button)
        $timeout(function() {
          var isMdx2 = csb.config.env == 'mdx2';
          var result = (isMdx2) ? { data: strategy } : strategy;
          scope.setStrategyVars(result);
          if(!isMdx2){
            $state.go('spa.strategy.strategyEdit', {strategyId: strategy.id});
          }
        }, 200 );
      };

      /**
       * Removes TA's that no longer are part of the diagram
       * @param newtas
       * @param oldtas
       */
      function removeOldTargetAudiences( tas ) {

        var deletes = [];

        angular.forEach( tas, function( ta ) {
          deletes.push( targetAudiences.deleteTargetAudience( ta.TargetAudienceID ) );
        });

        return $q.all( deletes );

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
              // have to compare the values with the campaign ID appended to the name that comes from the diagram
              if (decision.clientRefId == ta.clientRefId) {

                // set the ID on the decision diagram
                decision.targetAudienceID = ta.id;
                decision.name = ta.name;

                // push the TA ID's and contextual data to array
                appService.csbData.targetAudienceIDs.push({
                  TargetAudienceID: decision.targetAudienceID,
                  TargetAudienceName: ta.name,
                  Rules: decision.allRules,
                  clientRefId: decision.clientRefId
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

    pub.saveToTemplate = function(scope){
      // stop if the diagram is empty.. not even going to open the modal
      if ( !decisionTreeService.decisions.length || decisionTreeService.decisions[0].yesDecisions.length == 0) {
        return false;
      }

      scope.modalInstance = mmModal.open({
        templateUrl: './csbApp/app/views/ui/modal-save-decision-diagram-as-template.html',
        scope: scope,
        title: "Save your Decision Diagram template",
        modalWidth: 550,
        bodyHeight: 130,
        confirmButton: { name: "Save", funcName: "save", hide: false, isPrimary: true},
        discardButton: { name: "Cancel", funcName: "close"}
      });

      scope.decisionDiagram.name = '';
      scope.saveButtonText = 'Save';

      // closes the modal
      scope.close = function() {
        scope.saveErrorText = null;
        scope.decisionDiagram.name = null;
        scope.modalInstance.dismiss();
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

        strategies.saveStrategy({ template: true, name: scope.decisionDiagram.name })
            .then(function(response) {
              var data = (csb.config.env == 'mdx3') ? response : { data: response };
              // add to the templates and set this strategy as the selected one
              // TODO: at this point the yes and no decisions are not set (BUG)
              scope.templates.push(angular.copy(response));
              scope.setStrategyVars(data);

              scope.saveButtonText = 'Saved';
              scope.saving = false;
              scope.modalInstance.dismiss();

            },
            function( error ) {

              scope.saving = false;
              scope.saveButtonText = 'Save';
              scope.saveErrorText = error;

            }
        );
      }
    }
    return pub;
  }]);
