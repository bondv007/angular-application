/**
 * Created by atd on 9/17/2014.
 */
app.filter('customSearch', ['$filter', function ($filter) {
	return function (arr, selectedAction, searchText) {
		try {
			if (typeof arr == "undefined" || arr == null || arr.length <= 0) return arr;
			var filter = $filter("filter");
			if (typeof selectedAction == "undefined")
				return filter(arr, searchText);
			var searchAction = selectedAction.toLowerCase();
			searchText = searchText.toLowerCase();
			var obj = arr[0];
			if (!obj.hasOwnProperty(searchAction) || searchText == "") {
				return filter(arr, searchText);
			}
			else if (obj.hasOwnProperty(searchAction)) {
				if (Object.prototype.toString.call(obj[searchAction]) === '[object Array]') {
					var predicate = {};
					predicate[searchAction] = searchText;
					return filter(arr, predicate);
				}
				else {
					return filter(arr, function (data, index) {
						return(data[searchAction].search(new RegExp(searchText, "i")) != -1);
					});
				}
			}
		}
		catch (error) {
			console.log("Error : Filter : customSearch : Error Message : ", error);
		}
		return arr;
	};
}]);
