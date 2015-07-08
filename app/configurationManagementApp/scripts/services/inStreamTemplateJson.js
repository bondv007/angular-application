/**
 * Created by roi.levy on 2/9/15.
 */
'use strict';

app.service('inStreamTemplatesJson', ['mmUtils', function(mmUtils){
	return {
		createTemplateData: function(){
			var newTemplateData = {
        type: "TemplateData",
				templateId: null,
				vastVariables: []
			}
			mmUtils.clientIdGenerator.populateEntity(newTemplateData);
			return newTemplateData;
		},
    createSiteTemplateData: function(){
      var newTemplateData = {
        type: "SiteTemplateData",
        templateId: null,
        vastVariables: [],
        sectionId: null,
        templateName: '',
        sectionName: ''
      }
      mmUtils.clientIdGenerator.populateEntity(newTemplateData);
      return newTemplateData;
    },
		createInStreamTemplate: function(){
			var newTemplate = {
				type: "TemplateXslt",
				template: null
			}
			mmUtils.clientIdGenerator.populateEntity(newTemplate);
			return newTemplate;
		},
    getVastVariableByName: function(variables, name){
      if(variables && variables.length){
        for (var i = 0; i < variables.length; i++ ) {
          var obj = variables[i];
          if(obj.name === name){
            return obj;
          }
        }
      }
    }
	}
}]);
