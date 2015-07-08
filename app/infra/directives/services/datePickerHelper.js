/**
 * Created by Ofir.Fridman on 9/2/14.
 */
'use strict';

app.service('datePickerHelper', [function () {
	var strStartEndDateError = "The end date must be later than the start date.";
	var defaultDateFormat = 'yyyy-MM-dd';
	function isEndGreaterThanStartDate(mmError, mmMinDate, mmMaxDate, mmModel) {
		mmError.text = "";
		var isStartGreater = mmMaxDate && moment(getDateWithoutHour(mmModel)).isAfter(moment(getDateWithoutHour(mmMaxDate)));
		var isEndLower = mmMinDate && moment(getDateWithoutHour(mmModel)).isBefore(getDateWithoutHour(mmMinDate));
		mmError.text = (isStartGreater || isEndLower) ? strStartEndDateError : "";
	}

	function getDateWithoutHour(date) {
		return  new Date(date).setHours(0, 0, 0, 0);
	}

	return {
		defaultDateFormat: defaultDateFormat,
		isEndGreaterThanStartDate: isEndGreaterThanStartDate
	};
}]);