/**
 * Created by Liad.Ron on 2/2/2015.
 */

'use strict';
app.factory('adminUtils',[ function() {
	return {
		manipulator:{
			/*
			* account type manipulation to be able to display multiple types as a string. e.g : "Campaign Manager, Creative Manager".
			*/
			accountTypes : function(entity){
				var accountType = '';
				if(entity.accountTypes){
					if(entity.accountTypes.campaignManager){
						accountType = 'Campaign Manager';
					}
					if(entity.accountTypes.creativeManager){
						if(!_.isEmpty(accountType)){
							accountType += ', ';
						}
						accountType += 'Creative Manager';
					}
					if(_.isEmpty(accountType)){
						accountType = 'NONE';
					}
				}
				entity['accountType'] = accountType;
			}
		},
		linksBuilder:{
			/*
			* entityTypes: [advertisers, users, ...]
			* context : parent context, e.g: account
			* return: {advertisers : {text : '10 advertisers', link : 'spa.account.advertisers'}, users: {text : '10 users', link : 'spa.account.users'}, ...}
			*/
			linksForList : function(entityTypes, contextName, relationsBag){
				var entities = {};
				entityTypes.forEach(function(entity){
					entities[entity] = {text : '', link: ''};
					var entityLowerCaseName = entity.toLowerCase();
					var name = entity.charAt(0).toUpperCase() + entity.substring(1, entity.length);
					var textToDisplay = '';
					if(relationsBag.children && relationsBag.children[entityLowerCaseName]){
						if(relationsBag.children[entityLowerCaseName]['count'] == 1){
							name = name.substring(0, entity.length - 1);
						}
						textToDisplay = relationsBag.children[entityLowerCaseName]['count'] + ' ' + name;
					}else{
						textToDisplay = name;
					}
					entities[entity].text = textToDisplay;
					entities[entity].link = 'spa.' + contextName.toLowerCase() + '.' + entity;
				});
				return entities;
			}
		},
		adminSettings : {
			inherit : function(){

			}
		},
		validations : {
			setTabHandler : function(toggleName, tabsName, activeTab){
				var result = {};
				result[toggleName] = {};
				tabsName.forEach(function(name){
					result[toggleName][name] = {};
					result[toggleName][name].isActive = false;
					result[toggleName][name].isValid = true;
				});
				result[toggleName][activeTab].isActive = true;
				return result;
			}
		},
		externalId : {
			init : function(editObject, externalIdRef){
					if (!_.isUndefined(editObject)) {
						if (_.isUndefined(editObject.externalId) || _.isNull(editObject.externalId)) {
							editObject.externalId = {
								type: 'ExternalId',
								entityType: null,
								id: null
							}
						}
						//add reference to the external id object that is bound to the control model
						externalIdRef = externalIdRef || {};
						externalIdRef = editObject.externalId;
					}

			}
		}
	};
}]);