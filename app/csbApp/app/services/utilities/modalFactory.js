/**
 * Created by Rick.Jones on 9/18/14.
 */
app.factory('modalFactory', [ 'mmModal', '$q',
  function (mmModal, $q) {
    var factory = {};

    factory.showPrompt = function (title, message, options) {
      var deferred = $q.defer();

      var height = (options && options.height) ? options.height : 150;
      var width = (options && options.width) ? options.width : 450;

      mmModal.open({
        templateUrl: './csbApp/app/views/ui/modal-prompt.html',
        controller: [ '$scope', '$modalInstance', function ($scope, $modalInstance) {
          $scope.message = message;

          $scope.ok = function () {
            deferred.resolve('ok');
            $modalInstance.close();
          };

          $scope.cancel = function () {
            deferred.reject('cancelled');
            $modalInstance.dismiss('cancel');
          };
        }],
        title: title,
        modalWidth: width,
        bodyHeight: height,
        confirmButton: { name: "OK", funcName: "ok", hide: false, isPrimary: true},
        discardButton: { name: "Cancel", funcName: "cancel"}
      });
      return deferred.promise;
    };

    return factory;
  }
]);