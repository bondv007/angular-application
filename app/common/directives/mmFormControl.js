/**
 * Created by Asaf David on 3/5/15.
 */

function formControlDirective(commonEnums, commonConst) {

	/**
	 * Two-way bind an attribute to the settings object
	 * @param scope
	 * @param attrs
	 * @param key
	 * @returns {*|function()} - unwatch function
	 */
	function twoWayBind(settings, scope, attrs, key) {
		settings[key] = scope.$eval(attrs[key]);
		return scope.$watch(attrs[key], function(val) {
			settings[key] = val;
		});
	};

	return {
		restrict: 'E',
		transclude: true,
		link: function(scope, element, attrs, controller) {
			// Initializes the form settings container
			var settings = scope.formControlSettings;

			// Initializes the settings object based on the provided attributes
			settings.mmMinWidth = attrs.mmMinWidth;
			settings.mmCaption = attrs.mmCaption;
			settings.mmHideLabel = attrs.mmHideLabel;
			settings.mmIsRequired = attrs.mmIsRequired;
			settings.mmCustomLink = attrs.mmCustomLink;
			settings.mmLabelWidth = attrs.mmLabelWidth;
			settings.mmLayoutType = attrs.mmLayoutType;
			settings.mmCustomControlWidth = attrs.mmCustomControlWidth;
			settings.mmCustomControlClass = attrs.mmCustomControlClass;
			settings.mmCustomLabelPadding = attrs.mmCustomLabelPadding;
			settings.mmAdditionalText = attrs.mmAdditionalText;

			// two-way binding
			twoWayBind(settings, scope, attrs, 'mmError');
			twoWayBind(settings, scope, attrs, 'mmIsEditMode');
			twoWayBind(settings, scope, attrs, 'mmIsCustomLink');
			twoWayBind(settings, scope, attrs, 'mmShowAsLabel');
			twoWayBind(settings, scope, attrs, 'mmDisable');
			twoWayBind(settings, scope, attrs, 'mmIsLink');
			twoWayBind(settings, scope, attrs, 'mmLinkText');
			twoWayBind(settings, scope, attrs, 'mmEntityId');
			twoWayBind(settings, scope, attrs, 'mmModel');

			// Initializes the form control
			initData();
			setLayout();
			controller.readyPromise.resolve();

			/**
			 * Sets default values
			 */
			function initData() {
				// Set default values
				settings.mmHideLabel = settings.mmHideLabel || false; // Don't hide labels unless specified
				settings.mmIsRequired = (settings.mmIsRequired === undefined) ? false : settings.mmIsRequired == 'true'; // Fields are not required by default
				settings.mmLabelWidth = settings.mmLabelWidth ? settings.mmLabelWidth : commonConst.DEFAULT_LABEL_WIDTH; // Default label width
				settings.mmLabelLeft = settings.mmLabelWidth ? '' + settings.mmLabelWidth + 'px' : commonConst.DEFAULT_LABEL_WIDTH + 'px';

				// adding the ability to position the label certain pixels from the left
				if (settings.mmCustomLabelPadding) {
					settings.mmPadding = settings.mmCustomLabelPadding + 'px';
				} else {
					settings.mmPadding = (settings.mmIsRequired) ? commonConst.DEFAULT_REQUIRED_FIELD_PADDING : commonConst.DEFAULT_FIELD_PADDING;
				}
			}

			/**
			 * Set default layout settings
			 */
			function setLayout(){
				if(settings.mmLayoutType === undefined || settings.mmLayoutType === ''){
					settings.mmLayoutType = commonEnums.layoutType.medium;
				}
				switch (settings.mmLayoutType){
					case commonEnums.layoutType.custom:
						var fullWidth = parseInt(settings.mmLabelWidth) + parseInt(settings.mmCustomControlWidth) + parseInt(30);
						settings.mmControlClass = '';
						settings.mmControlWidth = 'width: ' + settings.mmCustomControlWidth + 'px;';
						settings.mmControlContainerWidth = 'width: ' + fullWidth + 'px;';
						break;
					default:
						settings.mmControlClass = 'mm-control-' + settings.mmLayoutType;
						break;
				}
			}


			scope.onLinkClicked = function(entityPage, entityIdKey) {
				return (settings.linkClickHandler || angular.noop)(entityPage, entityIdKey);
			}
		},
		controller: ['$scope', '$timeout', '$q', function ($scope, $timeout, $q) {
			// Initializes the form settings container
			var settings = this.formControlSettings = $scope.formControlSettings = {};
			this.readyPromise = $q.defer();
			settings.isReady = this.readyPromise.promise;
			// Parent/child helpers

			/**
			 * Allow an inner directive to show/hide the link option of this form controler,
			 * texts, dropwdown, etc require this option while checklist doesn't.
			 *
			 * @param enabled
			 * @param isSimple
			 */
			this.setLinkOptionsVisibility = function(enabled, isSimple) {
				isSimple = isSimple || false;
				settings.linkOptionEnabled = enabled;
				settings.isSimpleLink = isSimple
				console.log('settings', settings);
			};

			/**
			 * Allow a child directive to set the entity page that will be used by the link directive
			 * @param entityPage
			 */
			this.setEntityPage = function(entityPage, key) {
				settings.entityPage = entityPage;
				settings.mmEntityIdKey = key;
			};

			/**
			 * Allow a child directive to set the handler that will be used by the link directive.
			 * @param handler
			 */
			this.setLinkClickHandler = function(handler, context) {
				settings.linkClickHandler = handler.bind(context);
			};

			var timeOut;
			this.delayedChangeHandler = function(callback) {
				timeOut = $timeout(function(){callback();},100);
				if(!this.mmDisable){
					$scope.$root.isDirtyEntity = true;
				}
			};

			$scope.openToEdit = this.openToEdit = function(){
				if(settings.mmDisable){
					return;
				}
				if(settings.mmIsLink){
					settings.isShowControl = true;
				}
			};

			$scope.$on('$destroy', function() {
				$timeout.cancel(timeOut);
			});
		}],
		templateUrl: 'common/views/mmFormControl.html'
	}
};

angular.module('mm.common.directives').directive('formControl', ['commonEnums', 'commonConst', formControlDirective]);