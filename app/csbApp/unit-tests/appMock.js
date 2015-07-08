/**
 * Created by Rick.Jones on 10/7/14.
 */

var sizmek = {
    csb: angular.module('csbAppMock', [ 'ngDragDrop', 'textAngular', 'ngRoute', 'ui.bootstrap', 'ngResource' ] ),
    baseApiUrl: 'https://dev4.eyeblaster.com/MediaMind.InternalAPI.Web/CSBService.svc',
    rootUrl: 'https://dev4.eyeblaster.com/',
    //LOCAL_TESTING_URL// previewUrl: 'http://172.31.16.152/#/preview'
    previewUrl: 'https://dev4.dev.sizmdx.com/#/preview'  //DEV_URL//
    // PRODUCTION_URL// TBD...
}