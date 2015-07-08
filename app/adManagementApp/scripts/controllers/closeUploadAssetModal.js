/**
 * Created by atdg on 5/30/2014.
 */

'use strict';
app.controller('closeUploadAssetModalCtrl', ['$rootScope', '$scope', '$modalInstance','$modal', '$timeout',
	function ($rootScope, $scope, $modalInstance, $modal, $timeout) {

		$scope.close = function () {
			$modalInstance.close('hide');
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$timeout(function () {
			var mainParent = $(".upload-close").parent().parent();
			mainParent.before("<div id='confirmbackdrop' ng-style='{'z-index': 1040 + index*10}' ng-class='{in: animate}' class='modal-backdrop fade in' modal-backdrop='' style='z-index: 1050;'></div>")
			mainParent.css({"margin-top": "100px", "width": "480px"});
		}, 20);

	}]);
