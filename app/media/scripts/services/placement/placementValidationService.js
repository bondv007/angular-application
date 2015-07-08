/**
 * Created by Ofir.Fridman on 3/25/2015.
 */
'use strict';
app.service('placementValidationService', ['validationHelper', 'mmAlertService', 'placementHelperService', 'servingAndCostService',
  function (validationHelper, mmAlertService, placementHelperService, servingAndCostService) {

    function saveValidation(placement,placementViewSettings) {
      var valid = true;
      initError(placement);
      if (!placementNameValidation(placement.name, placement.errors.placementName)) {
        valid = false;
      }
      if (!isSiteSelected(placement)) {
        valid = false;
      }
      if (!isSectionSelected(placement)) {
        valid = false;
      }
      if (!isDimensionsSelected(placement)) {
        valid = false;
      }
      if (!servingAndCostService.validate()) {
        mmAlertService.addError("error_InServingAndCost");
        placementViewSettings.servingAndCost.open = true;
        valid = false;
      }
      return valid;
    }

    function placementNameValidation(placementName, errorObj) {
      var validationTypes = [
        {func: validationHelper.requiredValidation},
        {func: validationHelper.isValidChars}
      ];
      var valid = validationHelper.isValid({value: placementName, error: errorObj, fieldName: "Name"}, validationTypes);
      if (!valid) {
        mmAlertService.addError("error_placementNameNotValid");
      }
      return valid;
    }

    function isSiteSelected(placement) {
      var valid = validationHelper.requiredValidation({
        value: placement.siteId,
        error: placement.errors.siteName,
        fieldName: "Site"
      });
      if (!valid) {
        mmAlertService.addError("error_placementSiteNotSelected");
      }
      return valid;
    }

    function isSectionSelected(placement) {
      var valid = validationHelper.requiredValidation({
        value: placement.sectionId,
        error: placement.errors.sectionName,
        fieldName: "Section"
      });
      if (!valid) {
        mmAlertService.addError("error_placementSectionNotSelected");
      }
      return valid;
    }

    function isDimensionsSelected(placement) {
      var valid = true;
      if (placementHelperService.isInBannerPlacement(placement)) {
        if (placement.bannerSize.width != null) {
          placement.bannerSize.width = placement.bannerSize.width.toString()
        }

        valid = validationHelper.requiredValidation({
          value: placement.bannerSize.width,
          error: placement.errors.dimensions,
          fieldName: "Dimensions"
        });
        if (valid) {
          if (placement.bannerSize.height != null) {
            placement.bannerSize.height = placement.bannerSize.height.toString()
          }
          valid = validationHelper.requiredValidation({
            value: placement.bannerSize.height,
            error: placement.errors.dimensions,
            fieldName: "Dimensions"
          });
        }
        if (!valid) {
          mmAlertService.addError("error_placementDimensionNotSelected");
        }
      }

      return valid;
    }

    function initError(placement) {
      if (!placement.errors) {
        placement.errors = {
          placementName: {text: ''},
          siteName: {text: ''},
          sectionName: {text: ''},
          dimensions: {text: ''}
        };
      }
    }

    return {
      saveValidation: saveValidation
    };
  }]);
