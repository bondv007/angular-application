'use strict';

app.service('secConversion', [function () {
		// * Note >> DO NOT CHANGE id NUMBER >> id is the time in sec for each item.
		// for example Months = 60*60*24*7*4 = 2419200
		var oneSec = 1;
		var oneMinInSec = 60;
		var oneHourInSec = 3600;
		var oneDayInSec = 86400;
		var oneWeekInSec = 604800;
		var oneMonthInSec = 2419200;

		return{

			allNumbers: [oneSec, oneMinInSec, oneHourInSec, oneDayInSec, oneWeekInSec, oneMonthInSec],

			fromSec: function (sec) {
				var res = {timeUnit: oneSec, time: sec};
				if (sec > 1) {
					if (sec % oneMonthInSec === 0) {
						res.time = sec / oneMonthInSec;
						res.timeUnit = oneMonthInSec;
					}
					else if (sec % oneWeekInSec === 0) {
						res.time = sec / oneWeekInSec;
						res.timeUnit = oneWeekInSec;
					}
					else if (sec % oneDayInSec === 0) {
						res.time = sec / oneDayInSec;
						res.timeUnit = oneDayInSec;
					}
					else if (sec % oneHourInSec === 0) {
						res.time = sec / oneHourInSec;
						res.timeUnit = oneHourInSec;
					}
					else if (sec % oneMinInSec === 0) {
						res.time = sec / oneMinInSec;
						res.timeUnit = oneMinInSec;
					}
				}

				return res;
			},

			toSec: function (valToSec) {
				var seconds = valToSec.time;
				switch (valToSec.timeUnit) {
					case oneMinInSec:
						seconds = seconds * oneMinInSec;
						break;
					case oneHourInSec:
						seconds = seconds * oneHourInSec;
						break;
					case oneDayInSec:
						seconds = seconds * oneDayInSec;
						break;
					case oneWeekInSec:
						seconds = seconds * oneWeekInSec;
						break;
					case oneMonthInSec:
						seconds = seconds * oneMonthInSec;
						break;
				}

				return seconds;
			}}
}]);
