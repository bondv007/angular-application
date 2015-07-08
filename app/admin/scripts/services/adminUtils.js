/**
 * Created by Liad.Ron on 2/2/2015.
 */

'use strict';
app.factory('adminUtils',['entityMetaData', 'mmPermissions', 'mmRest', '$q', 'mmModal', 'mmAlertService', '$state', function(entityMetaData, mmPermissions, mmRest, $q, mmModal, mmAlertService, $state) {
	return {
		alerts : {
			error : function processError(error) {
				console.log('ohh no!');
				console.log(error);
				if (_.isUndefined(error.data) && _.isUndefined(error.data.error)){
					mmAlertService.addError("Server error. Please try again later.");
				} else {
					mmAlertService.addError(error.data.error);
				}
			}
		},
		routes:{
			go : function(url, paramType, paramId){
				$state.go(url, {paramType: paramId});
			}
		},
		manipulator: {
			/*
			 * account type manipulation to be able to display multiple types as a string. e.g : "Campaign Manager, Creative Manager".
			 */
			accountTypes: function (entity) {
				var accountType = '';
				if (entity.accountTypes) {
					if (entity.accountTypes.campaignManager) {
						accountType = 'Campaign Manager';
					}
					if (entity.accountTypes.creativeManager) {
						if (!_.isEmpty(accountType)) {
							accountType += ', ';
						}
						accountType += 'Creative Manager';
					}
					if (_.isEmpty(accountType)) {
						accountType = 'NONE';
					}
				}
				entity['accountType'] = accountType;
			}
		},
		linksBuilder: {
			/*
			 * entityTypes: [advertisers, users, ...]
			 * context : parent context, e.g: account
			 * return: {advertisers : {text : '10 advertisers', link : 'spa.account.advertisers'}, users: {text : '10 users', link : 'spa.account.users'}, ...}
			 */
			linksForList: function (entityTypes, contextName, relationsBag) {
				var entities = {};
				entityTypes.forEach(function (entity) {
					entities[entity] = {text: '', link: ''};
					var entityLowerCaseName = entity.toLowerCase();
					var name = entity.charAt(0).toUpperCase() + entity.substring(1, entity.length);
					var textToDisplay = '';
					if (relationsBag && relationsBag.children && relationsBag.children[entityLowerCaseName]) {
						if (relationsBag.children[entityLowerCaseName]['count'] == 1) {
							name = name.substring(0, entity.length - 1);
						}
						textToDisplay = relationsBag.children[entityLowerCaseName]['count'] + ' ' + name;
					} else {
						textToDisplay = name;
					}
					entities[entity].text = textToDisplay;
					entities[entity].link = 'spa.' + contextName.toLowerCase() + '.' + entity;
				});
				return entities;
			}
		},
		inherit: {
      adminSettings: function(){

			},
      analyticsSettings: function(entityToUpdate, newEntity){
        entityToUpdate.ignoreCostCalculation = newEntity.ignoreCostCalculation;
        entityToUpdate.viewabilityMode = newEntity.viewabilityMode;
        entityToUpdate.viewabilityThreshold =  newEntity.viewabilityThreshold;
      }
		},
		validations: {
			setTabHandler: function (toggleName, tabsName, activeTab) {
				var result = {};
				result[toggleName] = {};
				tabsName.forEach(function (name) {
					result[toggleName][name] = {};
					result[toggleName][name].isActive = false;
					result[toggleName][name].isValid = true;
				});
				result[toggleName][activeTab].isActive = true;
				return result;
			},
			url: function (url){
				var deferred = $q.defer();
				var urlValidObj = {isValid: true, msg: '', httpUrl: url};
				if (!_.isNull(url) && !_.isEmpty(url)) {
          var temp = url;
          temp = temp.substr(0,4);
          if(temp != 'http'){
            url = 'http://' + url;
            urlValidObj.httpUrl = url;
          }
					mmRest.validationURL.post(url).then(function (data) {
						var serverResult = !!data;
						urlValidObj.msg = 'Invalid url format.';
						urlValidation(urlValidObj, url);
						urlValidObj.isValid = urlValidObj.isValid && serverResult;
						if(urlValidObj.isValid) urlValidObj.msg = '';
						deferred.resolve(urlValidObj);
					}, function (error) {
						deferred.reject(error);
					});
				}else{
					urlValidation(urlValidObj, url);
					deferred.resolve(urlValidObj);
				}
				return deferred.promise;
			}
		},
		externalId: {
			init: function (editObject, externalIdRef) {
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
		},
		permissions: {
			checkOnEditMode: function (entity, permissionsObj) {
				var editTypes = ['editBasic', 'editAdvanced', 'createEditBasic', 'createEditAdvanced', 'createEdit'];
				var isEditEntityPerm = false;
				var entityType = entity.type.toLowerCase();
				var entityPerms = permissionsObj.entity;

				var entityKeys = Object.keys(entityPerms);
				entityKeys.forEach(function (permName) {
					permissionsObj.entity[permName] = mmPermissions.hasPermissionByEntity(entity, entityMetaData[entityType].permissions.entity[permName]);
					if (editTypes.indexOf(permName) > -1 && permissionsObj.entity[permName]) {
						isEditEntityPerm = true;
					}
				});

				if (permissionsObj.common) {
					checkCommonPermissions(entityType, permissionsObj.common);

					if (permissionsObj.common.externalId) {
						if (!isEditEntityPerm && permissionsObj.common.externalId.edit) {
							permissionsObj.common.externalId.edit = false;
						}
						if (permissionsObj.common.externalId.edit) permissionsObj.common.externalId.view = true;
					}
				}

				return isEditEntityPerm;
			},
			checkOnNewModeCommon: function (entityType, commonPermissions) {
				checkCommonPermissions(entityType, commonPermissions);
				if (commonPermissions.externalId) {
					if (commonPermissions.externalId.edit) commonPermissions.externalId.view = true;
				}
			},
			checkOnNewModeEntity: function (entityType, entityPermissions) {
				var entityKeys = Object.keys(entityPermissions);
				entityKeys.forEach(function (permName) {
					entityPermissions[permName] = mmPermissions.hasPermissionBySession(entityMetaData[entityType].permissions.entity[permName]);
				});
			}
		},
		crudOperations : {
			deleteEntities : function (list, itemsToDelete, type){
				var singularOrPlural = itemsToDelete.length > 1 ? 'entities' : 'entity';
				var modalInstance = mmModal.open({
					templateUrl: './infra/views/mmDeleteDialog.html',
					controller: 'mmDeleteDialogCtrl',
					title: "Delete selected items",
					modalWidth: 450,
					bodyHeight: 70,
					confirmButton: { name: "Delete items", funcName: "discard" },
					discardButton: { name: "Cancel", funcName: "cancel"},
					resolve: {
						text: function(){
							return 'Are you sure you want to permanently delete the selected ' + singularOrPlural + '?';
						}
					}
				});
				modalInstance.result.then(function () {
					makeDelete(list, itemsToDelete, type);
					return true;
				}, function () {
					return true;
				});
			},
			deleteEntity : function(entityToDelete, stateOnSuccessfulDelete) {
				var modalInstance = mmModal.open({
					templateUrl: './infra/views/mmDeleteDialog.html',
					controller: 'mmDeleteDialogCtrl',
					title: "Delete selected items",
					modalWidth: 450,
					bodyHeight: 70,
					confirmButton: { name: "Delete items", funcName: "discard" },
					discardButton: { name: "Cancel", funcName: "cancel"},
					resolve: {
						text: function(){
							return 'Are you sure you want to permanently delete the entity?';
						}
					}
				});
				modalInstance.result.then(function () {
					entityToDelete.remove().then(function (deletedData) {
						if (deletedData[0].success == 'success') {
							mmAlertService.addSuccess(entityToDelete.type + ': ' + entityToDelete.name + ' ID ' + entityToDelete.id + ' was deleted successfully.');
							$state.go(stateOnSuccessfulDelete);
							return true;
						} else if (deletedData[0].success == 'fail') {
								var innerMsg = entityToDelete.type + ': ' + entityToDelete.name + ' ID ' + entityToDelete.id + ' is currently associated with other entities and was not deleted.';
								mmAlertService.addError(innerMsg);
								return false;
						}
					}, function (error) {
						processError(error);
						return false
					});
				}, function () {
					return false;
				});
			}
		}
  };

	function checkCommonPermissions(entityType, commonPermissions) {
		var commonKeys = Object.keys(commonPermissions);
		commonKeys.forEach(function (secName) {
			var section = commonPermissions[secName];
			var permsName = Object.keys(section);
			permsName.forEach(function (perName) {
				commonPermissions[secName][perName] = mmPermissions.hasPermissionBySession(entityMetaData[entityType].permissions.common[secName][perName]);
			});
		});
	}

	function makeDelete(list, itemsToDelete, type) {
		//var ids = [];
		if(itemsToDelete.length == 0){
			mmAlertService.addError('Failed to delete entity(s), entity(s) was already deleted.');
			return;
		}
		itemsToDelete.forEach(function (item) {
			//ids.push(item.id);
			var entity = item;
			entity.remove().then(function (deletedData) {
				if(deletedData[0].success == 'success'){
					var indx = _.findIndex(list, {id : deletedData[0].entity});
					mmAlertService.addSuccess(type + ': ' + list[indx].name + ' ID ' + deletedData[0].entity + ' was deleted successfully.');
					list.splice(indx, 1);
          item.isSelected = false;
				}else if(deletedData[0].success == 'fail'){
					var indx = _.findIndex(list, {id : deletedData[0].entity});
					var innerMsg = type + ': ID ' + deletedData[0].entity + ' does not exist or insufficient privileges.';
					if(indx != -1){
						innerMsg = type + ': ' + list[indx].name + ' ID ' + deletedData[0].entity + ' is currently associated with other entities and was not deleted.';
					}
					mmAlertService.addError(innerMsg);
				}
			}, function (error) {
				processError(error);
			});
		});
//		var server = 'delete' + entityMetaData[type].name + 's';
//		var server = entityMetaData[type].name + 's';
//		mmRest[server.toLowerCase()].customDELETE(ids, {}, {'Content-Type': 'application/json' }).then(
//			function (response) {
//				postDeleteValidation(list, response);
//			},
//			function (response) {
//				processError(response);
//			});

//		mmRest[server].post(ids).then(function (data) {
//			postDeleteValidation(list, data);
//		}, function (error) {
//			processError(error);
//		});
	}

	function postDeleteValidation(list, deletedData){
		for (var i = 0; i < deletedData.length; i++) {
			if(deletedData[i].success == 'success'){
				var indx = _.findIndex(list, {id : deletedData[i].entity});
				mmAlertService.addSuccess(type + ': ' + list[indx].name + ' ID ' + deletedData[i].entity + ' was deleted successfully.');
				list.splice(indx, 1);
			}else if(deletedData[i].success == 'fail'){
				var indx = _.findIndex(list, {id : deletedData[i].entity});
				var innerMsg = type + ': ID ' + deletedData[0].entity + ' does not exist or insufficient privileges.';
				if(indx != -1){
					innerMsg = type + ': ' + list[indx].name + ' ID ' + deletedData[i].entity + ' is currently associated with other entities and was not deleted.';
				}
				mmAlertService.addError(innerMsg);
			}
		}
	}

	function processError(error) {
		console.log('ohh no!');
		console.log(error);
		if (error && error.data){
			if(!error.data.error) {
				mmAlertService.addError("Server error. Please try again later.");
			} else {
				mmAlertService.addError(error.data.error);
			}
		}else{
			mmAlertService.addError("Server error. Please try again later.");
		}
	}

	function urlValidation(validUrlObj, url) {
		if (url != null && url != "") {
			var validUrl = /^(http|https):\/\/[^ "]+$/;
			if (!validUrl.test(url)) {
				validUrlObj.msg = 'Invalid url format.';
				validUrlObj.isValid = false;
			}
		}
	}
}]);
