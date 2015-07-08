app.factory( 'pdf', [ '$q', 'EC2Restangular', 'restPaths', 'csb',
	function( $q, EC2Restangular, restPaths, csb ) {

		var pub = {};

		pub.exportPDF = function( data ) {

			var deferred = $q.defer();

			// first get the HTML file which has mustache embedded
			EC2Restangular.oneUrl(restPaths[csb.config.env].pdfFile, '/csbApp/app/views/pdf-with-mustache.html' ).get().then(
				function( response ) {

					// render with mustache (replaces curlys with the data provided)
					var htmlString = Mustache.render( response, data );

					// now build the PDF object that the server expects
					var postData = {
						type: 'htmlToPdf',
						source: htmlString
					};

					EC2Restangular.all(restPaths[csb.config.env].preview).all(restPaths.exportPdf).post( postData ).then(
						function( response ) {
							deferred.resolve( response.url );
						},
						function( error ) {
							deferred.reject('There was an error exporting your strategy. Please try again later.');
						}
					);

				}
			);

			return deferred.promise;

		};

		return pub;

	}
]);