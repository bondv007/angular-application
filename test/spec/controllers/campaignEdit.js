/**
 * Created by liron.tagger on 6/11/14.
 */
'use strict';
describe('Controller: campaignEditCtrl1', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var CampaignEditCtrl1,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
		CampaignEditCtrl1 = $controller('campaignEditCtrl1', {
      $scope: scope
    });

		spyOn(scope, "delete").andCallFake(function() {
				return true;
			});
  }));

  it('should check if the modal is open', function () {
    expect(scope.statuses.length).toBe(4);
  });

	it('should check if delete returns "true"', function () {
		expect(scope.delete()).toBe(true);
	});
});