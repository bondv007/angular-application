/**
 * Created by Asaf David on 3/19/15.
 */
describe('mmFormControl tests', function() {
	var scope, $rootScope, $compile, $timeout, $injector, commonConst, commonEnums;

	// Loads common directive's module
	beforeEach(module('mm.common.directives'));

	// load the templates
	beforeEach(module(
		'common/views/mmFormControl.html',
		'common/views/label.html'
	));

	beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_, _$injector_, _commonConst_, _commonEnums_) {
		$rootScope = _$rootScope_;
		scope = $rootScope.$new();
		$compile = _$compile_;
		$timeout = _$timeout_;
		$injector = _$injector_;
		commonConst = _commonConst_;
		commonEnums = _commonEnums_;
	}));

	var formControlAttrs = [
		// one way binding
		{type: 'ONE_WAY', key: 'mmMinWidth', attr: 'mm-min-width'},
		{type: 'ONE_WAY', key: 'mmCaption', attr: 'mm-caption'},
		{type: 'ONE_WAY', key: 'mmHideLabel', attr: 'mm-hide-label'},
		{type: 'ONE_WAY', key: 'mmIsRequired', attr: 'mm-is-required'},
		{type: 'ONE_WAY', key: 'mmCustomLink', attr: 'mm-custom-link'},
		{type: 'ONE_WAY', key: 'mmLabelWidth', attr: 'mm-label-width'},
		{type: 'ONE_WAY', key: 'mmLayoutType', attr: 'mm-layout-type'},
		{type: 'ONE_WAY', key: 'mmCustomControlWidth', attr: 'mm-custom-control-width'},
		{type: 'ONE_WAY', key: 'mmCustomControlClass', attr: 'mm-custom-control-class'},
		{type: 'ONE_WAY', key: 'mmCustomLabelPadding', attr: 'mm-custom-label-padding'},
		{type: 'ONE_WAY', key: 'mmAdditionalText', attr: 'mm-additional-text'},

		// Two way binding
		{type: 'TWO_WAY', key: 'mmError', attr: 'mm-error'},
		{type: 'TWO_WAY', key: 'mmIsEditMode', attr: 'mm-is-edit-mode'},
		{type: 'TWO_WAY', key: 'mmIsCustomLink', attr: 'mm-is-custom-link'},
		{type: 'TWO_WAY', key: 'mmShowAsLabel', attr: 'mm-show-as-label'},
		{type: 'TWO_WAY', key: 'mmDisable', attr: 'mm-disable'},
		{type: 'TWO_WAY', key: 'mmIsLink', attr: 'mm-is-link'},
		{type: 'TWO_WAY', key: 'mmLinkText', attr: 'mm-link-text'},
		{type: 'TWO_WAY', key: 'mmEntityId', attr: 'mm-entity-id'},
		{type: 'TWO_WAY', key: 'mmModel', attr: 'mm-model'}
	];
	// Helpers
	function compileTemplate(template) {
		var el = $compile(angular.element(template))(scope);
		scope.$digest();
		return el;
	}

	/**
	 * Creates a new form control
	 * @param attrs
	 */
	function createFormControl(attrs, innerHtml) {
		var attrsHtml = '';
		if (attrs !== undefined) {
			formControlAttrs.forEach(function(field) {
				if (attrs[field.key] !== undefined) { attrsHtml += ' ' + field.attr + '="' + attrs[field.key] + '"'; }
			});
		}

		return compileTemplate(
			'<form-control ' + attrsHtml + '> ' +
				innerHtml +
      '</form-control>'
		);
	};

	function getController(elm) {
		return elm.controller('formControl')
	};

	function getLabel(elm) {
		return $('.mm-control-label', elm);
	}

	// Test cases
	describe('validations', function() {
		it('Initializes default values when no attribute is provided', function() {
			var formControl = createFormControl();
			var controller  = getController(formControl);
			var settings = controller.formControlSettings;
			expect(settings).not.toBe(null);
			expect(settings.mmHideLabel).toBe(false);
			expect(settings.mmIsRequired).toBe(false);
			expect(settings.mmLabelWidth).toBe(commonConst.DEFAULT_LABEL_WIDTH);
			expect(settings.mmLabelLeft).toBe(commonConst.DEFAULT_LABEL_WIDTH + 'px');
			expect(settings.mmPadding).toBe(commonConst.DEFAULT_FIELD_PADDING);
			expect(settings.mmLayoutType).toBe(commonEnums.layoutType.medium);
			expect(settings.mmLayoutType).toBe(commonEnums.layoutType.medium);
			expect(settings.mmControlClass).toBe('mm-control-' + commonEnums.layoutType.medium);
		});
	});

	describe('Label', function() {
		it('applies the default style on the label', function() {
			var formControl = createFormControl({mmCaption: 'TestLabel'});
			var controller  = getController(formControl);
			var settings = controller.formControlSettings;
			var label = getLabel(formControl);

			expect(label.css('width')).toBe(commonConst.DEFAULT_LABEL_WIDTH + 'px');						// Check label's width
			expect(label.css('padding-left')).toBe(commonConst.DEFAULT_FIELD_PADDING);					// Check left padding
			expect(label.hasClass('ng-hide')).toBe(false);																			// Label is not hidden
			expect(label.text()).toMatch('TestLabel');																				// Label is set
		});

		it('marks field as required in case mmIsRequest is provided', function() {
			var formControl = createFormControl({mmIsRequired: true});
			var controller  = getController(formControl);
			var settings = controller.formControlSettings;

			expect(settings.mmIsRequired).toBe(true);
			expect(settings.mmPadding).toBe(commonConst.DEFAULT_REQUIRED_FIELD_PADDING);
			var requiredSign = $('.mm-control-label .mmRequiredSign', formControl);
			expect(requiredSign.hasClass('ng-hide')).toBe(false);
		});

		it('hides the required sign in case the field is not required', function() {
			var formControl = createFormControl({mmIsRequired: false});
			var controller  = getController(formControl);
			var settings = controller.formControlSettings;

			expect(settings.mmIsRequired).toBe(false);
			expect(settings.mmPadding).toBe(commonConst.DEFAULT_FIELD_PADDING);
			var requiredSign = $('.mm-control-label .mmRequiredSign', formControl);
			expect(requiredSign.hasClass('ng-hide')).toBe(true);
		});

		it('hides the label if mmHideLabel is true', function() {
			var formControl = createFormControl({mmHideLabel: true});
			var controller  = getController(formControl);
			var settings = controller.formControlSettings;
			var label = getLabel(formControl);
			expect(label.hasClass('ng-hide')).toBe(true);
		})
	});
});