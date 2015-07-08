app.factory('ruleFactory', ['geoTypes', function (geoTypes) {

  /*
  Rule classes: This section contains all of the rules we create for decisions
   */

  function ContextualTargetingRule(data){
    this.subCategoryId = data.subCategoryId;
    this.subCategoryName = data.subCategoryName;
  }

  function ThirdPartyRule( data ) {
    this.Provider = data.provider;
    this.Segments = data.segments;
    this.AdvertiserID = data.advertiserID;
  }

  function GeoRule(data) {
    this.countries = data.countries || null;
    this.regions = data.regions || null;
    this.cities = data.cities || null;
    this.areaCodes = data.areaCodes || null;
    this.nielsenDMAs = data.nielsenDMAs || null;
    this.zipCodes = data.zipCodes || null;
    this.isps = data.isps || null;
  }


  /*
   Contextual Rule classes: This section contains all of the Contextual rules we create for decisions
   */

  function ContextualRule(data){
    this.type = data.type;
    this.name = data.name;
    this.exposure = '';
    this.logicalOperatorID = '';
  }

  function ContextualContextualTargetingRule(data){
    var rule = new ContextualRule(data);
    rule.logicalOperatorID = 'OR';
    rule.exposure = 'Exposed to';
    return rule;
  }

  function ContextualGeoRule(data) {
    var rule = new ContextualRule(data);
    rule.exposure = data.exposure == 1 ? 'From' : 'Not from';
    rule.logicalOperatorID = data.logicalOperatorID == 1 ? 'AND' : 'OR';
    return rule;
  }


  /*
   Geo rules logic: This section contains all of the helper methods and API for creating Geo rules
   */

  function createGeoRule(geo, geoType, geoObject, decisionType){
    var geoRule = new GeoRule(geoObject);
    var entityLabel = geo.name + ' (' + geoType.ruleEntityLabel + ')';
    var contextualRule = new ContextualGeoRule({
      exposure: 1,
      name: entityLabel,
      logicalOperator: 2,
      type: decisionType
    });

    return {
      label: entityLabel,
      description: entityLabel,
      targetingRule: geoRule,
      contextualTargetingRule: contextualRule
    }
  }

  function createGeoRulesMDX(rulesArray, geos, decisionType){
    geos.forEach(function (geo) {
      var geoObject = {};
      switch (geo.type) {
        case 'country':
        case 'state':
        case 'region':
        case 'city':
        case 'isp':
          geoObject[geoTypes[geo.type].ruleEntityType] = geo.id;
          break;
        case 'nielsen':
        case 'areaCode':
          geoObject[geoTypes[geo.type].ruleEntityType] = {
            countryId: geo.countryId,
            regionId: geo.regionId,
            id: geo.id,
            type: geoTypes[geo.type].geoType
          }
          break;
        case 'postalCode':
          geoObject[geoTypes[geo.type].ruleEntityType] = {
            countryId: geo.id,
            countryZipCodes: geo.name,
            type: geoTypes[geo.type].geoType
          }
          break;
      }
      rulesArray.push(createGeoRule(geo, geoTypes[geo.type], geoObject, decisionType));
    });
  }


  /*
   Contextual targeting rules logic: This section contains all of the helper methods and API for creating Geo rules
   */

  function createContextualTargetingRules(rulesArray, categories, ruleType){
    categories.forEach(function(category){
      var contextualRule = new ContextualContextualTargetingRule({
        name: category.name,
        type: ruleType
      });

      var rule = new ContextualTargetingRule({
        subCategoryId: category.id,
        subCategoryName: category.name
      });

      rulesArray.push({
        description: category.name,
        targetingRule: rule,
        label: category.name,
        contextualTargetingRule: contextualRule
      });
    });
  }

  var factory = {};

  // Geo API
  factory.createGeoRulesMDX = createGeoRulesMDX;
  // Contextual Targeting API
  factory.createContextualTargetingRules = createContextualTargetingRules

  return factory;
}]);

