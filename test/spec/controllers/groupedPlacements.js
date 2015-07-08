'use strict';

describe('Controller: GroupedplacementsCtrl', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var GroupedplacementsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GroupedplacementsCtrl = $controller('GroupedplacementsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
