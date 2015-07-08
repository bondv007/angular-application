/**
 * Created by ofir.fridman on 3/8/2015.
 */
'use strict';

describe('Service: funnelService', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var funnelService, traffickingConst;
  beforeEach(inject(function (_funnelService_,_traffickingConst_) {
    funnelService = _funnelService_;
    traffickingConst = _traffickingConst_;
  }));

  it('should test the service funnelService is up', function () {
    expect(!!funnelService).toBe(true);
  });

  it('should test the getDefaultTa when decision is null',function(){
    var decision = null;
    var defaultTa = funnelService.getDefaultTa(decision);
    expect(defaultTa.id).toBe(null);
    expect(defaultTa.name).toBe(traffickingConst.strDefaultAudience);
    expect(defaultTa.isSelected).toBe(false);
  });

  it('should test the getDefaultTa when decision exist and the first NO path with new name',function(){
    var decision = [
      {noDecisions:[
        {noDecisions:[],name:'Default TA New Name'}
      ]}
    ];
    var defaultTa = funnelService.getDefaultTa(decision);
    expect(defaultTa.id).toBe(null);
    expect(defaultTa.name).toBe('Default TA New Name');
    expect(defaultTa.isSelected).toBe(false);
  });

  it('should test the getDefaultTa when decision is exist and the second NO path with new name',function(){
    var decision = [
      {noDecisions:[
        {noDecisions:[{noDecisions:[],name:'Default TA New Name'}]}
      ]}
    ];
    var defaultTa = funnelService.getDefaultTa(decision);
    expect(defaultTa.id).toBe(null);
    expect(defaultTa.name).toBe('Default TA New Name');
    expect(defaultTa.isSelected).toBe(false);
  });

  it('should test the isLastAndCurrentSelectedTaTheSame when default TA selected ', function () {
    var lastTASelected = {targetAudienceId: 1}, targetAudienceCampaign = {targetAudienceId: 1}, isDefaultTaSelected = true;
    expect(funnelService.isLastAndCurrentSelectedTaTheSame(lastTASelected, targetAudienceCampaign, isDefaultTaSelected)).toBe(false);
  });

  it('should test the isLastAndCurrentSelectedTaTheSame when the current and the last TA are the same ', function () {
    var lastTASelected = {targetAudienceId: 1}, targetAudienceCampaign = {targetAudienceId: 1}, isDefaultTaSelected = false;
    expect(funnelService.isLastAndCurrentSelectedTaTheSame(lastTASelected, targetAudienceCampaign, isDefaultTaSelected)).toBe(true);
  });

  it('should test the isLastAndCurrentSelectedTaTheSame when the current and the last TA not the same ', function () {
    var lastTASelected = {targetAudienceId: 2}, targetAudienceCampaign = {targetAudienceId: 1}, isDefaultTaSelected = false;
    expect(funnelService.isLastAndCurrentSelectedTaTheSame(lastTASelected, targetAudienceCampaign, isDefaultTaSelected)).toBe(false);
  });
});
