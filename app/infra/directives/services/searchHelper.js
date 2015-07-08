/**
 * Created by Ofir.Fridman on 9/2/14.
 */
'use strict';

app.service('searchHelper', [function () {
	function getParsedSearchTerm(term) {
		return  term;
	}

	return {
        getParsedSearchTerm: getParsedSearchTerm
	};
}]);