 /**
 * Created by Alon.Shemesh 31/12/14
 */
'use strict';

app.controller('uploadFromWorkshopCtrl', ['$scope', 'EC2Restangular','mmModal', '$q', 'adService',
  function($scope, EC2Restangular,  mmModal, $q, adService){

		uploadFromWorkshop();
		function  uploadFromWorkshop () {
			var modalInstance = mmModal.open({
				templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
				controller: 'uploadFromWorkshopModalCtrl',
				title: "Upload From Workshop",
				modalWidth: 1200,
				bodyHeight: 459,
				//confirmButton: { name: "Next", funcName: "save", isPrimary: true},
				discardButton: { name: "Close", funcName: "cancel" }
			});
		};

}]);