/**
 * Created by liron.tagger on 11/20/13.
 */
app.factory('clickAccumulatorService', function clickAccumulatorService() {
	var clickedEntities = {};

	return {
		addClickFor: function (elm) {
			var elmId = getElementId(elm);
			if (elmId) {
				if (clickedEntities[elmId] == undefined) {
					clickedEntities[elmId] = 0;
				}

				clickedEntities[elmId]++;
//				console.log(elmId);
			}
		},
		getClickCounters: function () {
			return clickedEntities;
		}
	};


	function getElementId(elm) {

		//check performance         //maybe limit the number of parents to check

		if (elm && elm.id !== undefined) {
			var elmId = elm.id;
			if (elmId) {
				return elmId;
			}

			return getElementId(elm.parentElement);
		}
		else {
			return undefined;
		}
	}
});
