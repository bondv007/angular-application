'use strict';

app.controller('tagGenerationSettingsCtrl', ['$scope', '$modalInstance','mmRest','tagGenerationPlacements','mmAlertService','enums',
	function ($scope, $modalInstance, mmRest, tagGenerationPlacements, mmAlertService, enums) {

    var IN_STREAM_VIDEO = 'IN_STREAM_VIDEO';

		$scope.labelWidth = 150;
    $scope.tagCode = "";
		$scope.newMode = true;
    $scope.isInStreamType = true;
		$scope.tagTypes = enums.placementTagTypes;
    $scope.tagGenerationTypes = { value: [enums.placementTagTypes.getId('Auto Detect')] };

    tagGenerationPlacements.forEach(function(placement){
      if(placement.placementType != IN_STREAM_VIDEO){
        $scope.isInStreamType = false;
      }
    });

		$scope.generateTag = function(){
			var tagBuilderParams = [];
      tagGenerationPlacements.forEach(function(placement){
        placement.tagBuilderParams.placementId = placement.id;
        placement.tagBuilderParams.placementType = placement.placementType;
        placement.tagBuilderParams.builderTagTypes = $scope.tagGenerationTypes.value;
        tagBuilderParams.push(placement.tagBuilderParams);
      });

      mmRest.tags.post(tagBuilderParams).then(processGenerateTag, processError);
		}

		$scope.copyToClipboard = function() {
			if ($scope.tagCode && $scope.tagCode.length > 0) {
				return $scope.tagCode;
			}
		}

		$scope.exportToTextFile = function() {
			var pom = document.createElement('a');
			pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.tagCode));
			pom.setAttribute('download', "Placement tags.txt");
			pom.click();
		}
		$scope.cancel = function(){
      $modalInstance.close();
		}

    function processGenerateTag(data) {
      mmAlertService.addSuccess('Tag has been generated successfully.');
      $scope.tagCode = "";
      data.forEach(function (tagInfo) {

        if (tagInfo.placementType == "IN_BANNER")
          $scope.tagCode += '// Banner Size: ' + tagInfo.bannerSize.height + 'X' + tagInfo.bannerSize.width + '\r\n';

        $scope.tagCode += '// Booked Impressions: ' + tagInfo.bookedImpressions + '\r\n';
        $scope.tagCode += '// Placement Dates: ' + (new Date(tagInfo.startDate)).toDateString() + ' - ' + (new Date(tagInfo.endDate)).toDateString() + '\r\n';
        $scope.tagCode += '\r\n';
        $scope.tagCode += tagInfo.tag;
        $scope.tagCode += '\r\n';
        $scope.tagCode += '=====================================================================';
      });
    }

    function processError(error) {
      console.log("ERROR");
      mmAlertService.addError(error);
      $scope.tagCode = "Error in generating tag";
    }
	}]);
