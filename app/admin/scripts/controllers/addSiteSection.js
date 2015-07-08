///**
// * Created by atdg on 6/3/2014.
// */
//'use strict';
//app.controller('addSiteSectionCtrl', ['$rootScope', '$scope', '$modalInstance', 'mmMessages', function ($rootScope, $scope, $modalInstance, mmMessages) {
//	$scope.section =
//	{
//		name: "",
//		url: ""
//	};
//	var errors = "";
//
//	$scope.ok = function () {
//		if (!validateData()) {
//			var text = '<div style="font-weight: bold">You must fill all mandatory fields</div><div>' + errors + '</div>';
//			mmMessages.addWarning("Message", text, true);
//			return;
//		}
//		$rootScope.$broadcast("SectionData", $scope.section);
//		$modalInstance.close('hide');
//	};
//
//
//	$scope.cancel = function () {
//		$modalInstance.dismiss('cancel');
//	};
//
//	function validateData() {
//		var isValid = true;
//
//		if ($scope.section.name == "") {
//			errors += "<div>Please enter section name.</div>";
//			isValid = false;
//		}
//		if ($scope.section.url == "") {
//			errors += "<div>Please enter url</div>";
//			isValid = false;
//		}
//		return isValid;
//	}
//}]);