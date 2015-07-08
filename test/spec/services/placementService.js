'use strict';

describe('Service: Placementservice', function () {

  // load the service's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var Placementservice;
  beforeEach(inject(function (_Placementservice_) {
    Placementservice = _Placementservice_;
  }));

  it('should do something', function () {
    expect(!!Placementservice).toBe(true);
  });

});
