/**
 * Created by roi.levy on 1/7/15.
 */
app.service('inStreamTemplateService',['EC2Restangular', '$q', function(EC2Restangular, $q){

	var saveXSlt = function(xslt){
		var deferred = $q.defer();
		EC2Restangular.all('inStreamTemplates/xslt').post(xslt).then(function(result){
			deferred.resolve(result);
		},function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	};

	var saveTemplate = function(template){
		var deferred = $q.defer();
		EC2Restangular.all('inStreamTemplates').post(template).then(function(result){
			deferred.resolve(result);
		},function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	};

	var updateTemplate = function(template){
		var deferred = $q.defer();
		//EC2Restangular.all('inStreamTemplates').customPUT(template);
		template.put().then(function(result){
			deferred.resolve(result);
		},function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	}

	function getBaseTemplates(){
		var deferred = $q.defer();
		EC2Restangular.all('inStreamTemplates').getList({justBases: true, withRoots: true}).then(function(inStreamTemplates){
			deferred.resolve(inStreamTemplates);
		},function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	}

	function deleteTemplates(inStreamTemplates){
		var deferred = $q.defer();
		var templateIds = [];
		for (var i = 0; i < inStreamTemplates.length; i++ ) {
			templateIds.push(inStreamTemplates[i].id);
		}

		EC2Restangular.all('inStreamTemplates').customPOST(templateIds, 'delete').then(function (result) {
			deferred.resolve(result);
		}, function (response) {
			deferred.reject(response);
		});
		return deferred.promise;
	}

	return{
		"saveXSlt": saveXSlt,
		"saveTemplate": saveTemplate,
		getBaseTemplates: getBaseTemplates,
		updateTemplate: updateTemplate,
		deleteTemplates: deleteTemplates
	}

}]);
