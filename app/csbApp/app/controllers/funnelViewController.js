/**
 * Created by Axel.Martínez on 8/25/14.
 */

app.controller('funnelViewCtrl', ['$scope',
    function ($scope) {

    }
]);

app.directive('audienceSegments', ['segmentsFactory', 'appService', '$timeout', 'funnelService',
    function (segmentsFactory, appService, $timeout, funnelService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
            },
            templateUrl: 'csbApp/app/views/ui/trafficking/audienceSegmentList.html',
            controller: [ '$scope', function ($scope) {
				    $scope.decisionIconMap = {"Geo Targeting":"geo-targeting","Static Retargeting":"retargeting","Audience Manager":"audience-manager"};

                function sortTargetAudiencesByPriority() {

                    var sortedResult = [];

                    var sortedPriorities = appService.csbData.targetAudiencePriorities.sort(function (ta1, ta2) {

                        if (ta1.Priority > ta2.Priority) {
                            return -1;
                        }

                        if (ta1.Priority < ta2.Priority) {
                            return 1;
                        }

                        return 0;

                    });

                    sortedPriorities.forEach(function (ta) {
                        var i = appService.csbData.targetAudienceIDs.indexOfObjectByKey('TargetAudienceID', ta.TargetAudienceID);

                        if (i !== -1) {
                            sortedResult.push(appService.csbData.targetAudienceIDs[i]);
                        }
                    });

                    if (sortedPriorities.length)
                        appService.csbData.targetAudienceIDs = sortedResult;

                    return sortedResult;
                }

                $scope.selectSegment = function (segment) {
                    funnelService.checkForUnSavedChanges().then(function (selectSegment) {
                        if (selectSegment) {
                            $scope.lastSelected.isSelected = false;

                            appService.previewAds.selectedDeliveryGroups = [];
                            appService.previewAds.buttonDisabled = true;
                            appService.previewAds.removeButtonDisabled = true;

                            // changing state to display it's name on the toolbar
                            segment.isSelected = true;

                            $scope.lastSelected = segment;

                            segmentsFactory.setSelectedAudienceSegment(segment.TargetAudienceID);
                            $scope.currentSegment = segmentsFactory.getSelectedAudienceSegment();

                            // console.log('firing the event');
                            $scope.$root.$broadcast('treeView.segmentSelectedInFunnelView', {id: segment.TargetAudienceID, name: segment.TargetAudienceName});
                        }
                    });
                };

                $scope.showLoading = true;

                function init() {

                    $scope.showRules = false;

                    // TODO: remove any relation to allSegments in the factory to use appService.csbData.targetAudienceIDs only
                    segmentsFactory.fillAllSegments(appService.csbData.targetAudienceIDs);

                    sortTargetAudiencesByPriority();

                    $scope.targetAudienceIDs = appService.csbData.targetAudienceIDs;

                    $scope.currentSegment = segmentsFactory.getSelectedAudienceSegment();

                    // the last selected TA in the funnel
                    $scope.lastSelected = {};

                    $timeout(function() {
                        $scope.showLoading = false;
                    }, 500 );

                };

                // Adding this so that when coming to the trafficking page directly
                // it will set the targetAudiencePriorities when they are available ( meaning we got the diagram and it's info)
                $scope.$watch(function () {
                    return appService.csbData.targetAudiencePriorities
                }, function (newVal, oldVal) {
                    if ( newVal.length ) {
                        init();
                    }
                });


            }]
        }
    }
]);


/** note - no dependency but still using square bracket for later injecting **/
app.directive('dndList', [
    function () {
        return {
            restrict: 'A',
            scope: {
              targetAudienceIds: '='
            },
            link: function (scope, element, attrs) {

                /**
                 * This is the link function for this directive. Will manage the dragging and dropping of the items to enable the user to sort the segments.
                 Based on http://css.dzone.com/articles/drag-and-drop-angularjs-using
                 * @param   scope
                 * @param   element
                 * @param   attrs
                 * @return
                 */

                /*
                 index of the element that is being sorted
                 */
                var startIndex = -1;

                /*
                 Using jQueryUI's "sortable" widget
                 */
                $(element[0]).sortable({
                    items: 'li.segment', // which items will be sortable?
                    start: function (event, ui) { // "This event is triggered when sorting starts."
                        startIndex = $(ui.item).index();
                        // console.log("start() index: " + startIndex);
                    },
                    stop: function (event, ui) { // "This event is triggered when sorting has stopped."

                        /*
                         index in which the element was sorted
                         */
                        var newIndex = $(ui.item).index();

                        /* removing the item from its current position */
                        var itemToMove = scope.targetAudienceIds.splice(startIndex, 1)[0]; //splice returns an array with the object removed from the original array

                        /* inserting it in it's new position */
                        scope.targetAudienceIds.splice(newIndex, 0, itemToMove);

                        /* updating the scope */
                        scope.$apply(scope.model);

                        // console.log("stop()");
                    },
                    axis: 'y' //only drag vertically
                });

            }
        };
    }
]);
