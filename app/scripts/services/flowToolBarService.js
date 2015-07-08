/**
 * Created by Ofir.Fridman on 8/23/14.
 */
'use strict';

app.service('flowToolBar', [function () {

	function setPrefixToEntityActions(refPreFix,entityActions){
		var stop = entityActions.length;
		for (var i = 0; i < stop; i++) {
			var entity = entityActions[i];
			var views = entity.views;
			if(views){
				var viewsStop = views.length;
				for (var j = 0; j < viewsStop; j++) {
					views[j].ref = refPreFix + views[j].ref;
				}
			}
			if(entity.ref){
				entity.ref = refPreFix + entity.ref;
			}
		}
	}

	return {
		setPrefixToEntityActions:setPrefixToEntityActions
	};
}]);
