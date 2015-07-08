/**
 * Created by Rick.Jones on 9/18/14.
 */
app.factory('modalFactory', [ '$modal', '$q',
    function($modal, $q) {

        var factory = {};

        factory.showPrompt = function(title, message, options){
            var deferred = $q.defer();
  
            if (typeof options == "undefined") {
                options = {};
            }

            var promptModal = $modal.open({
                templateUrl: 'csbApp/app/views/ui/modal-prompt.html',
                controller: [ '$scope', '$modalInstance', function( $scope, $modalInstance) {

                    $scope.title = title;
                    $scope.message = message;

                    $scope.showCancelButton = typeof options.showCancelButton != "undefined" ? options.showCancelButton : true;

                    $scope.ok = function(){
                        deferred.resolve('ok');
                        $modalInstance.close();
                    };

                    $scope.cancel = function(){
                        deferred.reject('cancelled');
                        $modalInstance.dismiss('cancel');
                    };

                }]
            });

            return deferred.promise;

        };

        return factory;

    }

]);