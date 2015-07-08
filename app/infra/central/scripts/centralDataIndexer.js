/**
 * Created by liron.tagger on 2/5/14.
 */
/*
	receives objects of type:

 	var dataAndRelations = [
 		{ type: 'Placement', centralList: placements },
 		{ type: 'Ad', centralList: ads },
 		{ type: 'DeliveryGroup', centralList: deliveryGroups }
 	];

*/
'use strict'
app.service('centralDataIndexer', ['entityMetaData', function centralDataIndexer(entityMetaData) {
	function AddData(indexedData, key) {
		if (key && !indexedData[key]) {
			indexedData[key] = {};
		}
	}
	function addMemberToData(indexedData, key, id) {
		if (key && !indexedData[key][id]){
			indexedData[key][id] = {};
		}
	}
	function addIndexToMember(indexedData, key, id, innerKey) {
		if (key && !indexedData[key][id][innerKey]){
			indexedData[key][id][innerKey] = [];
		}
	}

	function makeIndexData(item, id, indexedData, currentDataType, innerListType) {
		addMemberToData(indexedData, currentDataType, item.id);
		addMemberToData(indexedData, innerListType, id);

		addIndexToMember(indexedData, currentDataType, item.id, innerListType);
		addIndexToMember(indexedData, innerListType, id, currentDataType);

		indexedData[currentDataType][item.id][innerListType].push(id);
		indexedData[innerListType][id][currentDataType].push(item.id);
	}

	return {
		indexCentralData: function (dataAndRelations){
			var indexedData = {};
			for (var k = 0; k < dataAndRelations.length; k++) {
				var currentDataType = dataAndRelations[k].type;
				if (entityMetaData[currentDataType]) {
					if (entityMetaData[currentDataType].innerLists.length > 0){
						for	(var h = 0; h < entityMetaData[currentDataType].innerLists.length; h++){
							var innerList = entityMetaData[currentDataType].innerLists[h];

							var innerListName = innerList.name;
							var innerListType = innerList.type;

							AddData(indexedData, currentDataType);
							AddData(indexedData, innerListType);

							if (dataAndRelations[k].centralList){
								for (var i = 0; i < dataAndRelations[k].centralList.length; i++){
									var item = dataAndRelations[k].centralList[i];

									if (item[innerListName]){
										if (item[innerListName].pop === undefined) { // dirty check for array
											makeIndexData(item, item[innerListName], indexedData, currentDataType, innerListType);
										} else {
											for (var j = 0; j < item[innerListName].length; j++){
												var id = item[innerListName][j];
												makeIndexData(item, id, indexedData, currentDataType, innerListType);
											}
										}
									}
								}
							}
						}
					}
				}
			}

			return indexedData;
		}
	}
}]);