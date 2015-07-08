/**
 * Created by Ofir.Fridman on 10/13/14.
 */
'use strict';
app.directive('mmWizardButton', [function () {
	return {
		restrict: 'E',
		scope: {
			mmModel:"="
		},
		templateUrl: 'infra/directives/views/template/wizard/wizardButton.html',
		controller: ['$scope', function ($scope) {
		}]
	}
}]
);