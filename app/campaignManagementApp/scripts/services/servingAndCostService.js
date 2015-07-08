'use strict';

app.service('servingAndCostService', ['enums', 'mmUtils', 'mmPermissions', 'mmRest', 'validationHelper',
  function (enums, mmUtils, mmPermissions, mmRest, validationHelper) {

    var hasCostPermissions = mmPermissions.hasPermissionBySession('ViewPlacementCostSettings');
    var scope;
    var errorObj = {text: ""};
    var validationResult = {isSuccess: false,'fields':[]};
    var cpmHardStop = enums.hardStop;
    var noneCpmHardStop = [
      enums.hardStop.getObject('KEEP_SERVING_AS_USUAL'),
      enums.hardStop.getObject('ON_END_DATE')
    ];
    var rateColumn = {
      field: 'rate',
      displayName: 'Rate',
      gridControlType: enums.gridControlType.getName("TextBox")
    };
    var gridButtons = [
      {
        name: "Add",
        func: createNewServingAndCost,
        isDisable: false
      },
      {
        name: "Remove",
        func: deleteServingAndCost,
        isDisable: true
      }
    ];
    var gridColumnDefinition = [
      {
        field: 'startDate',
        displayName: 'Start Date',
        isRequired: true,
        isColumnEdit: false,
        gridControlType: enums.gridControlType.getName("Date"),
        validationFunction: validateDate
      },
      {
        field: 'endDate',
        displayName: 'End Date',
        isRequired: true,
        isColumnEdit: false,
        gridControlType: enums.gridControlType.getName("Date"),
        validationFunction: validateDate
      },
      {
        field: 'costModel',
        displayName: 'Cost Model',
        listDataArray:  enums.packageCostModels,
        isRequired: true,
        gridControlType: enums.gridControlType.getName("SelectList"),
        functionOnCellEdit: onCostModelChanged
      },
      {
        field: 'units',
        displayName: 'Units',
        gridControlType: enums.gridControlType.getName("TextBox")
      },
      // Rate column comes here - protected by perissions
      {
        field: 'ignoreOverDelivery',
        displayName: 'Ignore Over Delivery',
        text: 'Ignore Over Delivery',
        isColumnEdit: false,
        gridControlType: enums.gridControlType.getName("SingleCheckbox")
      },
      {
        field: 'hardStopMethod',
        displayName: 'Stop Serving Method',
        listDataArray:  enums.hardStop,
        gridControlType: enums.gridControlType.getName("SelectList")
      }
    ];

    if(hasCostPermissions){
      gridColumnDefinition.splice(4, 0, rateColumn);
    }

    function onCostModelChanged(changedColumn, selectedValue, rowIndex, fieldName, changedRow, selectedObject, a, b, c){
      changeHardStopDataSource(selectedValue == enums.packageCostModels.getId("CPM"));
      scope.gridData.columns[3].isRequired = selectedValue == enums.packageCostModels.getId("CPM");

      if(selectedValue == enums.packageCostModels.getId("Flat Fee") || selectedValue == enums.packageCostModels.getId("Time based")){
        //TODO: when the grid supports disabling a textbox complete the below
        //In case that the cost model is Time Based/free/flat fee the "units" cell is disabled and filled with a label that says "–", and has a tooltip that says "not applicable in this cost model".
      }

      // TODO: change the unit label according to cost model
    }

    function changeHardStopDataSource(isCpm){
      scope.editObject.servingAndCostInfo.forEach(function(item){
        item.gridListDataArray = isCpm ? cpmHardStop : noneCpmHardStop;
        scope.gridData.columns[5].listDataArray = isCpm ? cpmHardStop : noneCpmHardStop;
      });
    }

    function getDefaultValues(){
      var costAndServingObj = {
        id: mmUtils.clientIdGenerator.next(),
        startDate: null,
        endDate: null,
        costModel: enums.packageCostModels.getId("CPM"),
        units: null,
        ignoreOverDelivery: false,
        hardStopMethod: enums.hardStop.getId("Keep serving as usual"),
        gridListDataArray: cpmHardStop
      };

      if(hasCostPermissions){
        costAndServingObj['rate'] = null;
      }

      return costAndServingObj;
    }

    function createNewServingAndCost(){
      if(scope.editObject.servingAndCostInfo.length < 1){
        scope.editObject.servingAndCostInfo.push(getDefaultValues());
        //scope.gridData.buttons[0].isDisable = true;
      } else {
        var newRow = _.clone(scope.editObject.servingAndCostInfo[scope.editObject.servingAndCostInfo.length - 1]);
        newRow.id = mmUtils.clientIdGenerator.next();
        scope.editObject.servingAndCostInfo.push(newRow);
      }
      scope.gridData.columns[3].isRequired = true;
    }

    function deleteServingAndCost(){
      if (scope.selected.servingAndCosts.length > 0) {
        scope.selected.servingAndCosts.forEach(function(selectedItem){
          _.remove(scope.editObject.servingAndCostInfo, function(currentItem) {
            return currentItem.id === selectedItem.id;
          });
        });
      }
      scope.selected.servingAndCosts.length = 0;
    }

    function onSelectedItem(){
      scope.$root.isDirtyEntity = true;
    }

    function getCpmHardStop(type){
      return (type == enums.packageCostModels.getId("CPM")) ? cpmHardStop : noneCpmHardStop;
    }

    function init(controllerScope){
      if(controllerScope){
        scope = controllerScope;
      }

      //TODO: this is a patch since the package model is different than the placement model
      if(!scope.editObject){
        scope.editObject = {
          servingAndCostData: {
            mediaServingData: {
              startDate: null,
              endDate: null,
              units: null,
              hardStopMethod: enums.hardStop.getId("Keep serving as usual")
            },
            mediaCostData: {
              costModel: enums.packageCostModels.getId("CPM"),
              ignoreOverDelivery: false,
              rate: null
            }
          }
        }
      } else if(!scope.editObject.servingAndCostData){
        scope.editObject.servingAndCostData = {
          mediaCostData: scope.editObject.mediaCostData,
          mediaServingData: scope.editObject.mediaServingData
        }
      }

      scope.gridData = {
        columns: gridColumnDefinition,
//      buttons: gridButtons,
        selectedAction: onSelectedItem,
        validationHandler: validationHandler
      };

      validationResult['fields'] = [];
      errorObj.text = "";

      var defaultServingAndCost;
      if(scope.editObject.servingAndCostData){
        defaultServingAndCost = {
          id: mmUtils.clientIdGenerator.next(),
          startDate: scope.editObject.servingAndCostData.mediaServingData.startDate,
          endDate: scope.editObject.servingAndCostData.mediaServingData.endDate,
          costModel: scope.editObject.servingAndCostData.mediaCostData.costModel,
          units: scope.editObject.servingAndCostData.mediaServingData.units,
          ignoreOverDelivery: scope.editObject.servingAndCostData.mediaCostData.ignoreOverDelivery,
          hardStopMethod: scope.editObject.servingAndCostData.mediaServingData.hardStopMethod,
          gridListDataArray: getCpmHardStop(scope.editObject.servingAndCostData.mediaCostData.costModel)
        };

        if(hasCostPermissions){
          defaultServingAndCost['rate'] = scope.editObject.servingAndCostData.mediaCostData.rate;
        }

        if (scope.editObject.id == null && scope.campaignId != undefined){
          mmRest.campaign(scope.campaignId).get().then(
            function (campaign) {
              if (campaign.adminSettings.campaignSettings != null){
                defaultServingAndCost.hardStopMethod = campaign.adminSettings.campaignSettings.hardStopMethod;
                scope.editObject.servingAndCostData.mediaServingData.hardStopMethod = campaign.adminSettings.campaignSettings.hardStopMethod;
              }
            },
            function (error) {
              console.log(error)
            }
          )
        }
        //else{
        //  defaultServingAndCost.hardStopMethod = scope.editObject.servingAndCostData.mediaServingData.hardStopMethod;
        //}
      } else {
        defaultServingAndCost = getDefaultValues();
      }

      scope.editObject.servingAndCostInfo = [ defaultServingAndCost ];
      scope.selected.servingAndCosts = [];
      scope.gridData.columns[3].isRequired = scope.editObject.servingAndCostData.mediaCostData.costModel == enums.packageCostModels.getId("CPM");
    }

    // This is a temporary method till the server supports an array of flat objects
    function tempSetServingAndCostData(){
      scope.editObject.servingAndCostInfo.forEach(function(item){
        scope.editObject.servingAndCostData.mediaServingData.startDate = fixDateTimeZone(item.startDate);
        scope.editObject.servingAndCostData.mediaServingData.endDate = fixDateTimeZone(item.endDate);
        scope.editObject.servingAndCostData.mediaServingData.units = item.units;
        scope.editObject.servingAndCostData.mediaServingData.hardStopMethod = item.hardStopMethod;
        scope.editObject.servingAndCostData.mediaCostData.costModel = item.costModel;
        scope.editObject.servingAndCostData.mediaCostData.ignoreOverDelivery = item.ignoreOverDelivery;
        if(hasCostPermissions){
          scope.editObject.servingAndCostData.mediaCostData.rate = item.rate;
        }
      });
    }

    function fixDateTimeZone(date){
      return date.setMinutes == undefined ? date : date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    }

    function validationHandler() {
      return validationResult ;
    }

    function validate(){
      var validStartDate = true;
      var validEndDate = true;
      var validDates = true;
      var validUnits = true;
      var validUnitsNotEmpty = true;
      validationResult = {isSuccess: false,'fields':[]};

      scope.editObject.servingAndCostInfo.forEach(function(selectedItem){
        errorObj.text = "";

        if (selectedItem.startDate == undefined){
          selectedItem.startDate = null;
        }

        if (selectedItem.endDate == undefined){
          selectedItem.endDate = null;
        }

        validStartDate = validationHelper.singleDatePickerRequiredValidation({value: selectedItem.startDate, fieldName: scope.gridData.columns[0].displayName, error: errorObj})
        if (!validStartDate){
          validationResult.fields.push({
            fieldName: scope.gridData.columns[0].field,
            value: selectedItem[scope.gridData.columns[0].field],
            message: errorObj.text});
        }

        validEndDate = validationHelper.singleDatePickerRequiredValidation({value: selectedItem.endDate, fieldName: scope.gridData.columns[1].displayName, error: errorObj});
        if (!validEndDate){
          validationResult.fields.push({
            fieldName: scope.gridData.columns[1].field,
            value: selectedItem[scope.gridData.columns[1].field],
            message: errorObj.text});
        }

        validDates = validationHelper.isEndGreaterThanStartDate({startDate: selectedItem.startDate, endDate: selectedItem.endDate, error: errorObj});
        if(!validDates){
          validationResult.fields.push({
            fieldName: scope.gridData.columns[1].field,
            value: selectedItem[scope.gridData.columns[1].field],
            message: errorObj.text});
        }

        if(scope.gridData.columns[3].isRequired){
          if(selectedItem.units == null || selectedItem.units == ""){
            validationResult.fields.push({
              fieldName: scope.gridData.columns[3].field,
              value: selectedItem[scope.gridData.columns[3].field],
              message: 'This field can not be empty.'});
            validationResult.isSuccess = false;
            validUnitsNotEmpty = false;
          } else {
            validUnits = validateUnits(selectedItem);
          }
        } else if(selectedItem.units != null && selectedItem.units != ""){
          validUnits = validateUnits(selectedItem);
        }
      });

      return validDates && validStartDate && validEndDate && validUnits && validUnitsNotEmpty;
    }

    function validateUnits(selectedItem){
      var validUnits = validationHelper.isPositiveInteger({value: selectedItem.units, error: errorObj});
      if(!validUnits){
        validationResult.fields.push({
          fieldName: scope.gridData.columns[3].field,
          value: selectedItem[scope.gridData.columns[3].field],
          message: errorObj.text});
      }
      return validUnits
    }

    function validateDate(data, row, col){
      validationResult = {isSuccess: false,'fields':[]};
      var result = true;
      var validDate = validationHelper.singleDatePickerRequiredValidation({value: data.mmModel, fieldName: col.displayName, error: errorObj})
      if (!validDate){
        validationResult.fields.push({
          fieldName: col.field,
          value: col,
          message: errorObj.text});
        result = false;
      }

      validationResult.isSuccess = result;

      return validationResult;
    }

    return {
      init: init,
      validate: validate,
      getGridColumnDefinition: gridColumnDefinition,
      getGridButtons: gridButtons,
      getDefaultValues: getDefaultValues,
      getCpmHardStop: getCpmHardStop,
      tempSetServingAndCostData: tempSetServingAndCostData
    };
  }]);
