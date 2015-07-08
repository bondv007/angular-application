/**
 * Created by Ofir.Fridman on 12/15/14.
 */
'use strict';

app.service('existingDgService', ['enums', 'csb', 'dgHelper', 'dgPreviewHelperService', 'mmAlertService', 'dgsService', '$q',
    function (enums, csb, dgHelper, dgPreviewHelperService, mmAlertService, dgsService, $q) {
        var columns = [];
        var enableDgsRotationAdIds = {};
        var enableDgRotationAdIds = [];

        function getColumns() {
            if (columns.length == 0) {
                columns = [
                    {field: 'id', displayName: 'DELIVERY GROUP ID', width: 150},
                    {field: 'name', displayName: 'NAME' },
                    {field: 'dimension', displayName: 'dimension'},
                    {field: 'numOfAds', displayName: 'Num. Ads'},
                    {field: 'childRotationType', displayName: 'rotation'},
                    {field: 'targetAudience', displayName: 'Target Audience'},
                    {field: 'actions', displayName: 'Ads', gridControlType: enums.gridControlType.getName("Action")}
                ];
            }
            return columns;
        }

        function addPreviewButtonToEachRow(dgs) {
            angular.forEach(dgs, function (dg) {
                dg.actions = [
                    {field: 'button', title: 'Preview', actionFieldType: enums.actionFieldType.getName("Button"), function: previewAdsByDgId, showControl: true}
                ]
            });
        }

        function previewAdsByDgId(row) {
            dgPreviewHelperService.previewAdsByDgId(getDgIdFromRow(row), false);
        }

        function getDgIdFromRow(row) {
            return row.entity.id;
        }

        function createGridData(campaignDgs, dgs) {
            angular.forEach(campaignDgs, function (dg) {
                enableDgRotationAdIds = [];
                getEnableDgRotationAdIds(dg.rootContainer.subContainers);
                enableDgsRotationAdIds[dg.id] = enableDgRotationAdIds;
                dgs.push({id: dg.id, name: dg.name, dimension: dgHelper.getDgUiDimension(dg).dimension,
                    childRotationType: enums.rotationTypeMapper[dg.rootContainer.childRotationType], targetAudienceId: dg.targetAudienceId,
                    selectEnabled: !dg.targetAudienceId, targetAudience: dg.targetAudienceName, numOfAds: enableDgsRotationAdIds[dg.id].length,
                    "rowLocked": !!dg.targetAudienceId
                });
            });
        }

        function getEnableDgRotationAdIds(subContainers) {
            angular.forEach(subContainers, function (subContainer) {
                if (dgHelper.isAdContainer(subContainer)) {
                    getEnableDgRotationAdIds(subContainer.subContainers);
                } else {
                    if (subContainer.rotationSetting.enabled) {
                        enableDgRotationAdIds.push(subContainer.masterAdId);
                    }
                }
            });
        }

        function isAllSelectedDgsAreNotAssignToTa(selectedDgs) {
            var valid = true;
            var dgThatAttachToTa = _.find(selectedDgs, function (selectedDg) {
                return selectedDg.targetAudienceId != null;
            });
            if (dgThatAttachToTa) {
                mmAlertService.addError("Only delivery groups that are not yet assigned to a target audience can be selected.");
                valid = false;
            }
            return valid;
        }

        function AssignAndSave(selectedDgs, campaignDgs, selectedTaId) {
            var defer = $q.defer();
            var dgIds = _.pluck(selectedDgs, 'id');
            var selectedDgsToSave = extractDgsFromCampaignDgs(dgIds, campaignDgs);
            setDgsWithTargetAudienceId(selectedDgsToSave, selectedTaId);
            dgsService.save(selectedDgsToSave, [], campaignDgs).then(function () {
                defer.resolve(true);
            });
            return defer.promise;
        }

        function extractDgsFromCampaignDgs(dgIds, campaignDgs) {
            var dgs = [];
            angular.forEach(dgIds, function (dgId) {
                var dg = _.find(campaignDgs, function (campaignDg) {
                    return dgId == campaignDg.id;
                });
                dgs.push(dg);
            });
            return dgs;
        }

        function setDgsWithTargetAudienceId(dgs, targetAudienceId) {
            for (var i = 0; i < dgs.length; i++) {
                dgs[i].targetAudienceId = targetAudienceId;
            }
        }

        return {
            getColumns: getColumns,
            addPreviewButtonToEachRow: addPreviewButtonToEachRow,
            createGridData: createGridData,
            isAllSelectedDgsAreNotAssignToTa: isAllSelectedDgsAreNotAssignToTa,
            AssignAndSave: AssignAndSave
        };
    }]);