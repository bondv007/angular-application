/**
 * Created by ofir.fridman on 9/26/14.
 */
'use strict';
app.directive('timeBaseRotation', ['$filter','mmAlertService', function ($filter, mmAlertService) {
	return {
		restrict: 'E',
		scope: {
			weight: "=?",
			onLinkClick: "&"
		},
		templateUrl: 'campaignManagementApp/views/directives/dg/timeBaseRotation.html',
		controller: ['$scope', '$timeout', 'mmModal', function ($scope, $timeout, mmModal) {

			$scope.getFormatDate = function(){
				return _formatDate($scope.weight.startDate) + " - " + _formatDate($scope.weight.endDate);
			};

			$scope.getFormatStartDate = function(){
				return _formatDate($scope.weight.startDate);
			};

			function _formatDate(date) {
				return $filter('date')(date, "MMM dd,yyyy");
			}

      function openTimeBaseSettingModal(){
        var modal = mmModal.open({
          templateUrl: 'campaignManagementApp/views/deliveryGroup/ads/area/active/rotationType/modal/dgTimeBaseSetUp.html',
          controller: 'timeBaseSettingCtrl',
          title: "Serve Settings",
          modalWidth: 650,
          bodyHeight: 350,
          discardButton: { name: "Cancel", funcName: "cancel" },
          additionalButtons: [
            { name: "Ok", funcName: "ok", hide: false, isPrimary: true}
          ],
          resolve: {
            weight: function () {
              return _.clone($scope.weight);
            }
          }
        });

        modal.result.then(function (weight) {
          $scope.weight = weight;
        }, function () {
          mmAlertService.closeError();
        });
      }

			$scope.onClick = function () {
				$timeout(function () {
					$scope.onLinkClick() || openTimeBaseSettingModal();
				}, 100);
			};
		}]
	}
}]
);