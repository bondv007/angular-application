'use strict';
/**
 * Created by atdg on 3/27/2014.
 */

app.service('assetService', ['EC2Restangular', 'EC2AMSRestangular', '$q', 'enums', 'configuration', function (EC2Restangular, EC2AMSRestangular, $q, enums, conf) {

	//update to new endpoints
	var serverGetAssets = EC2Restangular.all('assetMgmt');
	var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');
	var serverPostAssetMetadata = EC2Restangular.all('mediaPrep/updateMetadataByCorrelationId/');
	var postAssetMetaDataUrl = 'mediaPrep/updateMetadataByCorrelationId/';
	var getAssetsUrl = 'assetMgmt';
	//var assetUploadUrl = conf.ec2 + 'mediaPrep/upload';
	var tempResourceUrl = conf.resource;
  var assetUploadUrl = "http://localhost/webservice.php";

	var assets = [
		{ "assetId": 1000003283, "title": "Sample asset 1", "assetType": "source", "mediaType": "image", "mimeType": "image/gif", "status": "available"},
		{ "assetId": 1000003284, "title": "Sample asset 2", "assetType": "source", "mediaType": "image", "mimeType": "image/jpeg", "status": "available"},
		{ "assetId": 1000003285, "title": "Sample asset 3", "assetType": "source", "mediaType": "image", "mimeType": "image/jpeg", "status": "available"}
	];

	var assetServiceUrl = 'assets';

	return {
		getAssets: function() {
			return assets;
		},
		getVariants: function() {
			return variants;
		},
		getAllAssets: function() {
			var deferred = $q.defer();

			EC2Restangular.all(getAssetsUrl).getList().then(function (data) {
					deferred.resolve(data);
				},
				function (response) {
					deferred.reject(response);
				});

			return deferred.promise;
		},

		postAssetMetaData: function(assetMetaData, id) // function to upload asset information
		{
			var deferred = $q.defer();

			EC2AMSRestangular.all(postAssetMetaDataUrl+id).post(assetMetaData).then(function (data) {
					deferred.resolve(data);
				},
				function (response) {
					deferred.reject(response);
				});

			return deferred.promise;
		},
		getAssetUploadUrl: function(){
			return assetUploadUrl;
		},
		getTempResourceUrl: function(){
			return tempResourceUrl;
		},
		getAssetById: function (id) {
			var deferred = $q.defer();
			EC2Restangular.one(getAssetsUrl, id).get().then(function (asset) {
				deferred.resolve(asset);
			}, function (response) {
				deferred.reject(response);
			});
			return deferred.promise;
		},
		searchAssets: function(requestBody) {
			var deferred = $q.defer();
			serverSearchAssets.post(requestBody, {}).then(function (data) {
					deferred.resolve(data.entity);
				},
				function (response) {
					deferred.reject(response);
				});

			return deferred.promise;
		},
		deleteAsset: function(asset){
			var deferred = $q.defer();
			EC2Restangular.one(getAssetsUrl, asset.assetId).remove().then(function () {
					deferred.resolve(asset);
			}, function (response) {
					deferred.reject(response);
			});
			return deferred.promise;
		}
	}
}]);
