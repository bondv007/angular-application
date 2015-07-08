/**
 * Created by atd on 11/4/2014.
 */
'use strict';
app.controller('singleAssetPreviewCtrl', ['$scope', '$stateParams', '$state', 'enums', 'EC2Restangular', 'adPreviewService', 'assetService', 'adService', '$window', 'monitorService', '$filter', function($scope, $stateParams, $state, enums, EC2Restangular, adPreviewService, assetService, adService, $window, monitorService, $filter) {
    $scope.assetId = $stateParams.assetId;
    $scope.adId = $stateParams.adId != "undefined" ? $stateParams.adId : "";
    $scope.adDisplayTag = adPreviewService.getDisplayTag();

    $scope.data = [];
    $scope.ad = {};
    $scope.asset = {};
    $scope.monitorEvents = [];
    if (typeof $scope.adPreviewCommonModel == "undefined") {
        $scope.adPreviewCommonModel = {
            isDebugClicked: true,
            enableDrag: false
        };
    }
    $scope.showGeneralSection = true;
    $scope.showEditCanvasOptionDropDown = {
        val : false
    };

    $scope.redirectToAd = function() {
        $state.go("adPreview", {
            adId: $scope.adId,
            sid: $stateParams.sid,
            mdx2: $stateParams.mdx2
        });
    };

    $scope.setDrag = function(value, e) {
        $scope.adPreviewCommonModel.enableDrag = value;
        $scope.showEditCanvasOptionDropDown.val = false;
        e.stopPropagation();
    }

    var win;
    var isOpen = false;
    $scope.openSeparateWindow = function() {
        if (!isOpen)
            win = $window.open('#/adDetails/' + $scope.assetId + "/" + false, "MsgWindow", "width=1000, height=480");
        else
            win.close();
        isOpen = !isOpen;
    };
    var storedTime = new Date();
    $scope.$watch('monitorEvents', function() {
        var patt = new RegExp("automatic");
        for (var k = 0; k < $scope.monitorEvents.length; k++) {
            $scope.monitorEvents[k].user = false; //user
            if (typeof $scope.monitorEvents[k].time == "undefined" || $scope.monitorEvents[k].time == "") {
                var relativeTime = Math.abs(storedTime - new Date());
                $scope.monitorEvents[k].time = $filter('date')(adPreviewService.milliSecondsToTime(relativeTime), "hh:mm:ss");
            }
            if (typeof $scope.monitorEvents[k].action == "undefined" || $scope.monitorEvents[k].action == "") {
                $scope.monitorEvents[k].user = patt.test($scope.monitorEvents[k].action); //automatic
            }
        }
        storeInLocalStorage();
        applyFilters();
        if ($scope.monitorEvents.length == 1) {
            $scope.selectedInteraction = $scope.filteredData[0]; //init im details section
        }
    }, true);

    var keyInitials = "asset-events";

    function storeInLocalStorage() {
        if (typeof $scope.monitorEvents != "undefined") {
            var sharedData = [];
            for (var k = 0; k < $scope.monitorEvents.length; k++) {
                var d = {
                    command: $scope.monitorEvents[k].command,
                    action: $scope.monitorEvents[k].action,
                    part: $scope.monitorEvents[k].part,
                    args: $scope.monitorEvents[k].args,
                    time: $scope.monitorEvents[k].time,
                    adName: $scope.ad.name
                }
                sharedData.push(d);
            }
            monitorService.setData($scope.adId, sharedData);
        }
    };

    $scope.clearInteractions = function() {
        $scope.monitorEvents = [];
        storedTime = new Date();
    }
    $scope.searchFilters = [{
        name: "All",
        isSelected: true
    }, {
        name: "InteractionName",
        isSelected: false
    }, {
        name: "InteractionTypes",
        isSelected: false
    }, {
        name: "Parameters",
        isSelected: false
    }];
    $scope.searchCriteria = {
        searchText: '',
        searchAsset: ''
    };
    $scope.selectedFilter = "All";

    $scope.$watch("searchCriteria.searchText", function(newVal, oldVal) {
        applyFilters();
    }, true);

    $scope.setSearchFilter = function(filter) {
        clearAllActions(filter);
        filter.isSelected = !filter.isSelected;
        $scope.selectedFilter = filter.name;
        applyFilters();
    };

    function applyFilters() {
        var predicate = {};
        var prop = getFilteredProperty();
        predicate[prop] = $scope.searchCriteria.searchText;
        var parsedEvents = [];
        for (var k = 0; k < $scope.monitorEvents.length; k++) {
            var d = {
                command: $scope.monitorEvents[k].command,
                action: $scope.monitorEvents[k].action,
                part: $scope.monitorEvents[k].part,
                args: $scope.monitorEvents[k].args,
                time: $scope.monitorEvents[k].time,
                number: $scope.monitorEvents[k].number
            }
            parsedEvents.push(d);
        }
        var data = $filter("genericSearchFilter")(parsedEvents, predicate, false);
        $scope.filteredData = angular.copy(data);
        if (!$scope.$$phase)
            $scope.$apply();
    };
    $scope.filteredData = [];
    $scope.selectedInteraction = {};
    $scope.showButtons = false;
    $scope.showFilters = false;
    $scope.loadInteractionDetails = function(interaction) {
        $scope.selectedInteraction = interaction;
    }

    function clearAllActions(filter) {
        var actions = [];
        var isNull = _.isNull(filter);
        if (!isNull) {
            actions = _.where($scope.searchFilters, function(act) {
                return act.name != filter.name;
            })
        } else {
            actions = $scope.searchFilters;
        }
        for (var k = 0; k < actions.length; k++) {
            actions[k].isSelected = false;
        }

        if (isNull) {
            var act = _.find(actions, function(ac) {
                return ac.name.toLowerCase() == "all";
            });
            if (act) {
                act.isSelected = true;
            }
        }
    };
    var getFilteredProperty = function() {
        switch ($scope.selectedFilter) {
            case "All":
                return "undefined";
            case "InteractionName":
                return "action";
            case "InteractionTypes":
                return "part";
            case "Parameters":
                return "args";
        }
    };

    function fetchAsset() {
        var serverAssets = EC2Restangular.all('assetMgmt');
        if ($scope.adId != "") {
            //get ad and asset
            adService.getAdById($scope.adId).then(function(ad) {
                $scope.ad = ad;
                serverAssets.get($scope.assetId).then(function(asset) {
                    $scope.asset = asset;
                    convertToAssetModel();
                    getCanvasMargins();
                }, function(error) {
                    console.warn("Error fetching asset : id : ", $scope.assetId);
                });
            }, function(response) {
                console.warn("Error fetching ad : id : ", $scope.adId);
            });
        } else if ($scope.adId == "") {
          //just get asset
          serverAssets.get($scope.assetId).then(function (asset) {
            $scope.asset = asset;
            convertToAssetModel();
            getCanvasMargins();
          }, function (error) {
            console.warn("Error fetching asset : id : ", $scope.assetId);
          });
        }

    };
    fetchAsset();

    function getContainerWidth() {
        return _.parseInt($("#previewSection").width());
    }

     function getContainerHeight() {
        return _.parseInt($("#previewSection").height());
    }

    $scope.divHeight = $(window).height() - 150;

    function getContainerHeight() {
        return _.parseInt($("#previewSection").height()) - 36;
    }

    function getPanelHeight() {
        return _.parseInt($("#previewSection").height()) - 175;
    }

    function getUserListClassHeight() {
        return getPanelHeight() / 2 - 80;
    }

    function getBottomClassHeight() {
        return getPanelHeight() / 2 - 200;
    }

    function getCanvasMargins() {
        var leftPanelWidth = 316;
        var divWidth = getContainerWidth() - leftPanelWidth;
        var divHeight = getContainerHeight();
    
        $scope.marginLeft = (divWidth - $scope.asset.width) / 2 + "px";
        $scope.marginTop =  (divHeight - $scope.asset.height) / 2 + "px";
    }

    $scope.containerHeight = getContainerHeight();
    $scope.panelHeight = getPanelHeight();
    $scope.userListClassHeight = getUserListClassHeight();
    $scope.bottomClassHeight = getBottomClassHeight();

    $(window).resize(function() {
        $scope.containerHeight = getContainerHeight();
        $scope.panelHeight = getPanelHeight();
        $scope.userListClassHeight = getUserListClassHeight();
        $scope.bottomClassHeight = getBottomClassHeight();
        if (!$scope.$$phase)
            $scope.$apply();
    });
    $scope.sectionType = {
        general: 1,
        interactionMonitor: 2
    };
    $scope.manageSideBar = function(sectionType, value) {
        switch (sectionType) {
            case 1:
                $scope.showGeneralSection = !value;
                if ($scope.showGeneralSection) {
                    $scope.showInteractionMonitor = false;

                }
                break;
            case 2:
                $scope.showInteractionMonitor = !value;
                if ($scope.showInteractionMonitor) {
                    $scope.showGeneralSection = false;
                }
                break;
        }

        if (!$scope.$$phase)
            $scope.$apply();
    };
    /*$scope.marginLeft = 0 - ($scope.asset.assetMetadata.width / 2) + "px";
    $scope.marginTop = 0 - ($scope.asset.assetMetadata.height / 2) + "px";*/

    /* $scope.onMouseLeave = function () {
         $scope.frameStyle = {'border-left': '0px', 'border-top': '0px', 'border-right': '0px', 'border-bottom': '0px'};
     };

     $scope.onMouseEnter = function () {
         $scope.frameStyle = {border: '3px solid blue'};
     };*/
    $scope.renderAssetForPlay = function() {
        //        return $sce.trustAsHtml();//TODO:don't know exactly which property should be inside --> return $sce.trustAsHtml($scope.ad.displayTag);
    }

    $scope.isSWFAsset = true;

    function convertToAssetModel() {
        if ($scope.asset) {
            $scope.isSWFAsset = $scope.asset.formatContext.format.toUpperCase() == "SWF";
            $scope.asset.size = adPreviewService.parseSizeFromBytes($scope.asset.formatContext.fileSize);
            $scope.asset.dimension = adPreviewService.getAssetDimension($scope.asset);
            var maxWidth = 800;
            var maxHeight = 400;
            if ($scope.asset && $scope.asset.formatContext && $scope.asset.formatContext.format) {
                if ($scope.asset.formatContext.format.toUpperCase() == "SWF") {
                    if ($scope.asset.swfContext) {
                        $scope.asset.height = $scope.asset.swfContext.height;
                        $scope.asset.width = $scope.asset.swfContext.width;
                        /*$scope.marginLeft = 0 - ($scope.asset.width / 2) + "px";
                        $scope.marginTop = 0 - ($scope.asset.height / 2) + "px";*/
                    }
                } else if ($scope.asset.imageContext) {
                    if ($scope.asset.imageContext.width > maxWidth || $scope.asset.imageContext.height > maxHeight) {
                        var fitDimension = adPreviewService.calculateAspectRatioFit($scope.asset.imageContext.width, $scope.asset.imageContext.height, maxWidth, maxHeight);
                        $scope.asset.height = fitDimension['height'];
                        $scope.asset.width = fitDimension['width'];
                    } else {
                        $scope.asset.height = $scope.asset.imageContext.height;
                        $scope.asset.width = $scope.asset.imageContext.width;
                    }
                    /*$scope.marginLeft = 0 - ($scope.asset.width / 2) + "px";
                    $scope.marginTop = 0 - ($scope.asset.height / 2) + "px";*/
                    /*$scope.asset.height = $scope.asset.assetMetadata[0].height;
                    $scope.asset.width = $scope.asset.assetMetadata[0].width;*/
                }
            }
        }
    }

    $scope.openDefaultAccordion = function() {
        $scope.adPreviewCommonModel.isDebugClicked = !$scope.adPreviewCommonModel.isDebugClicked;
        //$scope.manageSideBar($scope.sectionType.general, !$scope.adPreviewCommonModel.isDebugClicked);
    };

    function getContainerHeight() {
        return _.parseInt($(document).height()) - 36;
    }

    $scope.adjustSidebarHeight = function() {
        var windowHeight = window.innerHeight;
        angular.element(".AdPreviewOpt #accordion .panel-collapse").css({
            "height": (windowHeight - 122) + "px"
        });
        angular.element(".AdPreviewOpt #accordion .panel-body").css({
            "height": (windowHeight - 122) + "px",
            "max-height": (windowHeight - 122) + "px"
        });

        angular.element(".AdPreviewOpt .user-list").css({
            "height": ((windowHeight - 336) / 2) + "px"
        });
        angular.element(".AdPreviewOpt .addside-option .additional-info .bottom-list").css({
            "height": ((windowHeight - 334) / 2) + "px"
        });
        angular.element(".AdPreviewOpt .addside-option .interation-monitor .user-list").css({
            "height": ((windowHeight - 258) / 2) + "px"
        });
        angular.element(".AdPreviewOpt .addside-option .interation-monitor .additional-info .bottom-list").css({
            "height": ((windowHeight - 288) / 2) + "px"
        });
    }

    setTimeout(function() {
        $scope.adjustSidebarHeight();
    }, 1000);

    $scope.containerHeight = getContainerHeight();
    $(window).resize(function() {
        $scope.containerHeight = getContainerHeight();
        $scope.adjustSidebarHeight();
        console.info("$scope.containerHeight", $scope.containerHeight);
        if (!$scope.$$phase)
            $scope.$apply();
    });

    $scope.loadInteractionDetails = function(interaction) {
        $scope.selectedInteraction = interaction;

    };

    $scope.loadIM = function(isPrev) {
        var im = null;
        var ind = 0;
        if ($scope.selectedInteraction) {
            var index = _.findIndex($scope.filteredData, function(d) {
                return $scope.selectedInteraction.number == d.number;
            });
            console.log("index", index);
            if (index > -1) {
                ind = isPrev ? index - 1 : index + 1;
            }
            if (ind < 0)
                ind = 0;
        }
        im = findByIndex.call($scope.filteredData, ind);
        if (im != null) {
            $scope.selectedInteraction = im;
        }
    };

    var findByIndex = function(index) {
        var obj = null;
        if (index > -1) {
            for (var i = 0; i < this.length; i++) {
                if (i == index) {
                    obj = this[i];
                    break;
                }
            }
        }
        return obj;
    };

}]);