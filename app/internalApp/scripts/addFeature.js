/**
 * Created by Guni.Yankelovitz on 8/28/14.
 */
'use strict';

app.controller('addFeatureCtrl', ['$scope', '$modalInstance', 'features', 'teams', 'mmAlertService', 'validationHelper',
  function ($scope, $modalInstance, features, teams, mmAlertService, validationHelper) {
    $scope.features = features;
    $scope.teams = teams;

    $scope.newFeature =
    {
      name: null,
      description: null,
      teams: [],
      creationDate: null
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.save = function () {
      if (!validateFeature())
        return;
      //else
      $scope.newFeature.creationDate = new Date().toLocaleDateString();

      $modalInstance.close($scope.newFeature);
    };

    function validateFeature() {
      var name = $scope.newFeature.name;
      var description = $scope.newFeature.description;
      var teams = $scope.newFeature.teams;

      //check values are not null
      if (name == null || description == null || teams === null || teams.length === 0) {
        mmAlertService.addError("Error: Fill in all values");
        return false;
      }
      var nameValidationError = {text: ''};
      //check feature name is valid
      if (!validationHelper.isValidZookeeperNodeName({value: name, error: nameValidationError, fieldName: "Feature name"}, $scope.features)) {
        mmAlertService.addError("Error: " + nameValidationError.text);
        return false;
      }

      return true;
    }
  }]);
