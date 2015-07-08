app.factory( 'panelFactory', [ '$timeout', function( $timeout ) {

    var pub = {};

    pub.diagramTypes = {};
    pub.diagramTypes.STATIC_RETARGETING = 'Static Retargeting';
    pub.diagramTypes.DYNAMIC_RETARGETING = 'Dynamic Retargeting';
    pub.diagramTypes.SITE_KEYWORDS = 'Site Keywords';
    pub.diagramTypes.GEO_TARGETING = 'Geo Targeting';
    pub.diagramTypes.CONTEXTUAL_TARGETING = 'Contextual Targeting';
    pub.diagramTypes.AUDIENCE_SEGMENT = 'Audience Segment';
    pub.diagramTypes.SKETCHING_TOOLS_NOTE = 'Sketching Tools Note';
    pub.diagramTypes.SKETCHING_TOOLS_TEXT_BOX = 'Sketching Tools Text Box';
    pub.diagramTypes.SKETCHING_TOOLS_ARROW = 'Sketching Tools Arrow';
    pub.diagramTypes.THIRD_PARTY_TARGETING = 'Audience Manager';

    pub.showPanelUI = null;
    pub.decisionModel = null;
    pub.selectedNote = null;
    pub.selectedTextBox = null;
    // determines if a sketching tool is being edited
    // useful in the context of deleting items
    pub.sketchingToolSelected = null;

    pub.setDecisionModel = function( decision ) {
        pub.decisionModel = decision;
    };

    pub.setSelectedNote = function( note ){

        pub.selectedNote = note;
        pub.sketchingToolSelected = true;

        if(pub.selectedNote){
            pub.showPanel(pub.selectedNote.type);
        }

    };

    pub.getSelectedNote = function(){
        return pub.selectedNote;
    };

    pub.setSelectedTextBox = function( textBox ){

        pub.selectedTextBox = textBox;
        pub.sketchingToolSelected = true;

      if(pub.selectedTextBox){
            pub.showPanel(pub.selectedTextBox.type);
        }
    };

    pub.getSelectedTextBox = function(){
        return pub.selectedTextBox;
    };

    // The following methods are needed in order to be able to remove arrows properly from the
    // canvas using the remove button (trash can)
    pub.setSelectedArrow = function( arrow ){

      pub.selectedArrow = arrow;
      pub.sketchingToolSelected = true;

    };

    pub.getSelectedTextBox = function(){
      return pub.selectedArrow;
    };

    pub.showPanel = function( panelType ) {

        for ( var key in pub.diagramTypes ) {

            if ( pub.diagramTypes[ key ] == panelType ) {

                pub.showPanelUI = false;
                var panel = pub.diagramTypes[ key ];

                // quite the hack.. I set some things on a watch inside of our mdxui controller. If i set 'showPanelUI'
                // to false and then instantly set it to the correct type angular doesn't notice it changing.. hence the short timeout ;-(
                $timeout(function() {
                    pub.showPanelUI = panel;
                }, 100 );

            }

        }

    }

    return pub;

}]);
