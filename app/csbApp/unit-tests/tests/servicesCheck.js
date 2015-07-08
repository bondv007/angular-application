'use strict';

describe('Testing Services', function(){

    // describe authFactory service
    describe('authFactory', function(){

        var authFactory,
            $httpBackend;

        beforeEach(function(){

            module('csbAppMock');

            inject(function(_auth_, _$httpBackend_){
                $httpBackend = _$httpBackend_;
                authFactory = _auth_;
            })

        });

       afterEach (function () {
            $httpBackend.verifyNoOutstandingExpectation ();
            $httpBackend.verifyNoOutstandingRequest ();
        });

        it('should be defined', function(){

            expect(authFactory).toBeDefined();

        });

        it('ensure that user DOES NOT have permission to read or edit', function(){

            var url = sizmek.baseApiUrl + '/Permissions/GetPermissions/';

            var data = {
                "UserID":85100,
                "PermissionsNamesList":["AccountCSBEditMode","AccountCSBViewOnly"]
            };

            var headers = {
                "Accept":"application/json, text/plain, */*",
                "Content-Type":"application/json;charset=utf-8"
            };

            $httpBackend.expectPOST( url, data, headers).respond({edit: true, read: true});

            var promiseResult;

            authFactory.requestUserPermissions(85100, 'ac18327d-930d-4c87-84c6-26487feebc51').then(function(result){

                console.log(result);

                promiseResult = result;

            });

            $httpBackend.flush();

            expect(promiseResult.edit).toBe(false);
            expect(promiseResult.read).toBe(false);
        });

    });

    describe('modalFactory Test', function(){

        var modalFactory,
            deferred;

        beforeEach(function(){
            module('csbAppMock');
        });

        beforeEach(inject(function(_modalFactory_, $q){

            modalFactory = _modalFactory_;

            deferred = $q.defer();
            spyOn(modalFactory, 'showPrompt').and.returnValue(deferred.promise);

        }));

        it('is defined', function(){
            expect(modalFactory).toBeDefined();
        })

        it('showPrompt was called', function(){

            modalFactory.showPrompt('Test Title', 'Some message');
            expect(modalFactory.showPrompt).toHaveBeenCalledWith('Test Title', 'Some message');
        });

    });

    describe('adsFactory Test', function(){

        var adsFactory, httpBackend;

        beforeEach(function(){

            module('csbAppMock');

        });

        beforeEach(inject(function(_adsService_, $httpBackend){

            adsFactory = _adsService_;
            httpBackend = $httpBackend;

        }));

        afterEach (function () {
            httpBackend.verifyNoOutstandingExpectation ();
            httpBackend.verifyNoOutstandingRequest ();
        });


        it('it should be defined', function(){

            expect(adsFactory).toBeDefined();

        });

        it('ensure the length of ads is 0', function(){

            var url = sizmek.baseApiUrl + '/Ad/Ads/?DeliveryGroupID=123';

            httpBackend.expectGET(url).respond({"ResponseStatus": "1", "StatusMessage": "success", "AdsInfoList":[]});

            var adsList;

            adsFactory.GetAdsUnderDeliveryGroup(123).then(function(ads){

                adsList = ads;

            });

            httpBackend.flush();

            expect(adsList.length).toEqual(0);

        });
    });

    describe('appService Test', function(){

        var appService, httpBackend;

        beforeEach(function(){
            module('csbAppMock');
        });

        beforeEach(inject(function(_appService_, $httpBackend){

            appService = _appService_;
            httpBackend = $httpBackend;
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should be able to get advertisers by agency and user id', function(){

            var url = sizmek.baseApiUrl + '/Advertiser/AdvertisersWithStaticRetargetingTagsByAgencyIDAndUserID?agencyID=13196&userID=85100';

            httpBackend.expect('GET', url).respond({"success": true});

            var promiseResult;

            appService.advertiserMethods.advertisersByAgencyAndUserID({ agencyID: 13196, userID: 85100 }).$promise
                .then(function( response ) {
                    promiseResult = response;
                    console.log(response);
                }
            );

            httpBackend.flush();

            expect(promiseResult.$resolved).toBe(true);
            expect(promiseResult.success).toBe(true);

        });

        it('should be able to get decision diagrams by account', function(){

            // URL to POST
            var url = sizmek.baseApiUrl + '/DecisionDiagram/GetDecisionDiagramTemplatesByAccount/';

            // data that is being sent
            var data = {
                "AccountID": 13196
            };

            var headers = {
                "Accept":"application/json, text/plain, */*",
                "Content-Type":"application/json;charset=utf-8"
            };

            httpBackend.whenPOST(url, data).respond({'ResponseStatus':1, 'DecisionDiagramList': []});

            var promiseResult;

            appService.getDecisionDiagramTemplatesByAccount(13196).then(function(result){

                console.log('result', result);
                promiseResult = result;

            }, function(){console.log('error occurred')});

            httpBackend.flush();

            expect(promiseResult.length).toBe(0);
        });

    });
});












