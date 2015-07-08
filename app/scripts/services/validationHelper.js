/**
 * Created by Ofir.Fridman on 8/25/14.
 */
'use strict';

app.service('validationHelper', [function () {

	var gridValidationHelper = {
		validateUrl: function(entity, field){
			var result = {
				isSuccess: true,
				message: []
			};
			var validUrl = /^(http|https):\/\/[^ "]+$/;
			if(entity[field] && !validUrl.test(entity[field])){
				result.message.push("Not Valid URL");
				result.isSuccess =  false;
			}
			return result;
		}
	}

    function createErrorText(fieldObj, errorText) {
        fieldObj.error.text = (fieldObj.fieldName) ? fieldObj.fieldName + " " + errorText.trim() : errorText.trim();
        fieldObj.error.text += (fieldObj.error.text[fieldObj.error.text.length - 1] == ".") ? "" : ".";
    }

    function isValid(fieldObj, validationTypes) {
        var valid = true;
        var stop = validationTypes.length;
        for (var i = 0; i < stop; i++) {
            valid = validationTypes[i].func(fieldObj);
            if (!valid) {
                break;
            }
        }
        return valid;
    }

    function isValidEmailFormat(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        var validEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (!validEmail.test(fieldObj.value)) {
            createErrorText(fieldObj, "Invalid email format");
            valid = false;
        }
        return valid;
    }

    function isValidUrlFormat(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        var validUrl = /^(http|https):\/\/[^ "]+$/;
        if (!validUrl.test(fieldObj.value)) {
            createErrorText(fieldObj, "Please enter valid url");
            valid = false;
        }
        return valid;
    }

    function requiredValidation(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        if (_.isEmpty(fieldObj.value)) {
            createErrorText(fieldObj, "is required");
            valid = false;
        }
        return valid;
    }

    function maxLengthValidation(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        if (fieldObj.value.length > fieldObj.maxLength) {
            createErrorText(fieldObj, "exceeds the maximum length of " + fieldObj.maxLength + " characters.");
            valid = false;
        }
        return valid;
    }

    function singleDatePickerRequiredValidation(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        if (!moment(fieldObj.value).isValid()) {
            createErrorText(fieldObj, "is required");
            valid = false;
        }
        return valid;
    }

    function rangeDatePickerRequiredValidation(fieldObj) {
        var valid = true;
        if (!moment(fieldObj.startDate).isValid() || !moment(fieldObj.endDate).isValid()) {
            createErrorText(fieldObj, "Start Date and End date are required");
            valid = false;
        }
        return valid;
    }

    function isStartDateEqualOrGreaterThanToday(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        if (moment(fieldObj.startDate).isBefore(moment(new Date().setHours(0, 0, 0, 0)))) {
            createErrorText(fieldObj, "The start date should be scheduled for today or a later date.");
            valid = false;
        }
        return valid;
    }

    function isEndGreaterThanStartDate(fieldObj) {
        var valid = true;
        if (moment(fieldObj.startDate).isAfter(moment(fieldObj.endDate))) {
            createErrorText(fieldObj, "The end date must be later than the start date");
            valid = false;
        }
        return valid;
    }

    function rangeDatePickerValidation(fieldObj) {
        var valid = _.isEmpty(fieldObj.error.text);
        if (valid) {
            var valid = rangeDatePickerRequiredValidation(fieldObj);
          if(valid){
            valid = isEndGreaterThanStartDate(fieldObj);
          }
        }

        return valid;
    }

    function isPositiveInteger(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        var validInteger = /^\+?(0|[1-9]\d*)$/;
        var number = fieldObj.value;
        if (fieldObj.value === undefined || fieldObj.value === null || !(validInteger.test(number) && number > 0)) {
            createErrorText(fieldObj, "must be a positive number");
            valid = false;
        }
        return valid;
    }

    function isValidChars(fieldObj) {
        var valid = true;
        fieldObj.error.text = "";
        var specialChars = "<>'\"";
        for (var i = 0; i < specialChars.length; i++) {
            if (fieldObj.value.indexOf(specialChars[i]) > -1) {
                createErrorText(fieldObj, "includes unsupported characters");
                valid = false;
                break;
            }
        }
        return valid;
    }

    function isValidZookeeperNodeName(fieldObj, namesInDb) {
        fieldObj.error.text = "";
        var specialChars = " .\\/";
        var RESERVED_TOKEN = "zookeeper";

        for (var i = 0; i < specialChars.length; i++) {
            if (fieldObj.value.indexOf(specialChars[i]) > -1) {
                createErrorText(fieldObj, "includes unsupported characters: \'" + specialChars[i] + "\' ");
                return false;
            }
        }

        if (fieldObj.value == RESERVED_TOKEN) {
            createErrorText(fieldObj, "cannot be 'zookeeper'");
            return false;
        }

        if (namesInDb.indexOf(fieldObj.value) != -1) {
            createErrorText(fieldObj, "is already in use");
            return false;
        }

        return true;
    }

    //TODO needs to support more formats ? (advise with PM)
    //Phone number validation of the below formats:
    //	+XX-XXXX-XXXX
    //	+XX.XXXX.XXXX
    //	+XX XXXX XXXX
    //	XXXXXXXXXX
    function isValidPhoneNumber(fieldObj) {
        var isValid = true;
        fieldObj.error.text = "";
        var validPhoneNo1 = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
        var validPhoneNo2 = /^\d{10}$/;
        var validPhoneNo3 = /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}$/;
        if (!validPhoneNo1.test(fieldObj.value) && !validPhoneNo2.test(fieldObj.value) && !validPhoneNo3.test(fieldObj.value)) {
            createErrorText(fieldObj, "Invalid phone number format");
            isValid = false;
        }
        return isValid;
    }

    return {
        isValid: isValid,
        isValidEmailFormat: isValidEmailFormat,
        isValidUrlFormat: isValidUrlFormat,
        requiredValidation: requiredValidation,
        rangeDatePickerRequiredValidation: rangeDatePickerRequiredValidation,
        rangeDatePickerValidation: rangeDatePickerValidation,
        isStartDateEqualOrGreaterThanToday: isStartDateEqualOrGreaterThanToday,
        isEndGreaterThanStartDate: isEndGreaterThanStartDate,
        isPositiveInteger: isPositiveInteger,
        isValidChars: isValidChars,
        isValidZookeeperNodeName: isValidZookeeperNodeName,
        isValidPhoneNumber: isValidPhoneNumber,
        singleDatePickerRequiredValidation: singleDatePickerRequiredValidation,
        maxLengthValidation: maxLengthValidation,
		gridValidationHelper: gridValidationHelper
    };
}]);
