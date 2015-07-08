'use strict';
describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should check if the modal is open', function () {
    expect(scope.isModalOpen).toBe(false);
  });
});