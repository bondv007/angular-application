(function () {

  'use strict';
  /**
   * Created by matan.werbner on 2/17/15.
   */


  app.service('mmFeatureFlagService', ['mmSession', 'EC2Restangular', '$q', '$interval','configuration', function (session, EC2Restangular, $q, $interval,configuration) {

    var my = this,
      ffUrl = "fflags?enabled=true",
      Flags = null,
      deferred = $q.defer();

    getFlags();

    $interval(function(){
      deferred = $q.defer();
      getFlags();
    },configuration.featureToggleInterval);

    this.GetFlags = function(){
      return Flags;
    }

    this.IsFeatureOn = function (featureKey) {
      return angular.isArray(Flags) && (Flags.indexOf(featureKey) > -1);
    }

    this.GetFlagsAsync = function(){
      return deferred.promise;
    }

    function getFlags() {
      EC2Restangular.all(ffUrl).getList().then(function (result) {

        Flags = result;
        deferred.resolve(Flags);
      });
    }

  }]);

})(angular);
