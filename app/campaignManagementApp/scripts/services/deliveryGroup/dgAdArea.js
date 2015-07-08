'use strict';

app.service('dgAdArea', ['dgHelper', function (dgHelper) {

	function selectAllSubGroupChildAndSubChild(selectedSubGroup) {
		var isSubGroupSelected = selectedSubGroup.selected;
		var subContainer;
		for (var i = 0; i < selectedSubGroup.subContainers.length; i++) {
			subContainer = selectedSubGroup.subContainers[i];
			subContainer.selected = isSubGroupSelected;
			if (dgHelper.isAdContainer(subContainer)) {
				selectAllSubGroupChildAndSubChild(subContainer);
			}
		}
	}

	return {
		selectAllSubGroupChildAndSubChild: selectAllSubGroupChildAndSubChild
	};
}]);