/**
 * Created by alon.shemesh on 4/3/14.
 */
/**
 * Created by eran.nachum on 1/2/14.
 */
'use strict';

app.controller('assetListCtrl', ['$scope', '$state', 'adService', '$modal', function ($scope, $state, adService, $modal) {

	$scope.hideGoTo = true;
	$scope.alerts = [];
	$scope.master = {};
	$scope.selectedAdAsset = {};

	var accountId = 1;

	$scope.entityId = accountId;
	$scope.type = 'asset';

	var centralAssetActions = [
		{ name: 'New', func: addAsset },
		{ name: 'Duplicate', func: duplicateAsset },
		{ name: 'Archive', func: archiveAsset},
		{ name: 'Delete', func: deleteAssets},
		{ name: 'Swap', func: swapAsset},
		{ name: 'Share', func: shareAsset},
		{ name: 'Assign', func: assignAsset},
		{ name: 'Preview', func: previewAsset}];

	$scope.centralDataObject = [
		{ type: 'asset', centralActions: centralAssetActions, isEditable: true, hideAddButton: true, dataManipulator: fillFields, }
	];

	function addAsset(list) {

		if ($scope.isModalOpen) {
			return;
		}
		$scope.isModalOpen = true;

		var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);
		var modalInstance = $modal.open({
			templateUrl: './adManagementApp/views/uploadAsset.html',
			controller: 'uploadAssetCtrl',
			backdrop: 'static',
			windowClass: 'upload-dialog',
			resolve: {
				adDetailsForUpload: function () {
					return adDetails;
				}
			}
		});
		modalInstance.result.then(function () {
			//console.log("Success");
			//TODO: refresh list to see new addition
			$scope.isModalOpen = false;
		}, function () {
			$scope.isModalOpen = false;
		});
	};

	function deleteAssets(list, selectedItems) {
		alert('todo deleteAsset');
		//no deleteAsset service at this time
		/*var f = [];
		for (var i = 0; i < selectedItems.length; i++) {
			f[i] = function(k){
				var asset = selectedItems[i];

				var promise = assetService.deleteAsset(asset);
				promise.then(function(asset){
						var index = _.indexOf(list, asset);
						list.splice(index, 1);
					},
					function(response){
						console.log("error deleting", response);
					});
			}(i);
		}*/
	}

	function duplicateAsset(list, selectedItems) {
		alert('todo duplicateAsset');
	}
	function archiveAsset(list, selectedItems) {
		alert('todo archiveAsset');
	}
	function swapAsset(list, selectedItems) {
		alert('todo swap');
	}
	function shareAsset(list, selectedItems) {
		alert('todo share');
	}
	function assignAsset(list, selectedItems) {
		alert('todo assign');
	}

	function previewAsset(list, selectedItems) {
		//console.log("selected items", selectedItems);
		//fit data object into modal view definition
		if (selectedItems.length > 0) {
			$scope.selectedAdAsset.assetId = selectedItems[0].assetId;
			$scope.selectedAdAsset.asset = selectedItems[0];
			//console.log("asset for preview", $scope.selectedAdAsset);
			$modal.open({
				templateUrl: 'adManagementApp/views/assetPreviewModal.html',
				controller: 'AssetPreviewModalCtrl',
				scope: $scope
			});
		}
	}

	function fillFields(assets) {
		$scope.assets = assets;
		_.each (assets, function(asset) {
			if (asset.thumbnails && asset.thumbnails.length > 0) {
				asset.thumbnail = asset.thumbnails[0].url;
			}
			asset.dimensions = adService.getAssetDimension(asset);
			asset.displayFileSize = parseSizeFromBytes(asset.formatContext.fileSize);
			switch(asset.mediaType) {
				case 'FLASH':
					asset['duration'] = asset.formatContext.duration;
					if (asset.swfContext && asset.swfContext.frameRate != null && typeof asset.swfContext.frameRate !== undefined ) {
						asset['frameRate'] = asset.swfContext.frameRate;
					}
					break;
				case 'VIDEO':
					asset['duration'] = asset.formatContext.duration;
					if (asset.videoStreamContext && asset.videoStreamContext.frameRate != null && typeof asset.videoStreamContext.frameRate !== undefined ) {
						asset['frameRate'] = asset.videoStreamContext.frameRate;
					}
					break;
				default:
					asset['duration'] = null;
					asset['frameRate'] = null;
			}
		})
		//console.log("augmented assets", $scope.assets);
	}

	function parseSizeFromBytes(fileSize){
		if(fileSize >= 1048576){
			fileSize=(fileSize/1048576).toFixed(2) +'MB';
		}
		else if(fileSize < 1048576){
			fileSize=(fileSize/1024).toFixed(2) +'KB';
		}
		return fileSize;
	}


}]);

app.controller('AssetPreviewModalCtrl', ['$scope', '$modalInstance',   function($scope, $modalInstance)
{
	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);
