'use strict';

app.factory( 'csbPermissions', [ 'EC2Restangular', 'csb', '$q',
    function( EC2Restangular, csb, $q ) {

		var pub = {};

		var admin = EC2Restangular.all( 'admin' );

		pub.getPermissions = function() {

			var deferred = $q.defer();

			var requestData = {
				"entities": [
					{
						"type": "userPermissionsRequest",
						"clientRefId": "100000",
						"userId": csb.params.userID,
						"permissionsNamesList": [
							"AccountCSBEditMode",
							"AccountCSBViewOnly"
						]
					}
				]
			};

			admin.all( 'permissions/' ).post( requestData ).then(
				function( response ) {
					deferred.resolve( response[0] );
				}
			);

			return deferred.promise;

		};

		return pub;

    }
]);
