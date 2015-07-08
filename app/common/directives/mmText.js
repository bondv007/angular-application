/**
 * Created by Asaf David on 3/5/15.
 */
function mmTextDirective(entityMetaData, $state) {
	return {
		require: '^formControl',
		restrict: 'E',
		templateUrl: 'common/views/text.html',
		scope: {
			mmModel: '=',
			mmChange: "&",
			mmPlaceholder: "@",
			mmEntityType: "@",
			mmTabIndex: "@",
			mmInputType: "@",
			mmId: '@'
		},
		link: function(scope, element, attrs, formController) {
			var controlSettings = formController.formControlSettings;

			/**
			 * Initializes the default values for this text directive
			 */
			function init() {
				// Initialize default values (in scope and in form control settings)
				scope.mmInputType = (scope.mmInputType === undefined) ? 'text' : scope.mmInputType;
				scope.setFocus = false;

				if (!controlSettings.isSimpleLink) {
					var page;
					if(controlSettings.mmIsCustomLink){
						page = controlSettings.mmCustomLink;
					}else{
						page = entityMetaData[scope.mmEntityType].editPageURL;
					}
					formController.setEntityPage(page, entityMetaData[scope.mmEntityType].foreignKey);
				}
			};

			function initShowControl() {
				controlSettings.mmShowAsLabel = !!controlSettings.mmShowAsLabel || !!controlSettings.mmIsLink;
				controlSettings.isShowControl = !controlSettings.mmShowAsLabel;
			};

			controlSettings.isReady.then(function() {
				formController.setLinkOptionsVisibility(true, !scope.mmEntityType);
				init();
				initShowControl();
				scope.parentReady = true;

				// Set link option and init
				formController.setLinkClickHandler(function(entityPage, entityIdKey){
					var params = {};
					if(entityIdKey){
						params[entityIdKey] = controlSettings.mmEntityId;
						$state.go(entityPage, params);
					}
					else{
						$state.go(entityPage);
					}
				}, this);
			});

			/**
			 * ng-change handler
			 */
			scope.mmModelChange = function() {
				formController.delayedChangeHandler(scope.mmChange);
			}

			// Watches & Events
			scope.$watch('formControlSettings.mmShowAsLabel + formControlSettings.isShowControl', initShowControl);
			scope.formControlSettings = controlSettings;
		}
	}
}

angular.module('mm.common.directives').directive('mmBaseText', ['entityMetaData', '$state', mmTextDirective]);
angular.module('mm.common.directives').directive('mmNewText', delegateAttributeDirective('mm-base-text'));
