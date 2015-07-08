/**
 * Created by Rick.Jones on 8/11/14.
 */


app.factory( 'GraphFactory', [
    function() {

        /**
         * This is the reference to the factory instance
         *
         * @type {{}}
         */
        var factory = {};

        // constant classes (NOTE: these match the CSS class names for a diagram item)
        factory.cssClasses = {};
        factory.cssClasses.DECISION_RULE_DIAGRAM = 'decision-rule-diagram';
        factory.cssClasses.AUDIENCE_SEGMENT_DIAGRAM = 'audience-segment-diagram';
        factory.cssClasses.SKETCHING_TOOLS_NOTE = 'sketching-tools-note';
        factory.cssClasses.SKETCHING_TOOLS_TEXT_BOX = 'sketching-tools-text-box';
        factory.cssClasses.SKETCHING_TOOLS_ARROW = 'sketching-tools-arrow';

        // constant diagram types
        factory.diagramTypes = {};
        factory.diagramTypes.STATIC_RETARGETING = 'Static Retargeting';
        factory.diagramTypes.DYNAMIC_RETARGETING = 'Dynamic Retargeting';
        factory.diagramTypes.SITE_KEYWORDS = 'Site Keywords';
        factory.diagramTypes.GEO_TARGETING = 'Geo Targeting';
        factory.diagramTypes.CONTEXTUAL_TARGETING = 'Contextual Targeting';
        factory.diagramTypes.AUDIENCE_SEGMENT = 'Audience Segment';
        factory.diagramTypes.SKETCHING_TOOLS_NOTE = 'Sketching Tools Note';
        factory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX = 'Sketching Tools Text Box';
        factory.diagramTypes.SKETCHING_TOOLS_ARROW = 'Sketching Tools Arrow';
        factory.diagramTypes.THIRD_PARTY_TARGETING_ADOBE = 'Audience Manager';

		factory.highlightDroppable = false;

        /**
         * This is the model of graph items
         *
         * @type {{id: number, name: string, icon: string, class: string, position: {left: number, top: number}}[]}
         */
        factory.graphItems = [
            {id: 0, name: 'Static Retargeting', type: factory.diagramTypes.STATIC_RETARGETING, icon: 'retargeting', className: factory.cssClasses.DECISION_RULE_DIAGRAM, position: {left: 0, top: 0}},
            {id: 1, name: 'Dynamic Retargeting', type: factory.diagramTypes.DYNAMIC_RETARGETING, icon: 'retargeting', className: factory.cssClasses.DECISION_RULE_DIAGRAM, position: {left: 0, top: 0}},
            {id: 2, name: 'Site Keywords', type: factory.diagramTypes.SITE_KEYWORDS, icon: 'site-keywords', className: factory.cssClasses.DECISION_RULE_DIAGRAM, position: {left: 0, top: 0}},
            {id: 3, name: 'Geo Targeting', type: factory.diagramTypes.GEO_TARGETING, icon: 'geo-targeting', className: factory.cssClasses.DECISION_RULE_DIAGRAM, position: {left: 0, top: 0}},
            {id: 4, name: 'Contextual Targeting', type: factory.diagramTypes.CONTEXTUAL_TARGETING, icon: 'contextual-targeting', className: factory.cssClasses.DECISION_RULE_DIAGRAM, position: {left: 0, top: 0}},
            {id: 5, name: 'Audience Segment', type: factory.diagramTypes.AUDIENCE_SEGMENT, icon: 'user', className: factory.cssClasses.AUDIENCE_SEGMENT_DIAGRAM, position: {left: 0, top: 0}},
            {id: 6, name: 'Note', type: factory.diagramTypes.SKETCHING_TOOLS_NOTE, icon: 'text-box', className: factory.cssClasses.SKETCHING_TOOLS_NOTE, position: {left: 0, top: 0}},
            {id: 7, name: 'Text Box', type: factory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX, icon: 'note', className: factory.cssClasses.SKETCHING_TOOLS_TEXT_BOX, position: {left: 0, top: 0}},
            {id: 8, name: 'Arrow', type: factory.diagramTypes.SKETCHING_TOOLS_ARROW, icon: 'comment', className: factory.cssClasses.SKETCHING_TOOLS_ARROW, position: {left: 0, top: 0}},
            {id: 9, name: 'Audience Manager', type: factory.diagramTypes.THIRD_PARTY_TARGETING_ADOBE, icon: 'adobe', className: factory.cssClasses.DECISION_RULE_DIAGRAM, position: {left: 0, top: 0}},
        ];


        /**
         * This method returns a data object with properties about a given graph item
         *
         * @param graphId
         * @returns {*}
         */
        factory.getGraphItem = function (graphId) {
            for (var i = 0; i < factory.graphItems.length; i++) {
                if (graphId == factory.graphItems[i].id) {
                    return factory.graphItems[i];
                }
            }

            return null;
        };


        return factory;

    }
]);

