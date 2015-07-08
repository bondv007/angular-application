app.factory('decisionTreeService', [ '$http', '$q', 'csb', 'mmUtils',
  function ($http, $q, csb, mmUtils) {

    function ContextualTargetAudienceRule(data) {
      this.exposure = data.exposure == 1 ? 'Exposed to' : 'Not Exposed to';
      this.type = data.type;
      this.name = data.name;
      this.logicalOperatorID = data.logicalOperatorID == 1 ? 'AND' : 'OR';
    };

    function RetargetingRule(data) {
      this.RetargetingID = data.RetargetingID;                            // default is NULL
      this.AdvertiserID = data.AdvertiserID;                              // The selected Advertiser id
      this.TargetingTagID = data.TargetingTagID;                          // The Tag ID
      this.TargetingTagValues = data.TargetingTagValues;                // The custom value ID?
      this.TargetingLogicalOperatorID = data.TargetingLogicalOperatorID;  // AND = 1, OR = 2
      this.TargetingViewerID = data.TargetingViewerID;                    // Expose to = 1, Not Exposed to = 2
      this.TargetAudienceID = data.TargetAudienceID;                      // default is NULL
      this.OrderID = data.OrderID;                                        // The order priority?
      this.tagOrdinal = data.tagOrdinal;
      this.RetargetingTagWindow = data.RetargetingTagWindow;              // The number of days the cookie is valid for
    };

    var pub = {};

    // mock model
    pub.decisions = [];

    // will be used to track changes made by the user in the UI
    pub.original = [];

    // current selected decision
    pub.selectedDecision = null;

    pub.addDecision = function (currentDecision, data) {

      switch (data.decisionType) {
        case "no-decision":
          pub.addNoDecision(currentDecision, data);
          break;

        default:
          pub.addYesDecision(currentDecision, data);
      }
    };

    pub.updateDecision = function (currentDecision, data) {

      if (currentDecision && data) {
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
    pub.addYesDecision = function (currentDecision, data) {
      data.decisionType = 'yes-decision';
      var decision = csb.createDecision(data);
      currentDecision.yesDecisions.push(decision);
    };

    pub.addNoDecision = function (currentDecision, data) {
      data.decisionType = 'no-decision';
      var decision = csb.createDecision(data);
      currentDecision.noDecisions.push(decision);
    };

    // delete the current decision and change it back to a Target Audience segment
    pub.deleteDecision = function (decision) {

        /*
         * This function will allow to remove the iconCollection items that each child decision
         * may have so that when removing a decision all the icons go away
         */
        var traverseYesDecisionsToRemoveIcons = function (decisions) {

            decisions.forEach(function(decision) {
                if (decision.yesDecisions.length) {
                    traverseYesDecisionsToRemoveIcons(decision.yesDecisions);
                }
            });

        };

      if (decision.type != 'Audience Segment') {

        // first we need to traverse down the no branches to see if we find a TA ID
        // We will later assign the ID to this decision so that it will update (the no branch siblings will match this rule).
        var targetAudienceNoPath = getTargetAudienceIDandNameFromNoSiblings(decision);

        // before 'detaching' the children decisions, the iconCollection arrays should be cleaned up
        traverseYesDecisionsToRemoveIcons(decision.yesDecisions);

        decision.yesDecisions = [];
        decision.noDecisions = [];
        decision.type = 'Audience Segment';
        delete decision.data;
        delete decision.geoType;
        delete decision.icon;

        if (pub.decisions[0].yesDecisions.length == 0) {
          pub.decisions = [];
        }

        // setting the TA ID if found in the no path
        if (targetAudienceNoPath.targetAudienceID) {
          decision.targetAudienceID = targetAudienceNoPath.targetAudienceID;
        }

        // if a custom name has been set on the no path we will bring it's name and custom name flag as well
        if (targetAudienceNoPath.customName) {
          decision.name = targetAudienceNoPath.targetAudienceName;
          decision.customName = targetAudienceNoPath.customName;
        }

        // and also setting the name from the no path
//                decision.name = targetAudienceNoPath.targetAudienceName;
        pub.buildAudienceSegmentsFromDiagram(csb.params.campaignId);

      }

      function getTargetAudienceIDandNameFromNoSiblings(decision) {

        var targetAudienceID,
            targetAudienceName,
            customName;

        var traverseNoDecisions = function (decisions) {

          decisions.forEach(function (decision) {

            if (decision.noDecisions.length) {
              traverseNoDecisions(decision.noDecisions);
            }

            if (decision.type == 'Audience Segment') {
              if (decision.targetAudienceID) {
                targetAudienceID = decision.targetAudienceID;
              }
              targetAudienceName = decision.name;
              customName = decision.customName;
            }

          });

        }

        if (decision.noDecisions) {
          traverseNoDecisions(decision.noDecisions);
        }

        return {
          targetAudienceID: targetAudienceID,
          targetAudienceName: targetAudienceName,
          customName: customName
        };

      };

    };

    pub.removeAllChildDecisions = function (decision) {
      decision.yesDecisions = [];
      decision.noDecisions = [];
    }

    // set the current selected decision
    pub.setSelectedDecision = function (decision) {
      pub.selectedDecision = decision;
    };

    // clear the current selected decision
    pub.clearSelectedDecision = function () {
      pub.selectedDecision = null;
    };

    pub.addGeoAudienceSegment = function (currentDecision, data, label, multi) {

      // chaining the rules together
      if (currentDecision.parentType) {
        if (currentDecision.description != 'Default Audience') {
          if (multi) {
            data.description = currentDecision.description + ' ' + currentDecision.name + ' = ' + data.description
          }
          else {
            data.description = currentDecision.description + ' ' + currentDecision.name
          }

        }
      }

      var decisionData = {
        name: data.description.substring(0, 90),
//                description: data.description,
//                description: currentDecision.name + multi ? '=' + data.description : '',
        description: data.description,
        type: 'Audience Segment',
        parentType: currentDecision.type,
        decisionType: data.decisionType,
        targetAudienceContextualData: data.targetAudienceData,
        rules: [],
        label: label
      };

      if (data.rules) {
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
    pub.addAudienceSegment = function (currentDecision, description, decisionType, targetAudience, rules, targetAudienceData, label) {
      var data = {
        name: description.substring(0, 90),
        description: description,
        type: 'Audience Segment',
        parentType: currentDecision.type,
        decisionType: decisionType,
        targetAudienceContextualData: targetAudienceData,
        label: label
      };

      // if the parent has a TA ID (meaning it was an audience segment we dropped the decision on and are now saving), then we need to pass
      // that TA ID to the no branch
      if (currentDecision.targetAudienceID && decisionType == 'no-decision') {
        data.targetAudienceID = currentDecision.targetAudienceID;
      }

      if (rules) {
        data.rules = [];
        data.rules.push(rules);
      }
      // IMPORTANT: Must pass a rules array for the TA view data to be generated
      else {
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
    pub.updateAudienceSegment = function (targetAudienceDecision, name, description, retargetingRules, targetAudienceData, label) {
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

      if (retargetingRules) {
        data.rules = [];
        data.rules.push(retargetingRules);
      }
      else {
        data.rules = [];
      }

      pub.updateDecision(targetAudienceDecision, data);
    };

    pub.createRule = function (rule, decision, logicalOperator, retargetingID, targetAudienceID, orderID) {
      var data = {};
      data.RetargetingID = retargetingID || null;                  // default is NULL
      data.AdvertiserID = csb.params.advertiserID;                   // The selected Advertiser id
      data.TargetingTagID = rule.details.id;                                      // The Tag ID
      data.TargetingTagValues = rule.selectedTagValues ? rule.selectedTagValues : null;                // The custom value ID?
      data.TargetingLogicalOperatorID = logicalOperator.id || 1;    // AND = 1, OR = 2, Default is 1?
      data.TargetingViewerID = rule.exposure.id;                                 // Expose to = 1, Not Exposed to = 2
      data.TargetAudienceID = targetAudienceID || null;         // default is NULL
      data.OrderID = orderID == null ? 0 : orderID;                               // The order priority?
      data.RetargetingTagWindow = decision.data.selectedDay ? decision.data.selectedDay : -1;  // The number of days the cookie is valid for
      data.tagOrdinal = rule.details.tagOrdinal;

      var targetingRule = new RetargetingRule(data);
      return targetingRule;
    };

    pub.createContextualRule = function (rule, decision, logicalOperator) {
      var tarule = {};
      tarule.exposure = rule.exposure.id;
      tarule.type = decision.type;
      tarule.name = rule.details.name;
      tarule.logicalOperatorID = logicalOperator.id;

      if (rule.selectedTagValues.length) {
        var tagValueArray = [];
        angular.forEach(rule.selectedTagValues, function (rule) {
          tagValueArray.push(rule.name);
        });
        tarule.name += ' (' + tagValueArray.join(', ') + ')';
      }

      var targetAudienceRule = new ContextualTargetAudienceRule(tarule);
      return targetAudienceRule;

    };

    pub.createTargetAudienceData = function (decisionType, description, retargetingRules, targetAudienceData) {
      var taDecision = {};
      taDecision.decisionType = decisionType;
      taDecision.name = description;
      taDecision.description = description;
      taDecision.retargetingRules = retargetingRules;
      taDecision.targetAudienceData = targetAudienceData;

      return taDecision;
    };


    pub.removeAdvertiserIfNeeded = function () {

      var advertiserDecisionFound = false;

      removeAdvertiserIfNeeded(pub.decisions);

      function removeAdvertiserIfNeeded(decisions) {

        angular.forEach(decisions, function (decision) {

          if (decision.type == 'Static Retargeting' || decision.type == 'Audience Manager') {
            advertiserDecisionFound = true;
          }

          if (decision.yesDecisions.length) {
            removeAdvertiserIfNeeded(decision.yesDecisions);
          }

          if (decision.noDecisions.length) {
            removeAdvertiserIfNeeded(decision.noDecisions);
          }

        });

        if (advertiserDecisionFound == false && !csb.params.campaignID) {
          csb.params.advertiserID = null;
          csb.params.advertiserName = null;
        }
      };
    };

    /**
     * Builds the Target Audience Object that we actually send to the server
     * @returns {{TargetAudienceInfoList: Array}}
     */
    pub.buildTargetAudienceObjectToSave = function (campaignId, currentTas) {

      var segmentArray = pub.audienceSegmentArray;
      var error = '';

      //create the save object
      var saveObject = [];

      //create the update object
      var updateObject = [];

      build(segmentArray.new, saveObject);
      build(segmentArray.existing, updateObject);

      function build(segments, object) {

        // first we are going to loop over each array which will equal one segment
        for (var i = 0; i < segments.length; i++) {

          var segmentRules = segments[i].rules;

          var targetAudience = {
            type: 'TargetAudience',
            id: segments[i].targetAudienceID ? segments[i].targetAudienceID : undefined,
            accountId: csb.params.accountID,
            name: segments[i].name,
            targetingItems: [],
            campaignId: campaignId || csb.params.campaignID,
            clientRefId: segments[i].clientRefId
          }

          // objects to hold the targeting data
          var geo = {type: 'GeoTargeting' },
              retargeting = {type: 'Retargeting', advertiserId: csb.params.advertiserID, retargetingViewers: [] },
              thirdParty = {type: '3rdPartyTargeting', advertiserId: csb.params.advertiserID },
              contextual = {type:'ContextualTargeting', subCategoriesIds: [] },
              siteKeywords = {type: 'SiteKeywordTargeting', siteKeywords: [] };

          if(csb.config.env == 'mdx2'){
            geo = csb.addTypeParam(geo, 'GeoTargetingInfoV2:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.Geo');
            retargeting = csb.addTypeParam(retargeting, 'RetargetingInfoV2:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.ReTargeting');
            thirdParty = csb.addTypeParam(thirdParty, 'ThirdPartyTargetingInfo:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.Dmp');
            contextual = csb.addTypeParam(contextual, 'ContextualTargetingInfoV2:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.ContextualTargeting');
            siteKeywords = csb.addTypeParam(siteKeywords, 'SiteKeywordTargeting:#MediaMind.InternalAPI.DataContract.CSB.TargetAudience.KeyWordTargeting');
          }

          var includeGeo = false,
              includeRetargeting = false,
              includeThirdParty = false,
              includeContextual = false,
              includeSiteKeywords = false;

          // loop over each of the segments rules so we can manipulate them and put them where they need to be
          angular.forEach(segmentRules, function (segmentRule) {

            if (segmentRule.type == 'Contextual Targeting') {

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
            if (segmentRule.type == 'Geo Targeting') {

              angular.forEach(segmentRule.rules, function (rule) {
                for (var property in rule) {
                  if (rule[ property ]) {
                    if (!geo[ property ]) {
                      geo[ property ] = [];
                    }
                    geo[ property ].push(rule[ property ]);
                  }
                  else {
                    rule[ property ] = null;
                  }
                }
              });

              includeGeo = true;

            }

            // do some translation of the static retargeting rules
            // also does some validation on checking how many rules are in the segment
            if (segmentRule.type == 'Static Retargeting') {

              angular.forEach(segmentRule.rules, function (rule) {

                var tagValues = [];
                if (rule.TargetingTagValues) {
                  angular.forEach(rule.TargetingTagValues, function (tag, i) {
                    tagValues.push(tag.id);
                  });
                }

                retargeting.retargetingViewers.push({
                  type: "RetargetingViewer",
                  tagId: rule.TargetingTagID,
                  tagOrdinal: rule.tagOrdinal,
                  values: tagValues,
                  viewerExpose: rule.TargetingViewerID == 1 ? "EXPOSE_TO" : "NOT_EXPOSED_TO",
                  logicalOperator: rule.TargetingLogicalOperatorID == 1 ? "AND" : "OR"
                });

                // TODO: for now this keeps getting reset until the last segment because each rule uses it's own cookie age
                // it should be 1 per rule path instead
                retargeting.cookieAge = rule.RetargetingTagWindow;

              });

              if (retargeting.retargetingViewers.length > 15) {
                error += ' You have more than 15 retargeting rules. Please limit to 15 or less.'
              }

              includeRetargeting = true;

            }

            // create the rule for the audience manager
            // we only allow there to be one 3rd party segment so if the data is already set
            // we will throw an error that there are too many third party segments (probably needs a more elegant solution)
            if (segmentRule.type == 'Audience Manager') {

              if (thirdParty.segmentRule) {
                error += ' You have more than one third party targeting rule in a segment path. You may only have one.';
              }

              angular.forEach(segmentRule.rules, function (rule) {
                thirdParty.dataProviderId = rule.Provider;
                thirdParty.segmentRule = rule.Segments;
              });

              includeThirdParty = true;

            }


            if (segmentRule.type == 'Site Keywords') {

              siteKeywords.siteKeywords = segmentRule.rules;
              includeSiteKeywords = true;

            }


          });

          includeContextual ? targetAudience.targetingItems.push(contextual) : null;
          includeGeo ? targetAudience.targetingItems.push(geo) : null;
          includeThirdParty ? targetAudience.targetingItems.push(thirdParty) : null;
          includeRetargeting ? targetAudience.targetingItems.push(retargeting) : null;
          includeSiteKeywords ? targetAudience.targetingItems.push(siteKeywords) : null;

          // push the segment model to the target audience info list so we have a complete object to send off to save
          if (segmentRules.length) {
            object.push(targetAudience);
          }


        }
      }


      /**
       * This gets the TA's that need to be deleted because they aren't associated with the diagram anymore
       * @type {Array}
       */
      var deleteArray = [];

      if (segmentArray.existing.length) {

        for (var g = 0; g < currentTas.length; g++) {

          var oldTA = currentTas[g];
          var foundMatch = false;

          for (var i = 0; i < segmentArray.existing.length; i++) {
            var newTA = segmentArray.existing[i];

            if (oldTA.TargetAudienceID == newTA.targetAudienceID) {
              foundMatch = true;
            }
          }

          if (foundMatch == false) {
            // it wasnt matched in our TAs so it must be an old one that needs to be unnatched from its DG
            deleteArray.push(oldTA);
          }
        }
        ;

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
    pub.buildAudienceSegmentsFromDiagram = function (campaignID) {

      var targetAudiences = {
        new: [],
        existing: [],
        error: ''
      }

      if (pub.decisions.length) {
        getDecisionsByRecursion(pub.decisions);
      }

      function addItemToIcons(icons, type){
        var newIcons, shouldAdd = true;
        if(!icons){
          newIcons = [];
        } else{
          newIcons = icons.slice();
        }

        newIcons.forEach(function(icon){
          if(icon == type){
            shouldAdd = false;
          }
        });

        if(shouldAdd){
          newIcons.push(type);
        }

        return newIcons;
      }

      function getDecisionsByRecursion(decisions, passedRules, passedName, icons, xCounter, yCounter, isYesDecision) {
        var isFirst = true;
        if(xCounter === undefined){
          xCounter = 0;
          yCounter = 0;
          isYesDecision = true;
        }

        decisions.forEach(function (decision) {
          if(!isFirst){
            (isYesDecision) ? yCounter++ : xCounter++;
          } else {
            isFirst = false;
          }
          decision.clientId = 'decision_' + xCounter.toString() + '_' + yCounter.toString();

          if(!decision.clientRefId) decision.clientRefId = mmUtils.clientIdGenerator.next();


          var newIcons;
          var rules = passedRules || [];
          var name = passedName || '';
          rules = rules.slice();
          if (decision.rules) {

            decision.allRules = null;

            // if there are rules, push them into the rules array
            decision.rules.forEach(function (rule) {

              // create a new rule instead of using rule above so we can stick it into an object ( ruleCopy.rules )
              var ruleCopy = {};
              ruleCopy.rules = rule;
              ruleCopy.type = decision.parentType;
              ruleCopy.tarules = decision.targetAudienceContextualData;

              rules.push(ruleCopy);

            });
          }

          // now check if there are any nodes(decisions) to loop over
          if (decision.yesDecisions.length > 0 && decision.type != 'Audience Segment') {
            // cleaning up from previous times building TAs.. I want to strip out "allRules" so they are only on the very last node
            decision.targetAudienceID = null;
            if (decision.allRules) {
              delete decision.allRules;
            }
            // cleaning up the customName flag as well
            if (decision.customName) {
              delete decision.customName;
            }

            // assign the name var so we don't change the original
            var yesPathName = name;

            // add the label if we have it
            if (decision.label) {
              yesPathName = yesPathName + ' = ' + decision.label;
            }

            // then add the name.. use the & if it's not the first decision
            yesPathName == '' ? yesPathName += decision.name : yesPathName += ' & ' + decision.name;
            newIcons = addItemToIcons(icons, decision.type);
            xCounter++;

            // loop over them again, passing in the rules array that was used to build rules
            getDecisionsByRecursion(decision.yesDecisions, rules.slice(), yesPathName, newIcons, xCounter, yCounter, true);
          }
          if (decision.noDecisions.length > 0 && decision.type != 'Audience Segment') {
            // cleaning up from previous times building TAs.. I want to strip out "allRules" so they are only on the very last node
            decision.targetAudienceID = null;
            if (decision.allRules) {
              delete decision.allRules;
            }
            // cleaning up the customName flag as well
            if (decision.customName) {
              delete decision.customName;
            }

            // assign the name var so we don't change the original
            var noPathName = name;

            // add the label if we have it
            if (decision.label) {
              noPathName = noPathName + ' = ' + decision.label;
            }

            // then add the name with 'No_' prepended (since we didn't match it)
            noPathName == '' ? noPathName += 'No_' + decision.name : noPathName += ' & No_' + decision.name;
            yCounter++;
            xCounter--;

            // loop over them again, passing in the rules array that was used to build rules
            getDecisionsByRecursion(decision.noDecisions, rules.slice(), noPathName, icons, xCounter, yCounter, false);
          }
          if (decision.type == 'Audience Segment') {
            decision.icons = icons;
            // add it to the audience segments.. by value (slice).. only if there are actual rules to push in
            // false means it's probably the default node
            if (rules.length) {

              if (decision.label) {
                name = name + ' = ' + decision.label;
              }

              // adding the data to the actual tree data so I can display it
              decision.allRules = rules.slice();

              // decide which.. new or existing
              // first we will check is there is an ID
              if (decision.targetAudienceID) {

                targetAudiences.existing.push({
                  name: decision.name,
                  targetAudienceID: decision.targetAudienceID,
                  clientRefId: decision.clientRefId,
                  rules: rules.slice()
                });

              }

              else {
                decision.name = ( decision.customName ? decision.name : name ).substring(0, 90);

                targetAudiences.new.push({
                  name: decision.name,
                  clientRefId: decision.clientRefId,
                  rules: rules.slice()
                });

              }

            }

            else {
              // get the default audience name so that we can display it in the modal
              // although this TA never gets saved. It's just to show the name and has a message
              // notifying the user that it will not be saved
              decision.name = ( decision.customName ? decision.name : 'Default Audience' ).substring(0, 90);
              pub.defaultTargetAudienceName = decision.name;
            }

          }
          if (decision.type != 'Audience Segment' && !decision.yesDecisions.length && !decision.noDecisions.length) {
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
    pub.setOriginalDecisions = function () {
      angular.copy(pub.decisions, pub.original);
    };

    /***
     * If the current decision has grandchildren the type drop down should be disabled.
     * TODO: this is a temp fix till we support type changing in the middle of the diagram
     * @param decision
     * @returns {boolean}
     */
    pub.shouldDisableType = function(decision){
      var disableType = false;
      if(decision && decision.yesDecisions && decision.yesDecisions.length){
        if(decision.yesDecisions.length > 1){
          decision.yesDecisions.forEach(function(item){
            if (item.yesDecisions && item.yesDecisions.length > 0){
              disableType = true;
            }
          });
        } else if (decision.yesDecisions[0] && decision.yesDecisions[0].yesDecisions){
          disableType = decision.yesDecisions[0].yesDecisions.length > 0;
        }
      }
      return disableType;
    }

    return pub;
  }
]);
