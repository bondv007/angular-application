/**
 * Created by Lior.bachar on 5/8/14.
 */

app.service('mmModal', ['$modal', '$rootScope', function ($modal, $rootScope) {

	return {
		open: open,
		openAlertModal: openAlertModal
	}

	function openAlertModal(alertTitle, alertMessage){
		return $modal.open({
			templateUrl: './adManagementApp/views/massCreateAd/alertMessage.html',
			controller: 'alertMessageCtrl',
			backdrop: 'static',
			resolve: {
				headerText: function(){
					return alertTitle;
				},
				bodyMessage: function(){
					return alertMessage;
				}
			}
		});
	}

	function open(obj) {
		if($rootScope.closeAlertWithTimeOut) $rootScope.closeAlertWithTimeOut("Success", 100);
		var defaultHeight = "400px";
		var template = '';
		var discardMethod = 'discard';
		var modalTitle = (typeof obj.title !== 'undefined') ? obj.title : "TITLE" ;
		var modalBodyHeight = (typeof obj.bodyHeight !== 'undefined') ? obj.bodyHeight + "px" : null;//: defaultHeight ; // Default height: 600px
		//modalBodyHeight = (parseInt(modalBodyHeight)  > parseInt(defaultHeight)) ? defaultHeight : modalBodyHeight;
		obj.modalWidth = obj.modalWidth ? obj.modalWidth : "800";
		if (typeof obj.modalWidth  !== 'undefined') {
			template += '<style>.mmModalWidth .modal-dialog {width: ' + obj.modalWidth + 'px}	</style>';
			obj.windowClass = 'mmModalWidth';
		}

		if (typeof obj.discardButton !== 'undefined') {
			discardMethod = obj.discardButton.funcName;
		}

		template += '<div style="position:relative;"><div class=\"mmmodal-header"><div class="mmmodal-title">' + modalTitle.toUpperCase() + '</div> <div class="close"><div class="close-button" ng-click="' + discardMethod + '()"></div></div>';

		if (typeof obj.smallTitle !== 'undefined') {
			template += '<div style="margin: 3px 0px 0px 10px;">' + obj.smallTitle + '</div>';
		}
		template+= "</div>";
		if(modalBodyHeight){
			template += "<div class=\"mmmodal-body\" style=\"height:" + modalBodyHeight + "\"><div class=\"mmmodal-content\" ng-include=\"'" + obj.templateUrl + "'\"></div></div>";
		}else{
			template += "<div class=\"mmmodal-body\" style=\"max-height:" + "700px; " + "min-height:400px\" ><div class=\"mmmodal-content\" ng-include=\"'" + obj.templateUrl + "'\"></div></div>";
		}

		template += '<div class="modal-footer">' +
			' <div style="float:right">';
		if (typeof obj.additionalButtons !== 'undefined') {
			for (var i = 0; i < obj.additionalButtons.length; i++) {
				if( obj.additionalButtons[i].isPrimary){
					template += '<button ng-class="{\'primaryButton\':true}" type="button" mm-id="' + obj.additionalButtons[i].name +'" ng-hide="' + obj.additionalButtons[i].hide + '" class="btn btn-group mm-btn-save" ng-click="' + obj.additionalButtons[i].funcName + '()">' + obj.additionalButtons[i].name.toUpperCase() + '</button>';
				}
				else{
					template += '<button type="button"  mm-id="' + obj.additionalButtons[i].name +'"  ng-hide="' + obj.additionalButtons[i].hide + '" class="btn btn-group mm-btn-save" ng-click="' + obj.additionalButtons[i].funcName + '()">' + obj.additionalButtons[i].name.toUpperCase() + '</button>';
				}
			}
		}
		if (typeof obj.confirmButton !== 'undefined') {
			if(obj.confirmButton.isPrimary){
			template += '<button ng-class="{\'primaryButton\':true}" type="button" mm-id="' +  obj.confirmButton.name + '" ng-hide="' + obj.confirmButton.hide + '" class="btn btn-group mm-btn-save" ng-click="' + obj.confirmButton.funcName + '()">' + obj.confirmButton.name.toUpperCase() + '</button>';
			}else{
				template += '<button type="button" mm-id="' +  obj.confirmButton.name + '" ng-hide="' + obj.confirmButton.hide + '" class="btn btn-group mm-btn-save" ng-click="' + obj.confirmButton.funcName + '()">' + obj.confirmButton.name.toUpperCase() + '</button>';
			}
		}
		if (typeof obj.discardButton !== 'undefined') {
			template += '<button type="button" mm-id="' + obj.discardButton.name + '" ng-hide="' + obj.discardButton.hide + '" class="btn btn-group mm-btn-discard" ng-click="' + obj.discardButton.funcName + '()">' + obj.discardButton.name.toUpperCase() + '</button>';
		}
		template += '</div>'; // Close floater right div

		if (typeof obj.additionalLinks !== 'undefined') {
			template += '<div style="float:left">'
			for (var i = 0; i < obj.additionalLinks.length; i++) {
				if (i > 0) {
					template += '<span style="margin: 0px 5px">|</span>';
				}
				if (!obj.additionalLinks[i].additionalAttribute) {
					template += '<a ng-hide="' + obj.additionalLinks[i].hide + '" href="javascript:void(0)" ng-click="' + obj.additionalLinks[i].funcName + '()">' + obj.additionalLinks[i].name + '</a>';
				}
				else {
					var ngClick = (obj.additionalLinks[i].funcName) ? 'ng-click=\"' + obj.additionalLinks[i].funcName + '()\"' : '';
					template += '<a ng-hide="' + obj.additionalLinks[i].hide + '" ' + ngClick + ' href="javascript:void(0)" ' + obj.additionalLinks[i].additionalAttribute + '>' + obj.additionalLinks[i].name + '</a>';
				}

			}
			template += '</div>'; //close floater left
		}
		template +='</div></div>'; // Close footer + main div

		obj.template = template;
		obj.templateUrl = null;
		var modalInstance = $modal.open(obj);
		modalInstance.isOpen = true;
		modalInstance.result.then(function () {
			modalInstance.isOpen = false;
		}, function () {
			modalInstance.isOpen = false;
		});



		//

		return modalInstance;
	}
}]);


