/**
 * Created by Ofir.Fridman on 1/19/2015.
 */
'use strict';
app.directive('audienceSegments', ['segmentsFactory', 'appService', '$timeout', 'funnelService', 'enums', 'traffickingConst', 'decisionTreeService', 'csb',
  function (segmentsFactory, appService, $timeout, funnelService, enums, traffickingConst, decisionTreeService, csb) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        filter: "=?"
      },
      templateUrl: 'csbApp/app/directives/views/trafficking/funnel/audienceSegmentList.html',
      controller: ['$scope', function ($scope) {
        var funnelLoadingTimeOut;
        $scope.showLoading = true;
        $scope.decisionIconMap = enums.csbFunnelDecisionIconMap;

        $scope.defaultTaSelected = function () {
          if (!$scope.defaultTa.isSelected) {
            funnelService.checkForUnSavedChanges().then(function (selectSegment) {
              if(selectSegment){
                $scope.defaultTa.isSelected = true;
                if ($scope.lastSelected) {
                  $scope.lastSelected.isSelected = false;
                }
                $scope.$root.$broadcast(traffickingConst.traffickingBroadcastAction.onSelectedTargetAudience, {
                  id: $scope.defaultTa.id,
                  name: $scope.defaultTa.name
                });
              }
            });
          }
        };

        $scope.selectSegment = function (targetAudienceCampaign) {
          if (!funnelService.isLastAndCurrentSelectedTaTheSame($scope.lastSelected, targetAudienceCampaign, $scope.defaultTa.isSelected)) {
            funnelService.checkForUnSavedChanges().then(function (selectSegment) {
              if (selectSegment) {
                $scope.defaultTa.isSelected = false;
                targetAudienceCampaign.isSelected = true;
                updateLastSelected(targetAudienceCampaign);

                segmentsFactory.setSelectedAudienceSegment(targetAudienceCampaign.targetAudience.id);
                $scope.currentSegment = segmentsFactory.getSelectedAudienceSegment();

                $scope.$root.$broadcast(traffickingConst.traffickingBroadcastAction.onSelectedTargetAudience, {
                  id: targetAudienceCampaign.targetAudience.id,
                  name: targetAudienceCampaign.targetAudience.name
                });
              }
            });
          }
        };

        function init(newVal) {
          if (newVal.length) {
            $scope.showRules = false;
            $scope.targetAudienceIDs = appService.csbData.targetAudienceIDs;
            loopDecisions(decisionTreeService.decisions);
            $scope.defaultTa = funnelService.getDefaultTa(decisionTreeService.decisions);
            $scope.currentSegment = segmentsFactory.getSelectedAudienceSegment();

            // the last selected TA in the funnel
            $scope.lastSelected = {};
          }
          else {
            if (!csb.params.diagramID) {
              $scope.defaultTa = funnelService.getDefaultTa(decisionTreeService.decisions);
              removeFunnelLoadingAnimation();
              $timeout(function () {
                $scope.defaultTaSelected();
              }, 0);
            }
          }
        }

        function updateLastSelected(targetAudience) {
          // remove the last TA from selected
          $scope.lastSelected.isSelected = false;
          // Set the new selected TA to be the last selected
          $scope.lastSelected = targetAudience;
          $scope.lastSelected.isSelected = true;
        }

        function loopDecisions(decisions) {
          angular.forEach(decisions, function (decision) {

            if (decision.yesDecisions.length) {
              loopDecisions(decision.yesDecisions);
            }
            if (decision.noDecisions.length) {
              loopDecisions(decision.noDecisions)
            }

            var ta = _.find(appService.csbData.targetAudienceIDs, {"targetAudienceId": decision.targetAudienceID});
            if (ta) {
              ta.decision = decision;
            }

          });
          removeFunnelLoadingAnimation();
        }

        function removeFunnelLoadingAnimation() {
          funnelLoadingTimeOut = $timeout(function () {
            $scope.showLoading = false;
          }, 500);
        }

        // Adding this so that when coming to the trafficking page directly
        // it will set the targetAudiencePriorities when they are available ( meaning we got the diagram and it's info)
        var initWatcher = $scope.$watch(
          function () {
            return appService.csbData.targetAudienceIDs
          },
          function (newVal) {
            init(newVal);
          });

        $scope.$on('$destroy', function () {
          if (initWatcher) initWatcher();
          if (funnelLoadingTimeOut) {
            $timeout.cancel(funnelLoadingTimeOut);
          }
        });

      }]
    }
  }
]);
