/**
 * Created by ofir.fridman on 3/8/2015.
 */
'use strict';

describe('Service: traffickingService', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var traffickingService, rootScope,traffickingConst;
  beforeEach(inject(function (_traffickingService_, $rootScope,_traffickingConst_) {
    traffickingService = _traffickingService_;
    rootScope = $rootScope;
    traffickingConst = _traffickingConst_;
  }));

  it('should test the service funnelService is up', function () {
    expect(!!traffickingService).toBe(true);
  });

  it('should test the service rootScope is up', function () {
    expect(!!rootScope).toBe(true);
  });

  it('should test the service traffickingConst is up', function () {
    expect(!!traffickingConst).toBe(true);
  });

  it('test isMM2 when it not ', function () {
    expect(traffickingService.isMM2()).toBe(false);
  });

  it('test isMM2 when it is', function () {
    rootScope.isMMNext = false;
    expect(traffickingService.isMM2()).toBe(true);
  });

  it('test disableButton', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    traffickingService.disableButton(funnelButtons, traffickingConst.strAssign);

    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(true);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

  it('test disableEnableAssignButton when no ads and dgs selected ', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    var newSelectedAds = 0;
    var dgs = [];
    traffickingService.disableEnableAssignButton(funnelButtons, newSelectedAds, dgs)
    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(true);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

  it('test disableEnableAssignButton when ads selected but none of the dgs selected ', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    var newSelectedAds = 5;
    var dgs = [];
    traffickingService.disableEnableAssignButton(funnelButtons, newSelectedAds, dgs)
    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(true);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

  it('test disableEnableAssignButton when dgs selected but none of the ads selected ', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    var newSelectedAds = 0;
    var dgs = [{selected:true},{selected:true}];
    traffickingService.disableEnableAssignButton(funnelButtons, newSelectedAds, dgs)
    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(true);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

  it('test disableEnableAssignButton when 1 dg selected and 1 ad selected ', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    var newSelectedAds = 1;
    var dgs = [{selected:true}];
    traffickingService.disableEnableAssignButton(funnelButtons, newSelectedAds, dgs)
    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(true);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

  it('test disableEnableAssignButton when 2 dgs and 1 ad selected ', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    var newSelectedAds = 1;
    var dgs = [{selected:true},{selected:true}];
    traffickingService.disableEnableAssignButton(funnelButtons, newSelectedAds, dgs)
    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(false);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

  it('test disableEnableAssignButton when 1 dgs and 2 ad selected ', function () {
    var funnelButtons = [
      {name: traffickingConst.strStrategy},
      {name: traffickingConst.strReplaceAd},
      {name: traffickingConst.strAssign}
    ];
    var newSelectedAds = 2;
    var dgs = [{selected:true}];
    traffickingService.disableEnableAssignButton(funnelButtons, newSelectedAds, dgs)
    for (var i = 0; i < funnelButtons.length; i++) {
      if(funnelButtons[i].name == traffickingConst.strAssign){
        expect(funnelButtons[i].disable).toBe(false);
      }
      else{
        expect(funnelButtons[i].disable).toBe(undefined);
      }
    }
  });

});
