app.factory('panelFactory', ['$timeout', function ($timeout) {

  var pub = {};

  pub.diagramTypes = {
    STATIC_RETARGETING: 'Static Retargeting',
    DYNAMIC_RETARGETING: 'Dynamic Retargeting',
    SITE_KEYWORDS: 'Site Keywords',
    GEO_TARGETING: 'Geo Targeting',
    CONTEXTUAL_TARGETING: 'Contextual Targeting',
    AUDIENCE_SEGMENT: 'Audience Segment',
    SKETCHING_TOOLS_NOTE: 'Sketching Tools Note',
    SKETCHING_TOOLS_TEXT_BOX: 'Sketching Tools Text Box',
    SKETCHING_TOOLS_ARROW: 'Sketching Tools Arrow',
    THIRD_PARTY_TARGETING: 'Audience Manager'
  }

  pub.showPanelUI = null;
  pub.decisionModel = null;
  pub.selectedNote = null;
  pub.selectedTextBox = null;
  // determines if a sketching tool is being edited
  // useful in the context of deleting items
  pub.sketchingToolSelected = null;

  pub.setDecisionModel = function (decision) {
    pub.decisionModel = decision;
  };

  pub.setSelectedNote = function (note) {

    pub.selectedNote = note;
    pub.sketchingToolSelected = true;

    if (pub.selectedNote) {
      pub.showPanel(pub.selectedNote.type);
    }

  };

  pub.getSelectedNote = function () {
    return pub.selectedNote;
  };

  pub.setSelectedTextBox = function (textBox) {

    pub.selectedTextBox = textBox;
    pub.sketchingToolSelected = true;

    if (pub.selectedTextBox) {
      pub.showPanel(pub.selectedTextBox.type);
    }
  };

  pub.getSelectedTextBox = function () {
    return pub.selectedTextBox;
  };

  // The following methods are needed in order to be able to remove arrows properly from the
  // canvas using the remove button (trash can)
  pub.setSelectedArrow = function (arrow) {

    pub.selectedArrow = arrow;
    pub.sketchingToolSelected = true;

  };

  pub.getSelectedTextBox = function () {
    return pub.selectedArrow;
  };

  pub.showPanel = function (panelType) {

    for (var key in pub.diagramTypes) {

      if (pub.diagramTypes[ key ] == panelType) {

        pub.showPanelUI = false;
        var panel = pub.diagramTypes[ key ];

        // quite the hack.. I set some things on a watch inside of our mdxui controller. If i set 'showPanelUI'
        // to false and then instantly set it to the correct type angular doesn't notice it changing.. hence the short timeout ;-(
        $timeout(function () {
          pub.showPanelUI = panel;
        }, 100);

      }

    }

  }

  pub.closePanelUI = function() {
    pub.showPanelUI = false;
    pub.decisionModel = null;
  };

  pub.validatePanel = function(scope, panelType, callback) {
    scope.$watch('showPanel', function (newVal) {
      scope.showUI = false;
      // If value is equal to the panel type value, then show the panel
      if (newVal != false && newVal == panelType) {
        // set to true to show the panel
        scope.showUI = true;
        if (callback != undefined && typeof callback == 'function') {
          callback();
        }
      }
    });
  }

  return pub;

}]);
