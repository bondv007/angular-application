app.service('mmAlertService', ['$rootScope', 'enums',function ($rootScope, enums) {
	$rootScope.alerts = {error: [], info: [], warning: [], success: []};
	var alertTypes = {success: "success", warning: "warning", error: "error", info: "info"};

	function closeSuccess() {
		$rootScope.closeAlertWithTimeOut("success", 0);
	}

	function closeWarning() {
		$rootScope.closeAlertWithTimeOut("warning", 0);
	}

	function closeError() {
		$rootScope.closeAlertWithTimeOut("error", 0);
	}

	function closeInfo() {
		$rootScope.closeAlertWithTimeOut("info", 0);
	}

	function closeAll() {
		closeSuccess();
		closeWarning();
		closeError();
		closeInfo();
	}

	function closeAllExceptSuccess() {
		closeWarning();
		closeError();
		closeInfo();
	}

	return {
		alertTypes: alertTypes,
		addSuccess: function (msg, href, linkText, func) {
			$rootScope.alerts.error = [];
			if (typeof msg == "string") {
				$rootScope.alerts.success.push({type: "Success", msg: msg, href: href, linkText: linkText, func: func});
				$rootScope.alerts.success = _.uniq($rootScope.alerts.success, 'msg');
				$rootScope.closeAlertWithTimeOut("Success", 7000);
			}
		},
		addSuccessOnTop: function(msg, href, linkText){
			if (typeof msg == "string") {
				$rootScope.alerts.success.unshift({type: "Success", msg: msg, href: href, linkText: linkText});
				$rootScope.alerts.success = _.uniq($rootScope.alerts.success, 'msg');
				$rootScope.closeAlertWithTimeOut("Success", 7000);
			}
		},
		addWarning: function (msg, href, linkText) {
			if (typeof msg == "string") {
				$rootScope.alerts.warning.push({type: "Warning", msg: msg, href: href, linkText: linkText});
				$rootScope.alerts.warning = _.uniq($rootScope.alerts.warning, 'msg');
			}
		},
		addError: function (msg, href, linkText) {
			if (typeof msg == "string") {
				$rootScope.alerts.error.push({type: "Error", msg: msg, href: href, linkText: linkText});
				$rootScope.alerts.error = _.uniq($rootScope.alerts.error, 'msg');
			}
		},
		addErrorOnTop: function (msg, href, linkText) {
			$rootScope.alerts.error.unshift({type: "Error", msg: msg, href: href, linkText: linkText});
			$rootScope.alerts.error = _.uniq($rootScope.alerts.error, 'msg');
		},
		addInfo: function (msg, href, linkText) {
			if (typeof msg == "string") {
				$rootScope.alerts.info.push({type: "Info", msg: msg, href: href, linkText: linkText});
				$rootScope.alerts.info = _.uniq($rootScope.alerts.info, 'msg');
			}
		},
		addComplexAlert: function(msgTypeId, subAlerts){
			var msgType = enums.alertMessagesType.getObject(msgTypeId);
			if(!msgType || !subAlerts.length){
				return;
			}
			var complexAlertObject = { type: msgType.name, subAlerts: [] };

			for (var i = 0; i < subAlerts.length; i++ ) {
				var subAlert = subAlerts[i];
				complexAlertObject.subAlerts.push({type: msgType.name, msg: subAlert.msg, href: subAlert.href, linkText: subAlert.linkText, func: subAlert.func});
			}
			$rootScope.alerts[msgType.id].push(complexAlertObject);
			//$rootScope.alerts.success = _.uniq($rootScope.alerts.success, 'subAlert[0].msg');

			if(msgType.id === "success"){
				$rootScope.closeAlertWithTimeOut("Success", 7000);
			}
		},
		closeSuccess: closeSuccess,
		closeWarning: closeWarning,
		closeError: closeError,
		closeInfo: closeInfo,
		closeAll: closeAll,
		closeAllExceptSuccess: closeAllExceptSuccess
	}
}]);