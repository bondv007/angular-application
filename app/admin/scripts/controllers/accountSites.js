/**
 * Created by yoav.karpeles on 3/9/14.
 */
'use strict';

app.controller('accountSitesCtrl', ['$scope', 'mmModal', function ($scope, mmModal) {
	$scope.openAttachModal = function (account) {
		if ($scope.isModalOpen) {
			return;
		}
		$scope.isModalOpen = true;
    var modalInstance = mmModal.open({
      templateUrl: './admin/views/attachSites2account.html',
      controller: 'attachSites2accountCtrl',
      title: account.name + ': Attach Sites',
      confirmButton: { name: "Attach", funcName: "attach", hide: false},
      discardButton: { name: "Cancel", funcName: "cancel" },
      resolve: {
        account: function() {
          return account;
        },
        sites: function() {
          return $scope.siteAccounts;
        }
      }
    });

		modalInstance.result.then(function () {
			console.log('save');
			$scope.isModalOpen = false;
      $scope.siteAccounts.refreshCentral();
		}, function () {
			console.log('cancel');
			$scope.isModalOpen = false;
		});
	};

	var attachSite = function(all, selected) {
		if (selected.length !== 1) {
			return;
		}
		$scope.openAttachModal(selected[0]);
	};

	var centralAccountActions = [
		{ name: 'Delete', func: null },
		{ name: 'Attach', func: attachSite }
	];
	var centralSiteActions = [
		{ name: 'Delete', func: null },
		{ name: 'Update', func: null }
	];

	function siteAccounts2sites(siteAccounts) {
    siteAccounts._orig = [];
    siteAccounts._siteID2accID = {};
		var goodSites = [];
		while (siteAccounts.length > 0) {
			var site = siteAccounts.pop();
      siteAccounts._orig.push(site);
      siteAccounts._siteID2accID[site.id] = {};
			if (site.relations != null && site.relations.accountIds != null && site.relations.accountIds.length > 0) {
        site.siteAccounts = [];
        var accountIds = site.relations.accountIds;
				for (var i = 0; i < accountIds.length; i++) {
          site.siteAccounts[i] = {};
					site.siteAccounts[i].relationID = site.relations.id;
					site.siteAccounts[i]._id_ = site.relations.id;
					site.siteAccounts[i].id = site.id + "." + accountIds[i];
          site.siteAccounts[i].accountId = accountIds[i];
          site.siteAccounts[i].name = site.name;
          goodSites.push(site.siteAccounts[i]);
          siteAccounts._siteID2accID[site.id][accountIds[i]] = i;
				}
			} else {
				site.siteAccounts = [];
			}
		}
		for (var i = 0; i < goodSites.length; i++) {
      siteAccounts.push(goodSites[i]);
		}
		$scope.siteAccounts = siteAccounts;
	}

	$scope.centralDataObject = [
		{ type: 'account', centralActions: centralAccountActions, dataManipulator: null, isEditable: true, editButtons: [] },
		{ type: 'siteAccount', centralActions: centralSiteActions, dataManipulator: siteAccounts2sites, isEditable: true, editButtons: [] }
	];
}]);