'use strict';

describe('Controller: CloudaccoutCtrl', function () {

	// load the controller's module
	beforeEach(module('MediaMind3.0App'));

	var CloudaccoutCtrl,
		scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		CloudaccoutCtrl = $controller('CloudaccoutCtrl', {
			$scope: scope
		});
	}));

	it('should attach a list of awesomeThings to the scope', function () {
		expect(scope.awesomeThings.length).toBe(3);
	});
});
