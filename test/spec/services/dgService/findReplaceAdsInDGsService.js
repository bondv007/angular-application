/**
 * Created by Ahmad.Alinat on 16/12/14.for
 */
'use strict';
describe('Service: findReplaceAdsInDGsService', function () {
  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var findReplaceAdsInDGsService;
  beforeEach(inject(function (_findReplaceAdsInDGsService_) {
    findReplaceAdsInDGsService = _findReplaceAdsInDGsService_;
    console.log(findReplaceAdsInDGsService);
  }));

  it('should test the service findReplaceAdsInDGsService is up', function () {
    expect(!!findReplaceAdsInDGsService).toBe(true);
  });

});
