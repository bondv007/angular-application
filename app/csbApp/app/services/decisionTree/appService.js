/**
 * TODO: We want to eventually deprecate this entire file
 * most of it has been deprecated but there are still some uses for it
 * need to go through the app and remove/move any depencies to here and put them in their proper file
 */


/**
 * This method is used to get the position of the dropped element
 *
 * @param ui
 * @returns {{left: number, top: number}}
 */
var getDropPosition = function (ui) {

  var canvas = angular.element('#note-canvas');

  var pos = ui.offset;
  var dPos = canvas.offset();
  var left = pos.left - dPos.left;
  var top = pos.top - dPos.top;

  return {
    left: left,
    top: top
  };
};

app.factory('appService', [ 'csb', 'panelFactory', 'GraphFactory',
  function (csb, panelFactory, GraphFactory) {

    var factory = {};

    // This is an object that holds all the data for the application
    factory.csbData = {};

    // This is an array that stores the list of notes that the diagram displays
    factory.csbData.notes = [];

    // This is an array that stores the list of text boxes that the diagram displays
    factory.csbData.textBoxes = [];

    // This is an array that stores the list of arrows that the diagram displays
    factory.csbData.arrows = [];

    // This holds all the diagram templates
    factory.csbData.decisionDiagramTemplates = [];

    // This holds the priorities
    factory.csbData.targetAudiencePriorities = [];

    // An array of ID's of TA's for a diagram
    factory.csbData.targetAudienceIDs = [];
    // factory.csbData.targetAudienceIDs = [
    //     {
    //         TargetAudienceID: 300999,
    //         TargetAudienceName: 'uno',
    //         // deliveryGroups: [
    //         //     { DeliveryGroupID: 207221 },
    //         //     { DeliveryGroupID: 207222 },
    //         //     { DeliveryGroupID: 207223 },
    //         //     { DeliveryGroupID: 207367 },
    //         //     { DeliveryGroupID: 207528 },
    //         // ]
    //     },
    //     {
    //         TargetAudienceID: 300998,
    //         TargetAudienceName: 'dos',
    //         // deliveryGroups: [
    //         //     { DeliveryGroupID: 207367 },
    //         //     { DeliveryGroupID: 207528 },
    //         // ]
    //     }
    // ];

    // This is an array that stores the list of campaign delivery groups
    factory.csbData.campaignDeliveryGroups = [];

    factory.csbData.deliveryGroups = [];

    /**
     * This object holds all the neccesary values to work with the selected ads or dg to be previewd
     * when the preview button is pressed down.
     */
    factory.previewAds = {};
    factory.previewAds.selectedDeliveryGroups = [];
    factory.previewAds.selectedAds = [];
    factory.previewAds.buttonDisabled = true;
    factory.previewAds.removeButtonDisabled = true;

    // This variable will hold the current selected item in the canvas
    // so that the deletion  can be triggered on it
    factory.selectedCanvasItem = null;


	  /**
	   * These handle creating notes, textboxes, and arrows
	   */

    factory.addNote = function (ui) {
      // Get the drop position
      var pos = getDropPosition(ui);

      // Create a default note object
      var note = {
        id: factory.csbData.notes.length + '_note',
        label: 'Note',
        arrow: 'bottom',
        type: GraphFactory.diagramTypes.SKETCHING_TOOLS_NOTE,
        style: {left: pos.left, top: pos.top},
        className: 'sketching-tools-note'
      };

      // Push the note object to the model
      factory.csbData.notes.push(note);

      // Get the current note object in the array so we can update it with changes
      var currentNote = factory.csbData.notes[factory.csbData.notes.length - 1];

      return currentNote;
    };

    factory.deleteNote = function (note) {

      var index = 0;

      angular.forEach(factory.csbData.notes, function (n, idx) {

        if (n.id == note.id) {
          index = idx;
        }
      });

      panelFactory.selectedNote = null;
      factory.selectedCanvasItem = null;

      factory.csbData.notes.splice(index, 1);
    };

    factory.addTextBox = function (ui) {
      // Get the drop position
      var pos = getDropPosition(ui);

      // Create a default TextBox object
      var textBox = {
        id: factory.csbData.textBoxes.length + '_textBox',
        label: 'Text Box',
        type: GraphFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX,
        style: {left: pos.left, top: pos.top},
        className: 'sketching-tools-text-box'
      };

      // Push the TextBox object to the model
      factory.csbData.textBoxes.push(textBox);

      // Get the current TextBox object in the array so we can update it with changes
      var currentTextBox = factory.csbData.textBoxes[factory.csbData.textBoxes.length - 1];

      return currentTextBox;
    };

    factory.deleteTextBox = function (textBox) {

      var index = 0;

      angular.forEach(factory.csbData.textBoxes, function (n, idx) {

        if (n.id == textBox.id) {
          index = idx;
        }
      });

      panelFactory.selectedTextBox = null;
      factory.selectedCanvasItem = null;

      factory.csbData.textBoxes.splice(index, 1);
    };

    factory.addArrow = function (ui) {
      // Get the drop position
      var pos = getDropPosition(ui);

      // Create a default Arrow object
      var arrow = {
        id: factory.csbData.arrows.length + '_arrow',
        type: GraphFactory.diagramTypes.SKETCHING_TOOLS_ARROW,
        style: {left: pos.left, top: pos.top},
        className: 'sketching-tools-arrow'
      };

      // Push the Arrow object to the model
      factory.csbData.arrows.push(arrow);

      // Get the current Arrow object in the array so we can update it with changes
      var currentArrow = factory.csbData.arrows[factory.csbData.arrows.length - 1];

      return currentArrow;
    };

    factory.deleteArrow = function (arrow) {

      var index = 0;

      angular.forEach(factory.csbData.arrows, function (n, idx) {

        if (n.id == arrow.id) {
          index = idx;
        }
      });

      panelFactory.selectedArrow = null;
      factory.selectedCanvasItem = null;

      factory.csbData.arrows.splice(index, 1);
    };


    factory.updateTextBoxStyle = function (textBox_id, style) {

      angular.forEach(factory.csbData.textBoxes, function (textBox) {

        if (textBox.id == textBox_id) {
          textBox.style = style;
          return;
        }

      });
    };

    factory.updateNoteStyle = function (note_id, style) {

      angular.forEach(factory.csbData.notes, function (note) {

        if (note.id == note_id) {
          note.style = style;
          return;
        }

      });

    };

    factory.updateArrowStyle = function (arrow_id, style) {

      angular.forEach(factory.csbData.arrows, function (arrow) {

        if (arrow.id == arrow_id) {
          arrow.style = style;
          return;
        }

      });

    };



    return factory;

  }
]);
