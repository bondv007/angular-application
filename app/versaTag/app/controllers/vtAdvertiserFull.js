/**
 * Created by
 */
'use strict';

app.controller('advertiserFullCtrl', ['$scope', '$state', '$stateParams',
	function ($scope, $state, $stateParams) {
		$scope.type = 'advertiserVtag';
		$scope.entityId = $stateParams.advertiserVtag;
		$scope.entityActions = [
			{
				name: 'Third Party Tags',
				ref: '.thirdpartytags',
				func: changeToThirdPartyTagsView,
				preventOpenMenu: true
			}
		];

		function changeToThirdPartyTagsView(){
			$state.go('spa.advertiserTag.thirdpartytags', { advertiserVtag: $stateParams.advertiserVtag});
		};
	}]);
