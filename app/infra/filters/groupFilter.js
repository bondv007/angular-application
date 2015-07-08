app.filter('group', function () {
	return function (items, groupBy) {
        if(items){
            var groups = {};
            for (var i = 0; i < items.length; i++) {
                var name = items[i][groupBy];
                if (!groups[name]) {
                    groups[name] = [];
                }
                groups[name].push(items[[i]]);
            }
            return groups;
        }
	};
//    return function(items, groupSize) {
//        var groups = [],
//            inner;
//        for(var i = 0; i < items.length; i++) {
//            if(i % groupSize === 0) {
//                inner = [];
//                groups.push(inner);
//            }
//            inner.push(items[i]);
//        }
//        return groups;
//    };
});
