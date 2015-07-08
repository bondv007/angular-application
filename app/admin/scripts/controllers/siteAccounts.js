///**
// * Created by yoav.karpeles on 3/9/14.
// */
//'use strict';
//
//app.controller('siteAccountsCtrl', ['$scope', 'mmModal', function ($scope, mmModal) {
//	$scope.openAttachModal = function (site) {
//		if ($scope.isModalOpen) {
//			return;
//		}
//		$scope.isModalOpen = true;
//    var modalInstance = mmModal.open({
//      templateUrl: './admin/views/attachAccounts2site.html',
//      controller: 'attachAccounts2siteCtrl',
//      title: site.name + ': Attach Accounts',
//      confirmButton: { name: "Attach", funcName: "attach", hide: false},
//      discardButton: { name: "Cancel", funcName: "cancel" },
//      resolve: {
//        site: function() {
//          return site;
//        },
//        accounts: function() {
//          return $scope.accounts;
//        }
//      }
//    });
//
//		modalInstance.result.then(function () {
//			console.log('save');
//			$scope.isModalOpen = false;
//      $scope.siteAccounts.refreshCentral();
//      $scope.accounts.refreshCentral();
//		}, function () {
//			console.log('cancel');
//			$scope.isModalOpen = false;
//		});
//	};
//
//	var attachAccount = function(all, selected) {
//		if (selected.length !== 1) {
//			return;
//		}
//		$scope.openAttachModal(selected[0]);
//	};
//
//	var centralSiteActions = [
//		{ name: 'Delete', func: null, disable: true},
//		{ name: 'Attach', func: attachAccount }
//	];
//	var centralAccountActions = [
//		{ name: 'Delete', func: null, disable: true},
//		{ name: 'Update', func: null }
//	];
//
//	function siteAccounts2sites(siteAccounts) {
//    siteAccounts._orig = [];
//    siteAccounts._siteID2accID = {};
//		var goodSites = [];
//		while (siteAccounts.length > 0) {
//			var site = siteAccounts.pop();
//      siteAccounts._orig.push(site);
//      siteAccounts._siteID2accID[site.id] = {};
//			if (site.relations != null && site.relations.accountIds != null && site.relations.accountIds.length > 0) {
//        site.siteAccounts = site.relations.accountIds;
//			} else {
//				site.siteAccounts = [];
//			}
//
//      goodSites.push(site);
//		}
//		for (var i = 0; i < goodSites.length; i++) {
//      siteAccounts.push(goodSites[i]);
//		}
//		$scope.siteAccounts = siteAccounts;
//	}
//
//  function accounts2Attach(accounts){
//    $scope.accounts = accounts;
//  }
//
//	$scope.centralDataObject = [
//    { type: 'site', centralActions: centralSiteActions, dataManipulator: siteAccounts2sites, isEditable: true, editButtons: [] },
//    { type: 'account', centralActions: centralAccountActions, dataManipulator: accounts2Attach, isEditable: true, editButtons: [] }
//	];
//}]);