/**
 * Created by roi.levy on 10/28/14.
 */
'use strict';
app.controller('generateTestTagCtrl', ['$scope', '$modalInstance', 'ad','EC2Restangular', '$sce', '$state',
  function($scope, $modalInstance, ad, EC2Restangular, $sce, $state){

    var creativeTagGenerator = EC2Restangular.all('ads/previewTag');
    creativeTagGenerator.customPOST({entities: [ad.id]}).then(processResponse, processError);

    $scope.ad = ad;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.openTestPage = function(){
      window.open($scope.testPageUrl);
      //newWindow.document.write(createTestPage());
    }

    $scope.copyToClipBoard = function(){
      if ($scope.scriptTag) {
        return $scope.scriptTag;
      }
    }

    $scope.downloadTestPage = function(){
      if(!ad){
        return;
      }
      var testPageText = createTestPage();
      var blob = new Blob([testPageText], {type: "text/plain;charset=utf-8"});
      saveAs(blob, ad.name + "_" + ad.id + ".html");
    }

    function createTestPage(){
      if($scope.ad.adFormat === 'INSTREAM_AD' || $scope.ad.adFormat == 'INSTREAM_INTERACTIVE_AD' || $scope.ad.adFormat == 'INSTREAM_ENHANCED_AD'){
        var playerIframe =  "<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n<div>\n" +
          "<iframe style='border-left: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px scrolling='no' src=" +  $scope.playerSource + "></iframe>" +
          "\n</div>\n</body>\n</html>";
          return playerIframe;
      }
      else{
        return "<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n<div>\n" + $scope.scriptTag + "\n</div>\n</body>\n</html>";
      }

    }

    function processResponse(result){
      $scope.scriptTag = result[0].scriptTag ? result[0].scriptTag + '\n\n' + result[0].noScriptTag : result[0].noScriptTag;
      $scope.testPageUrl = result[0].testPageUrl;
      if($scope.ad.adFormat === 'INSTREAM_AD' || $scope.ad.adFormat == 'INSTREAM_INTERACTIVE_AD' || $scope.ad.adFormat == 'INSTREAM_ENHANCED_AD'){
        $scope.playerSource = $sce.trustAsResourceUrl("/player/views/instream-player.html?preroll=" +
        encodeURIComponent(result[0].noScriptTag) + "&midroll=&postroll=&overlay=&player-type=as3&width=" + $scope.ad.width + "&height=" +
        $scope.ad.height + "&controls=below&auto-start=false&script-access=always&wmode=opaque");
      }
    }

    function processError(error){
      $scope.scriptTag = error;
    }

  }]);
