/**
 * Created by rotem.perets on 20/1/15.
 * This service manages breadcrumb like context behind the scene
 */
app.service('mmContextService', ['$state', 'entityMetaData', function searchService($state, entityMetaData) {

  var contextData = [];

  function getCurrentContext(type, isNewMode) {
    var contextInfo, topContextItem;
    if(entityMetaData[type]){
      if(isNewMode){ // Self context
        topContextItem = contextData[contextData.length - 1];
      }else { // Parent context
        topContextItem = contextData.length > 1 ? contextData[contextData.length - 2] : undefined;
      }

      var metaData = entityMetaData[type].contextEntities;
      if (topContextItem && metaData) { // Context entity defined for the situation
        var entityContextInfo = metaData[topContextItem.contextEntityType];
        if (entityContextInfo) {
          contextInfo = entityContextInfo;
          contextInfo.contextEntityId = topContextItem.contextEntityId;
          contextInfo.contextEntityName = topContextItem.contextEntityName;
          contextInfo.contextEntityType = topContextItem.contextEntityType;
          contextInfo.isInContext = true;
        }
      }

      if (!contextInfo) { // No context entity found. Use self context instead
        contextInfo = {
          key: entityMetaData[type].contextKey,
          newPageURL: entityMetaData[type].newPageURL,
          editPageURL: entityMetaData[type].editPageURL,
          listPageURL: entityMetaData[type].listPageURL,
          contextEntityType: type,
          isInContext: false
        }
      }
    }
    return contextInfo;
  }

  function getContextData(){
    return contextData;
  }

  // Adds a context item only if one does not exist
  function addContextItem(contextEntityId, contextEntityType, contextEntityName, replaceContextData){
    if(contextData.length == 0 || contextData[contextData.length - 1].contextEntityType != contextEntityType){
      contextData.push({contextEntityId: contextEntityId, contextEntityType: contextEntityType, contextEntityName:contextEntityName});
    }
		else{
			if(!!replaceContextData){
				contextData[contextData.length - 1].contextEntityId = contextEntityId;
				contextData[contextData.length - 1].contextEntityName = contextEntityName;
			}
			//TODO why?
			else if(contextEntityName){
				contextData[contextData.length - 1].contextEntityName = contextEntityName;
			}
    }
  }

  function removeTopContextItem(){
    contextData.pop();
  }

  function clearContext(){
    contextData.length = 0;
  }

  // Only removes a context item if the type matches the top context
  function tryRemoveContextItem(type){
    if(contextData.length > 0 && contextData[contextData.length - 1].contextEntityType == type){
      removeTopContextItem();
    }
  }

  return {
    getCurrentContext: getCurrentContext,
    getContextData: getContextData,
    addContextItem: addContextItem,
    removeTopContextItem: removeTopContextItem,
    clearContext: clearContext,
    tryRemoveContextItem: tryRemoveContextItem
  }
}]);
