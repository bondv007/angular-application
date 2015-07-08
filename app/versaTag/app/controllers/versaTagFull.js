/**
 * Created by
 */
'use strict';

app.controller('versaFullCtrl', ['$scope', '$state', '$stateParams', 'flowToolBar',
	function ($scope, $state, $stateParams, flowToolBar ) {
		$scope.type = 'versaTag';
		$scope.entityId = $stateParams.versaTagId;
		$scope.entityActions = [
            {
				name: 'Firing Conditions',
				ref: '.firingConditions',
				func: changeToFiringConditionsView,
				preventOpenMenu: true
        	},
			{
				name: 'Spreadsheet',
				ref: '.versaTagSpreadsheet',
				func: changeToSpreadsheet,
				preventOpenMenu: true
        	}
		];

		flowToolBar.setPrefixToEntityActions('spa.versaTag',$scope.entityActions);

		function changeToFiringConditionsView(){
			$state.go('spa.versaTag.firingConditions', { versaTagID: $state.params.versaTagId});
		};

		function changeToSpreadsheet() {
			$state.go('spa.versaTag.versaTagSpreadsheet', { versaTagID: $state.params.versaTagId});
		};

}]);
