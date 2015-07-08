/**
 * Created by Guni.Yankelovitz on 8/31/14.
 */
'use strict';

app.controller('editFeatureRulesCtrl', ['$scope', 'enums', '$modal', '$modalInstance', 'mmAlertService', 'EC2Restangular', 'feature',
  function ($scope, enums, $modal, $modalInstance, mmAlertService, EC2Restangular, feature) {

    var serverConfig = EC2Restangular.all('configuration/fflags/');

    serverConfig.get(feature.name).then(getData, processError);

    $scope.rules = [];

    function getData(data) {
      $scope.rules = data;
      $scope.defaultRule = $scope.rules.shift();
    }

    function processError(error) {
      console.log('Server error');
      console.log(error);
      if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later.");
      } else {
//				mmAlertService.addError(error.data.error);
      }
    }

    $scope.isEditMode = true;

    $scope.discard = function () {
      $modalInstance.close("canel");
    };

    $scope.defaultRuleOptions = enums.fflagsDefaultRuleOptions;

    $scope.columnDefs = [
      {field: 'priority', displayName: 'Priority', width: 100, validationFunction: validatePriorityInRow, gridControlType: enums.gridControlType.getName("TextBox"), isShowToolTip: true, enableDragDrop: true},
      {field: 'context', displayName: 'Context', width: 150, validationFunction: getValidateNotNullFunc('context'), listDataArray: enums.fflagsContextOptions, gridControlType: enums.gridControlType.getName("SelectList"), enableDragDrop: true},
      {field: 'key', displayName: 'Key', width: 150, validationFunction: getValidateNotNullFunc('key'), listDataArray: enums.fflagsRequestContextKeyOptions, gridControlType: enums.gridControlType.getName("SelectList"), enableDragDrop: true},
      {field: 'isStatusIsEnabled', displayName: 'Status', width: 150, validationFunction: getValidateNotNullFunc('isStatusIsEnabled'), listDataArray: enums.fflagsStatusOptions, gridControlType: enums.gridControlType.getName("SelectList"), enableDragDrop: true},
      {field: 'value', displayName: 'Value', width: 150, validationFunction: getValidateNotNullFunc('value'), gridControlType: enums.gridControlType.getName("TextBox"), enableDragDrop: true}
    ];

    //These are the items which are selected in grid.Two way binding with grid.
    $scope.item = {selectedItems: []};

    //used to render buttons above grid
    $scope.gridButtonActions = [
      {
        name: "New Rule",
        func: addNewRule,
        isDisable: false
      },
      {
        name: "Delete",
        func: deleteRules,
        isDisable: false
      }
    ];


    function deleteRules() {
      if ($scope.item.selectedItems.length > 0) {
        var index = $scope.item.selectedItems.length - 1;
        while (index >= 0) {
          var itemToDelete = $scope.item.selectedItems[index];
          $scope.rules.splice($scope.rules.indexOf(itemToDelete), 1);
          $scope.item.selectedItems.splice(index, 1);
          errorsCount -= Object.keys(itemToDelete.unValidFields).length;
          index--;
        }
      }
    }

    function createNewRule() {
      $scope.newRule =
      {
        priority: null,
        context: "RequestContext",
        key: "user_id",
        isStatusIsEnabled: true,
        value: null
      }
    }

    function addNewRule() {
      createNewRule();
      $scope.rules.push($scope.newRule);
      //Add validation data
      var unValidFields = {};
      for (var i =0; i < $scope.columnDefs.length; i++) {
        var field = $scope.columnDefs[i].field;
        checkForNewErrors(unValidFields, field, $scope.newRule[field] !== null);
      }
      $scope.newRule.unValidFields = unValidFields;
    }

    //Validation functions
    var errorsCount = 0;

    function checkForNewErrors(notValidList, field, isValid) {
      if (notValidList[field] !== undefined && isValid) {
        errorsCount--;
        delete notValidList[field];
      }
      else if (notValidList[field] === undefined && !isValid) {
        errorsCount++;
        notValidList[field] = "";
      }
    }

    function getValidateNotNullFunc(field) {
      var message = field + " cannot be null or an empty string";
      function validateNotNull(row) {
        var property = row.entity[field];
        var result = (property !== null) && (property !== '');

        if (row.entity.unValidFields === undefined)
          row.entity.unValidFields = {};
        checkForNewErrors(row.entity.unValidFields, field, result );

        return {isSuccess: result, message: message};
      }
      return validateNotNull;
    }

    function validatePriorityInRow(row) {
      var priority = row.entity.priority;
      var result = (!isNaN(priority) && priority % 1 == 0 && priority >= 1);

      if (row.entity.unValidFields === undefined)
        row.entity.unValidFields = {};
      checkForNewErrors(row.entity.unValidFields, "priority", result );

      return {isSuccess: result, message: "Priority must be a positive number"};
    }

    $scope.done = function () {
      $scope.rules.id = feature.name;
      if (errorsCount == 0)
        $scope.rules.put({"defaultRule": [$scope.defaultRule.isStatusIsEnabled, $scope.defaultRule.next]}).then(savedSuccess, savedFailure);
      else
        mmAlertService.addError("Error: Fill in missing values and fix errors");
    };

    function savedSuccess() {
      mmAlertService.addSuccess("Saved data");
      $modalInstance.close("done");
    }

    function savedFailure() {
      mmAlertService.addError("Error: Failure saving data");
    }
  }]);