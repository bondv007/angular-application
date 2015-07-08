/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('geoTargetingPanel', [ 'panelFactory', 'geo', 'decisionTreeService', '$timeout', 'segmentsFactory', 'csb', 'enums', 'geoTypes', 'ruleFactory', 'mmModal',
  function (panelFactory, geo, decisionTreeService, $timeout, segmentsFactory, csb, enums, geoTypes, ruleFactory, mmModal) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        decision: '=',
        showPanel: '=',
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/geoTargetingUI.html',
      link: function (scope, element, attrs) {
        var watcher;
        scope.geoModel = {selectedGeo: {}, gridAddedGeos: [], gridSelectedGeos: []};
        scope.gridButtonActions = [
          {
            name: "Remove Selected",
            func: function(){
              if (scope.geoModel.gridSelectedGeos.length > 0) {
                var index = scope.geoModel.gridSelectedGeos.length - 1;
                while (index >= 0) {
                  var itemToDelete = scope.geoModel.gridSelectedGeos[index];
                  scope.geoModel.gridAddedGeos.splice(scope.geoModel.gridAddedGeos.indexOf(itemToDelete), 1);
                  scope.geoModel.gridSelectedGeos.splice(index, 1);
                  index--;
                }
              }
            },
            isDisable: false
          }
        ];
        scope.csb = csb;
        scope.geoGrid = {
          columns: [
            { field: 'title', displayName: 'Location', gridControlType: enums.gridControlType.getName("Label") },
            { field: 'typeName', displayName: 'Type', gridControlType: enums.gridControlType.getName("Label") }
          ]};
        scope.geoDataSource = {
          country: {dataSource: [] },
          state: {dataSource: [], geoFilter: 'states' },
          city: {dataSource: [], geoFilter: 'cities', geoRestPath: 'cities' },
          nielsen: {dataSource: [], geoFilter: 'dma', geoRestPath: 'dmas' },
          areaCode: {dataSource: [], geoFilter: 'areaCode', geoRestPath: 'areaCodes' },
          postalCode: {dataSource: [], geoFilter: 'postalCode' },
          isp: {dataSource: [], geoFilter: 'isp', geoRestPath: 'isps' }
        }
        scope.geoTypeEnum = [
          {id: 'country', name: 'Country'},
          {id: 'state', name: 'State'},
          {id: 'city', name: 'City'},
          {id: 'nielsen', name: 'Nielsen'},
          {id: 'areaCode', name: 'Area Code'},
          {id: 'postalCode', name: 'Postal Code'},
          {id: 'isp', name: 'ISP'}
        ];

        panelFactory.validatePanel(scope, panelFactory.diagramTypes.GEO_TARGETING, init);

        function init() {
          scope.geoGrid = {
            columns: [
              { field: 'title', displayName: 'Location', gridControlType: enums.gridControlType.getName("Label") },
              { field: 'typeName', displayName: 'Type', gridControlType: enums.gridControlType.getName("Label") }
            ]};
          scope.errorText = '';
          scope.decision.data = scope.decision.data || {};
          scope.originalDecision = angular.copy(scope.decision);
          scope.disableType = decisionTreeService.shouldDisableType(scope.decision);
          scope.name = {text: scope.decision.name};
          scope.geoIndex = {};
          scope.ruleType = {id: scope.decision.data.ruleType || 'yes-no'};
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

          scope.geoObj = {selectedGeoType: 'country', selectedCountry: '', selectedState: '', selectedPostalCodes: ''};
          scope.geoModel.gridAddedGeos = [];
          for (var key in geoTypes) {
            var geoData = scope.decision.data[geoTypes[key].dataEntityType];
            if (geoData) {
              geoData.forEach(function (item) {
                scope.geoModel.gridAddedGeos.push(item);
              });
            }
          }

          $timeout(function () {
            element.find('input').first().focus().select();
          });

          geo.getGeo('countries').then(function (entities) {
            scope.geoDataSource.country.dataSource = entities;
            scope.originalCountries = entities;
          });
        };
        function GeoRule(data) {
          this.countries = data.countries || null;
          this.regions = data.regions || null;
          this.cities = data.cities || null;
          this.areaCodes = data.areaCodes || null;
          this.nielsenDMAs = data.nielsenDMAs || null;
          this.zipCodes = data.zipCodes || null;
          this.isps = data.isps || null;
        };
        function ContextualGeoRule(data) {
          this.exposure = data.exposure == 1 ? 'From' : 'Not from';
          this.type = scope.decision.type;
          this.name = data.name;
          this.logicalOperatorID = data.logicalOperatorID == 1 ? 'AND' : 'OR';
        };

        scope.save = function () {
          var rules = [];
          scope.decision.data.ruleType = scope.ruleType.id;
          // Create decision rules for each of the geo categories. Used in:
          // 1) TA description
          // 2) Diagram labels
          // 3) Panel initialization once its reopened
          if (scope.geoModel.gridAddedGeos.length) {
            ruleFactory.createGeoRulesMDX(rules, scope.geoModel.gridAddedGeos, scope.decision.type);

            for (var key in geoTypes) {
              scope.decision.data[geoTypes[key].dataEntityType] = [];
            }

            scope.geoModel.gridAddedGeos.forEach(function (geo) {
              scope.decision.data[geoTypes[geo.type].dataEntityType].push(geo);
            });
          }

          scope.errorText = '';
          // now we can do some validation
          if (!rules.length) {
            scope.errorText += 'You have not selected any geo options. ';
          }
          if (!scope.name.text) {
            scope.errorText += 'You must enter a name. ';
          }
          if (scope.errorText) {
            return false;
          }

          // copy the decisions first
          // we need to clear out the decisions so that we don't have any unncessary paths (for instance if we remove a rule)
          var scopeYesDecisions = angular.copy(scope.decision.yesDecisions);
          scope.decision.yesDecisions = [];

          /**
           * SAVE FOR YES-NO DECISIONS
           * if the decision is yes-no, we will combine all data into one TA
           */
          if (scope.ruleType.id == 'yes-no') {

            // create some vars to push to
            var taDescription = '';
            var taRules = [];
            var taData = [];

            // loop over the audience segments array (created from each of the tabs)
            angular.forEach(rules, function (rule, i) {

              // create the description by stringing together the descriptions
              taDescription += rule.description + ( i < rules.length - 1 ? ' - ' : '');

              // push the rules
              taRules.push(rule.targetingRule);

              // push the contextual data
              taData.push(rule.contextualTargetingRule);

            });

            // now create the object that we can pass to the addGeoAudienceSegment function
            var decisionData = {
              description: taDescription,
              decisionType: 'yes-decision',
              targetAudienceData: taData,
              rules: taRules
            };

            // we will update it if yes decisions already exist
            if (scopeYesDecisions && scopeYesDecisions.length == 1) {
              scope.decision.yesDecisions.push(scopeYesDecisions[0]);
              var taDecision = scope.decision.yesDecisions[0];
              decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, decisionData.rules, decisionData.targetAudienceData);
            }

            // otherwise we are going to create a new TA
            else {
              // and finally create the audience segment
              decisionTreeService.addGeoAudienceSegment(scope.decision, decisionData);

            }
          }
          /**
           * SAVE FOR MULTIPLE CHOICE DECSISION
           * we will create a target audience for each possible rule
           */
          else {

            angular.forEach(rules, function (rule) {

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
              if (scopeYesDecisions.length) {
                angular.forEach(scopeYesDecisions, function (decision, i) {
                  if (angular.equals(decision.rules, [ decisionData.rules ])) {
                    scope.decision.yesDecisions.push(decision);
                    var taDecision = scope.decision.yesDecisions[ scope.decision.yesDecisions.length - 1];
                    decisionTreeService.updateAudienceSegment(taDecision, taDecision.name, taDecision.description, decisionData.rules, decisionData.targetAudienceData, decisionData.label);
                    updated = true;
                  }
                });
              }

              // create a rule for each one that wasn't updated
              if (!updated) {
                decisionTreeService.addGeoAudienceSegment(scope.decision, decisionData, decisionData.label, true);
              }


            });

          }

          /**
           * ALWAYS CREATING A NO DECISION IF IT DOESN'T EXIST YET
           */
          if (scope.decision.noDecisions.length == 0) {
            var description;
            if (scope.decision.parentType) {
              description = scope.decision.description;
            }
            else {
              description = 'Default Audience'
            }
            decisionTreeService.addAudienceSegment(scope.decision, description, 'no-decision', null);
          }

          scope.decision.name = scope.name.text;

          // don't remove
          decisionTreeService.buildAudienceSegmentsFromDiagram();
          scope.closePanel();
        };
        scope.closePanel = function () {
          scope.closePanelUi();
          decisionTreeService.clearSelectedDecision();

        };
        scope.cancelChanges = function () {
          scope.closePanel();
          scope.model = angular.copy(scope.model);
          // if the decision doesn't have any branches yet, we will just go ahead and delete the decision when we cancel the panel
          if (!scope.decision.yesDecisions.length) {
            decisionTreeService.deleteDecision(scope.decision);
          }
        }
        scope.generateGeoTitle = function (data) {
          data.type = scope.geoObj.selectedGeoType;
          return data.geoItemName;
        }
        scope.getCountriesByGeoType = function () {
          if (scope.geoObj.selectedGeoType == 'country') {
            scope.geoDataSource.country.dataSource = scope.originalCountries;
          } else {
            var filterObj = { type: scope.geoDataSource[scope.geoObj.selectedGeoType].geoFilter };
            geo.getGeo('countries', filterObj).then(function (entities) {
              scope.geoDataSource.country.dataSource = entities;
            });
          }
        }
        scope.pickStateByCountry = function () {
          switch (scope.geoObj.selectedGeoType) {
            case 'state':
            case 'city':
            case 'nielsen':
            case 'areaCode':
              var filterObj = { countryId: scope.geoObj.selectedCountry };
              if (scope.geoObj.selectedGeoType != 'state') {
                filterObj.type = scope.geoDataSource[scope.geoObj.selectedGeoType].geoFilter;
              }

              geo.getGeo('states', filterObj).then(function (states) {
                scope.geoDataSource.state.dataSource = states;
              });
              break;
            case 'isp':
              scope.pickEntitySelectedGeo(true);
              break;
          }
        }
        scope.pickEntitySelectedGeo = function (useCountryFilter) {
          var filter = {};
          if (useCountryFilter) {
            filter['countryId'] = scope.geoObj.selectedCountry;
          } else {
            filter['stateId'] = scope.geoObj.selectedState;
          }

          geo.getGeo(scope.geoDataSource[scope.geoObj.selectedGeoType].geoRestPath, filter).then(function (entities) {
            scope.geoDataSource[scope.geoObj.selectedGeoType].dataSource = entities;
          });
        }
        scope.clearSelectedGeo = function () {
          scope.geoObj.selectedCountry = '';
          scope.geoObj.selectedState = '';
        }
        scope.addPostalCode = function () {
          var postalCodes = scope.geoObj.selectedPostalCodes.replace(/\s/g, '').split(',');
          postalCodes.forEach(function (item) {
            var postalCodeObj = {
              id: scope.geoObj.selectedCountry,
              title: item,
              name: item,
              type: 'postalCode',
              typeName: geoTypes['postalCode'].ruleEntityLabel
            }
            scope.geoModel.gridAddedGeos.push(postalCodeObj);
          });
        }
        scope.openAdvanceSearch = function(){
          var modalInstance = mmModal.open({
            templateUrl: './csbApp/app/directives/views/rightPanel/geoAdvancedSearch.html',
            controller: 'geoAdvancedSearchCtrl',
            title: 'Select Geo Locations',
            modalWidth: 755,
            bodyHeight: 600,
            confirmButton: { name: "Add", funcName: "addSelectedGeos", hide: false, isPrimary: true},
            discardButton: { name: "Cancel", funcName: "close"}
          });

          modalInstance.result.then(function (data) {

            for (var key in data){
              data[key].forEach(function(item){
                if(key == 'postalCode'){
                  scope.geoModel.gridAddedGeos.push(item);
                } else {
                  var itemToAdd = data[key].fullObjects[item];
                  itemToAdd.type = key;
                  itemToAdd.typeName = key;

                  var additem = true;
                  scope.geoModel.gridAddedGeos.forEach(function(geoItem){
                    if(itemToAdd.id == geoItem.id){
                      additem = false;
                    }
                  });

                  if(additem){
                    scope.geoModel.gridAddedGeos.push(itemToAdd);
                  }
                }
              });
            };
          }, function () {

          });
        }

        //watch the user selection and add to the grid
        var watcher = scope.$watch('geoModel.selectedGeo', function (newVal, oldVal) {
          if (newVal && newVal.id && newVal != oldVal) {
            var shouldAdd = true;
            scope.geoModel.gridAddedGeos.forEach(function (item) {
              if (item.id == scope.geoModel.selectedGeo.id) {
                shouldAdd = false;
              }
            });
            if (shouldAdd) {
              //mdx2 patch since they provide the wrong geo type
              if(scope.geoModel.selectedGeo.type == 'state') scope.geoModel.selectedGeo.type = 'region';
              scope.geoModel.selectedGeo.typeName = geoTypes[scope.geoModel.selectedGeo.type].ruleEntityLabel;
              if (scope.geoObj.selectedGeoType == 'nielsen' || scope.geoObj.selectedGeoType == 'areaCode') {
                scope.geoModel.selectedGeo.countryId = scope.geoObj.selectedCountry;
                scope.geoModel.selectedGeo.regionId = scope.geoObj.selectedState;
              }
              scope.geoModel.selectedGeo.name = scope.geoModel.selectedGeo.title;
              scope.geoModel.gridAddedGeos.push(scope.geoModel.selectedGeo);
            }
            scope.geoModel.selectedGeo = {};
          }
        });

        scope.$on('$destroy', function () {
          if (watcher) watcher();
        });
      }
    }
  }
]);
