app.factory('csb', [
  function () {

    var pub = {};

    pub.config = {
      // Must initialize this property for unit testing
      env: (window.self !== window.top) ? 'mdx2' : 'mdx3',
      baseApiUrl: null,
      shareUrl: null,
      basePreviewUrl: null,
      panelHeight: null
    };

    pub.params = {
      sessionID: null,
      campaignID: null,
      campaignName: null,
      diagramID: null,
      diagramName: null,
      userID: null,
      accountID: null,
      advertiserID: null,
      advertiserName: null,
      permissions: null
    };

    pub.clear = function(){
      pub.config.env = (window.self !== window.top) ? 'mdx2' : 'mdx3';
      pub.config.baseApiUrl = null;
      pub.config.shareUrl = null;
      pub.config.basePreviewUrl = null;

      pub.params.sessionID = null;
      pub.params.campaignID = null;
      pub.params.campaignName = null;
      pub.params.diagramID = null;
      pub.params.diagramName = null;
      pub.params.userID = null;
      pub.params.accountID = null;
      pub.params.advertiserID = null;
      pub.params.advertiserName = null;
      pub.params.permissions = null;
    }

    //TODO: this should be placed somewhere else.
    pub.createDecision = function (data) {
      function Decision(data) {
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
      }

      return new Decision(data);
    };

    pub.addTypeParam = function(object, type){
      var cloneObject = angular.copy(object);
      deleteAllObjectKeys(cloneObject);
      cloneObject.__type = type;
      addAllObjectKeys(cloneObject, object);

      return cloneObject;

      function deleteAllObjectKeys(cloneObject) {
        for (var key in cloneObject) {
          if(cloneObject.hasOwnProperty(key)){
            delete cloneObject[key];
          }
        }
      }

      function addAllObjectKeys(cloneObject, object) {
        for (var key in object) {
          if(!cloneObject.hasOwnProperty(key)){
            cloneObject[key] = object[key];
          }
        }
      }
    }

    return pub;
  }
]);
