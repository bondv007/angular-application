'use strict';

/**
 * Created by Asaf David on 2/19/15.
 */

describe('central tests', function() {
  var scope, $rootScope, $compile, $timeout, $injector, $httpBackend, basePath, placements;

  // loads central's module
  beforeEach(module('MediaMindApp', function ($provide, $translateProvider) {
    $provide.factory('customLoader', function ($q) {
      return function () {
        var deferred = $q.defer();
        deferred.resolve({});
        return deferred.promise;
      };
    });
    $translateProvider.useLoader('customLoader');
  }));

  // load the templates
  beforeEach(module(
    'infra/central/views/central.html',
    'infra/central/views/centralShowBy.html',
    'infra/central/views/centralMasterToolBar.html',
    'infra/central/views/centralViewBy.html',
    'infra/central/views/centralDataList.html',
    'infra/central/views/centralDataListHeader.html',
    'infra/central/views/centralDataListGrid.html',
    'infra/central/views/centralDataListFooter.html',
    'infra/central/views/centralGridRow.html',
    'infra/central/views/centralDropDownOptions.html',
    'infra/central/views/centralEmptyStates.html',
    'infra/entityLayout/views/layout.html',
		'infra/entityLayout/views/flowLayoutButtons.html',
		'infra/entityLayout/views/actionLayoutButtons.html',
		'infra/entityLayout/views/entityLayoutTitle.html',
    'infra/directives/views/mmButtonDropDown.html',
    'infra/directives/views/mmTooltip.html',
    'infra/directives/views/mmHistory.html',

		// Placement specific html
		'campaignManagementApp/views/placement/placementEdit.html',
		'infra/directives/views/base/mmInputControlBase.html',
		'infra/directives/views/mmInfoBox.html',
		'infra/directives/views/mmToggleContainer.html',
		'infra/directives/views/base/mmClickControlBase.html',
		'infra/grid/views/mmGrid.html'
  ));

  beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_, _$injector_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    $compile = _$compile_;
    $timeout = _$timeout_;
    $injector = _$injector_;
    $httpBackend = _$httpBackend_;

    // backend definition common for all tests
    var configuration = $injector.get('configuration');
    basePath = configuration.ec2;
    jasmine.getJSONFixtures().fixturesPath='base/test/fixtures';

    // Placement request
    placements = getJSONFixture('placements-no-paging.json');
    $httpBackend.expectGET(basePath + 'placements?from=0&max=250').respond(
      placements
    );

    // Initialize simple centralObj for the test
    scope.simpleCentralDataObject = [
      { type: 'placement', isEditable: true}
    ];
  }));

  // Helpers
  function compileTemplate(template) {
    var el = $compile(angular.element(template))(scope);
    scope.$digest();
    return el;
  }

	/**
	 * Creates a central by the provided parameters
	 *
	 * @param centralDataObject
	 * @param attrs
	 * @returns {*}
	 */
  function createCentral(centralDataObject, attrs) {
    var attrsHtml = '';
    if (attrs !== undefined) {
      if (attrs.entityId !== undefined) { attrsHtml += ' entity-id="' + attrs.entityId + '"'; }
      if (attrs.entityType !== undefined) { attrsHtml += ' entity-type="' + attrs.entityType + '"'; }
      if (attrs.mainEntityType !== undefined) { attrsHtml += ' central-main-entity-type="' + attrs.mainEntityType + '"'; }
      if (attrs.disableEdit !== undefined) { attrsHtml += ' disable-edit="' + attrs.disableEdit + '"'; }
    }

    return compileTemplate(
      '<central central-data-object="' + centralDataObject + '"' + attrsHtml + '> \
      </central>'
    );
  };

	/**
	 * Returns all of the central rows
	 * @param central
	 */
	function getCentralRows(central) {
		return $('div.centralGridRowWrap > div', central);
	}

	/**
	 * Selects a row in the central grid. (simulate "a click")
	 * @param row
	 */
	function triggerRowClick(scope, row) {
		$(row).click();
		scope.$digest();
	};

  // Tests
  describe('validations', function() {
    it('requires "central-data-object" attribute', function() {
      expect(function() {
        compileTemplate('<central></central>');
      }).toThrow(new Error('central-data-object attribute is required.'));
    });

    it('validates that centralDataObject is an array', function() {
      scope.stamObj = {};
      expect(function() {
        createCentral('stamObj');
      }).toThrow(new Error("'centralDataObj' must be an array"));
    });

    it('validates that centralDataObject has at least one object', function() {
      scope.stamObj = [];
      expect(function() {
        createCentral('stamObj');
      }).toThrow(new Error("'centralDataObj' must include atleast one object"));
    });
  });

  describe('init', function() {
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('creates a valid central and update the element', function() {
      var central = createCentral('simpleCentralDataObject');
      $httpBackend.flush();

      // A master tool bar was built
      expect(central).toContain('div.advancedSearchButtonCenterlize.advancedSearchButtons');

      // A footer was built
      expect(central).toContain('div.centralFooter');
      expect($('div.centralFooter .centralFooterText span', central)).toContainText(placements.metadata.total.toString()); // Total items

      // A grid was built
      expect(central).toContain('div.centralGridRowWrap');
      expect(getCentralRows(central)).toHaveLength(placements.metadata.total); // Total items
    });
  });

	describe('Operations', function() {
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

//		it('opens the entral when is central row is being clicked', function() {
//			var central = createCentral('simpleCentralDataObject');
//			$httpBackend.flush();
//
//			// Validate that the entral is closed on init
//			var isolateScope = central.isolateScope();
//			expect(isolateScope.displayData.isSelectedItem).toBe(undefined);
//
//			// Trigger a click
//			var rows = getCentralRows(central);
//			triggerRowClick(isolateScope,rows[0]);
//
//			// Validates that the entral is opened
//			console.log('isolateScope.displayData', isolateScope.displayData);
//			expect(isolateScope.displayData.isSelectedItem).toBe(true);
//			expect(central).toContain('div.centralEntityWrapperShadow');
//		});
	});
});
