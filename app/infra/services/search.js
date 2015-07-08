/**
 * Created by liron.tagger on 11/3/13.
 */
app.service('searchService', ['$http', '$location', function searchService($http, $location) {
	return {
		search: function (term) {
			if (!isNaN(term)) {
				$location.path('/editPlacement/' + term)
			}
		}
	}
}]);