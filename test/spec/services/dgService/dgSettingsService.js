/**
 * Created by Ofir.Fridman on 11/25/14.
 */
'use strict';
describe('Service: dgSettingsService', function () {

    // load the controller's module
    beforeEach(module('MediaMindApp'));

    // instantiate service
    var dgSettingsService
    beforeEach(inject(function (_dgSettingsService_ ) {
        dgSettingsService = _dgSettingsService_;
    }));

    it('should test the service dgSettingsService is up', function () {
        expect(!!dgSettingsService).toBe(true);
    });

    it('should test unCheckALlDefaultServeItems when all ads and parent cb are selected', function () {
        var isServeDefaultImageSelected = true;
        var defaultAds = [{selected:true},{selected:true},{selected:true}];
        var defaultAdsCb = {isSelected:true};
        dgSettingsService.unCheckALlDefaultServeItems(isServeDefaultImageSelected, defaultAds, defaultAdsCb);
        expect(defaultAdsCb.isSelected).toBe(false);
        for (var i = 0; i < defaultAds.length; i++) {
            expect(defaultAds[i].selected).toBe(false);
        }
    });

    it('should test unCheckALlDefaultServeItems when all ads and parent cb are not selected', function () {
        var isServeDefaultImageSelected = true;
        var defaultAds = [{selected:false},{selected:false},{selected:false}];
        var defaultAdsCb = {isSelected:false};
        dgSettingsService.unCheckALlDefaultServeItems(isServeDefaultImageSelected, defaultAds, defaultAdsCb);
        expect(defaultAdsCb.isSelected).toBe(false);
        for (var i = 0; i < defaultAds.length; i++) {
            expect(defaultAds[i].selected).toBe(false);
        }
    });

    it('should test unCheckALlDefaultServeItems when some of the ads selected and parent cb selected', function () {
        var isServeDefaultImageSelected = true;
        var defaultAds = [{selected:false},{selected:true},{selected:true}];
        var defaultAdsCb = {isSelected:true};
        dgSettingsService.unCheckALlDefaultServeItems(isServeDefaultImageSelected, defaultAds, defaultAdsCb);
        expect(defaultAdsCb.isSelected).toBe(false);
        for (var i = 0; i < defaultAds.length; i++) {
            expect(defaultAds[i].selected).toBe(false);
        }
    });

    it('should test decisionFrequencyCappingCbState when servingSetting values > 0', function () {
        var frequencyCapping = {impressionsPerUser: null, impressionsPerDay: null, minimumTimeBetweenAds: null};
        var dg = {servingSetting: {impressionsPerUser: 1, impressionsPerDay: 5, timeBetweenAds: 10}};
        dgSettingsService.decisionFrequencyCappingCbState(frequencyCapping, dg)
        expect(frequencyCapping.impressionsPerUser).toBe(true);
        expect(frequencyCapping.impressionsPerDay).toBe(true);
        expect(frequencyCapping.minimumTimeBetweenAds).toBe(true);
    });

    it('should test decisionFrequencyCappingCbState when servingSetting values = -1', function () {
        var frequencyCapping = {impressionsPerUser: null, impressionsPerDay: null, minimumTimeBetweenAds: null};
        var dg = {servingSetting: {impressionsPerUser: -1, impressionsPerDay: -1, timeBetweenAds: null}};
        dgSettingsService.decisionFrequencyCappingCbState(frequencyCapping, dg)
        expect(frequencyCapping.impressionsPerUser).toBe(false);
        expect(frequencyCapping.impressionsPerDay).toBe(false);
        expect(frequencyCapping.minimumTimeBetweenAds).toBe(false);
    });

});