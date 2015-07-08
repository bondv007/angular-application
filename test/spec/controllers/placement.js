'use strict';

describe('Controller: PlacementCtrl', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var PlacementCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PlacementCtrl = $controller('PlacementCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
