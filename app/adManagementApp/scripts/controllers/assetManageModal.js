'use strict';
app.controller('AssetManageModalCtrl', ['$scope', '$fileUploader', '$modalInstance', 'EC2Restangular', 'adService', 'mmAlertService',
	function($scope, $fileUploader, $modalInstance, EC2Restangular, adService, mmAlertService)
{
	var serverAssets = EC2Restangular.all('assetMgmt');

  $scope.assets = [];
  $scope.modalSelectedAssets = [];

  serverAssets.getList().then(function (all) {
    $scope.assets = all;

  }, function (response) {
    console.log(response);
  });

  $scope.removeAssets = function()
  {
    _.each($scope.modalSelectedAssets, function (asset, index) {

			var promise = adService.deleteAsset(asset);
			promise.then(function(asset){
				$scope.assets.splice(asset, 1);
			},
			function(response){
				console.log(response);
			});
    });
    $scope.selectedAssets = [];
  };

  var uploader = $scope.uploader = $fileUploader.create({
    scope: $scope,                          // to automatically update the html. Default: $rootScope
    url: 'url',
    formData: [
      { key: 'value' }
    ],
    filters: [
      function (item) {                    // first user filter
        console.info('filter1');
        return true;
      }
    ]
  });

  // ADDING FILTERS

  uploader.filters.push(function (item) { // second user filter
    console.info('filter2');
    return true;
  });

  uploader.bind('afteraddingfile', function (event, item) {
    console.info('After adding a file', item);
  });

  uploader.bind('afteraddingall', function (event, items) {
    console.info('After adding all files', items);
  });

  uploader.bind('beforeupload', function (event, item) {
    console.info('Before upload', item);
  });

  uploader.bind('progress', function (event, item, progress) {
    console.info('Progress: ' + progress, item);
  });
  uploader.bind('success', function (event, xhr, item, response) {
    console.info('Success', xhr, item, response);
  });

  uploader.bind('cancel', function (event, xhr, item) {
    console.info('Cancel', xhr, item);
  });

  uploader.bind('error', function (event, xhr, item, response) {
    console.info('Error', xhr, item, response);
  });

  uploader.bind('complete', function (event, xhr, item, response) {
    console.info('Complete', xhr, item, response);
  });

  uploader.bind('progressall', function (event, progress) {
    console.info('Total progress: ' + progress);
  });

  uploader.bind('completeall', function (event, items) {
    console.info('Complete all', items);
    $.each(items, function(i, item) {
      var asset = { name: item.file.name, type: item.file.type, fileName: item.file.name, size: item.file.size};

			serverAds.post(asset).then(function(asset){
				$scope.assets.push(asset);
				$scope.modalSelectedAssets.push(asset);
        mmAlertService.addSuccess("Asset has been saved successfully.");
			}, processError);
    });
  });

	function processError(error) {
		console.log(error);
    mmAlertService.addError("Server error. Please try again later.");
	}

  $scope.ok = function () {
		var selected = $scope.modalSelectedAssets[0];
		console.log(selected);
    $scope.modalSelectedAssets = [];
    $modalInstance.close(selected);
  };

  $scope.cancel = function () {

    $scope.modalSelectedAssets = [];
    $modalInstance.dismiss('cancel');
  };
}]);
