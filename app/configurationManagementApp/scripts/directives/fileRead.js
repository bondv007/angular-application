///**
// * Created by roi.levy on 1/6/15.
// */
app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "=",
			fileMetaData: "="
        },
        link: function (scope, element, attributes) {

            element.bind("change", onFileSelect);

            scope.$on('destroy', function(){
             //   element.unbind('change', onFileSelect);
            });

            function onFileSelect(changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
				scope.fileMetaData = changeEvent.target.files[0];
                if(changeEvent.target.files[0]){
					reader.readAsText(changeEvent.target.files[0]);
				}
				element.val(null);

			};
        }
    }
}]);