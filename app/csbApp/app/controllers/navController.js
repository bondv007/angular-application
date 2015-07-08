/**
 * Created by Rick.Jones on 8/20/14.
 */

app.controller('navCtrl', [ '$timeout', '$scope', 'GraphFactory', 'decisionTreeService',
  function ($timeout, $scope, GraphFactory, decisionTreeService) {

    /**
     * The Targeting decisions items
     */
    $scope.decisionRules = {
      title: 'Targeting Decisions',
      navItems: [
        {
          graphId: 0,
          id: 'graph_Item_Static_Retargeting',
          name: 'Static Retargeting',
          icon: 'retargeting',
          draggable: true,
          tool_tip: 'Enables advertisers to target visitors of their site with specific ads that match their interest.  After target audiences are set up, the right set of ads are matched to the relevant audience.'
        },
        {
          graphId: 3,
          id: 'graph_Item_Geo_Targeting',
          name: 'Geo Targeting',
          icon: 'geo-targeting',
          draggable: true,
          tool_tip: 'Target users in different geographical locations with different sets of ads.  Geo targeting in Sizmek can be set up for each user’s geographic location, whether by country, state/region, city, Nielsen Designated Market Area (DMA), telephone area code, postal code, and ISP.'
        },
//              { graphId: 5, name: 'Ad Interactions', icon: 'list-alt', draggable: false },
        {
          graphId: 2,
          id: 'graph_Item_Site_Keywords',
          name: 'Site Keywords',
          icon: 'site-keywords',
          draggable: true,
          tool_tip: 'Target audiences according to search term that is passed by the publisher to Sizmek.  Sizmek can receive information about a search term that the user used in the publisher’s site, or about any other information the publisher has about the user of their preference.'
        },
        {
          graphId: 4,
          id: 'graph_Item_Contextual_Targeting',
          name: 'Contextual Targeting',
          icon: 'contextual-targeting',
          draggable: true,
          tool_tip: 'Enables advertisers to leverage Sizmek data that end users read on a publisher site in order to target users.'},
        {
          graphId: 1,
          id: 'graph_Item_Dynamic_Retargeting',
          name: 'Dynamic Retargeting',
          icon: 'retargeting',
          draggable: false,
          tool_tip: 'Enables advertisers to target visitors of their site with specific ads that match their interest.  After target audiences are set up, the right set of ads are matched to the relevant audience.'
        }
      ]
    }

    /**
     * The third party targeting decision items
     * @type {{title: string, navItems: {graphId: number, name: string, icon: string, draggable: boolean}[]}}
     */
    $scope.thirdPartyTargeting = {
      title: '3rd Party Targeting',
      navItems: [
        {
          graphId: 9,
          id: 'graph_Item_Audience_Manager',
          name: 'Audience Manager',
          icon: 'adobe',
          draggable: true
        }
//                {graphId:10, name: 'Blukai', icon: 'blukai', draggable: false},
//                {graphId:11, name: 'Datalogix', icon: 'datalogix', draggable: false},
//                {graphId:12, name: 'Neustar', icon: 'neustar', draggable: false},
      ]
    };

    /**
     * The sketching tool items
     * @type {{title: string, navItems: {graphId: number, name: string, icon: string, draggable: boolean}[]}}
     */
    $scope.sketchingTools = {
      title: 'Sketching Tools',
      navItems: [
        {
          graphId: 6,
          id: 'graph_Item_Note',
          name: 'Note',
          icon: 'text-box',
          draggable: true
        },
        {
          graphId: 7,
          id: 'graph_Item_Text_Box',
          name: 'Text Box',
          icon: 'note',
          draggable: true
        },
        {
          graphId: 8,
          id: 'graph_Item_Arrow',
          name: 'Arrow',
          icon: 'arrow',
          draggable: true
        }
      ]
    }

    /**
     * The list of templates section ( templates come from a rest service )
     * @type {{title: string, toolTip: string}}
     */
    $scope.decisionTemplates = {
      title: 'My Templates',
      toolTip: 'Lists all of the decision diagrams that were saved as templates under an agency account.  You can use a template for any campaign under this agency.'
    }


    $scope.onClickNavItem = function () {
      $timeout(function () {
        GraphFactory.highlightDroppable = true;
      });
    };

    $scope.onUnclickNavItem = function () {
      $timeout(function () {
        GraphFactory.highlightDroppable = false;
      });
    };


    /**
     * This function gets the settings when an element is dragged
     *
     * @returns {{revert: string, helper: function, cursorAt: {left: number, top: number}}}
     */
    $scope.getDragOptions = function (graphId) {
      var graphItem = GraphFactory.getGraphItem(graphId),
          template;

      switch (graphId) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:

          template = '<div class="decision-item decision-item-dragged">' +
              '<div class="decision-item-inner">' +
              '<div class="decision-item-triangle"></div>' +
              '<div class="decision-item-content">' +
              '<p class="centered">' + graphItem.name + '</p>' +
              '</div>' +
              '<i class="decision-icon csb-icon csb-icon-' + graphItem.icon + '"></i>' +
              '<div class="csb-icon-bg"></div>' +
              '</div>' +
              '</div>';
          break;

        case 5:
          template = '<div class="' + graphItem.className + '">' +
              '<div class="content">' +
              graphItem.name + '' +
              '</div>' +
              '</div>';
          break;

        case 6:
          template = '<div class="' + graphItem.className + '"><div class="inner csb-selected-note-border csb-selected-note-arrow-bottom">' +
              '<span class="csb-icon csb-icon-' + graphItem.icon + '"></span> ' + graphItem.name +
              '</div></div>';
          break;

        case 7:
          template = '<div class="' + graphItem.className + '"><div class="inner csb-selected-text-box-border">' +
              '<span class="csb-icon csb-icon-' + graphItem.icon + '"></span> ' + graphItem.name +
              '</div></div>';
          break;

        case 8:
          template = '<div class="' + graphItem.className + ' csb-selected-arrow">' +
            // '<span class="csb-icon csb-icon-'+ graphItem.icon +'"></span> '+ graphItem.name +
              '</div>';
          break;

        case 9:

          template = '<div class="decision-item decision-item-dragged">' +
              '<div class="decision-item-inner">' +
              '<div class="decision-item-triangle"></div>' +
              '<div class="decision-item-content">' +
              '<p class="centered">' + graphItem.name + '</p>' +
              '</div>' +
              '<i class="decision-icon csb-icon csb-icon-' + graphItem.icon + '"></i>' +
              '<div class="csb-icon-bg"></div>' +
              '</div>' +
              '</div>';
          break;

      }

      return {

        revert: 'invalid',
        helper: function () {
          return $(template);
        },
        cursorAt: {left: 40, top: 40},
        zIndex: $scope.zIndex

      };

    };

  }
]);
