app.factory( 'pdf', [ '$q', 'EC2Restangular',
	function( $q, EC2Restangular ) {

		var pub = {};

		pub.exportPDF = function( htmlString ) {

			var deferred = $q.defer();

			var postData = {
				type: 'htmlToPdf',
				source: htmlString
			};

			EC2Restangular.all( 'preview' ).all( 'exportPdf/' ).post( postData ).then(
				function( response ) {
					deferred.resolve( response.url );
				},
				function( error ) {
					deferred.reject('There was an error exporting your strategy. Please try again later.');
				}
			);

			return deferred.promise;

		};

		return pub;

	}
]);