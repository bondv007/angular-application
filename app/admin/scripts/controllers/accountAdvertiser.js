/**
 * Created by yoav.karpeles on 3/9/14.
 */
'use strict';

app.controller('accountAdvertiserCtrl', ['$scope', 'mmModal', '$filter', function ($scope, mmModal, $filter) {
	$scope.openAttachModal = function (account) {
		if ($scope.isModalOpen) {
      return;
    }
		$scope.isModalOpen = true;

    var modalInstance = mmModal.open({
      templateUrl: './admin/views/attachAdvertisers2account.html',
      controller: 'attachAdvertisers2accountCtrl',
      title: account.name + ': Attach Advertisers',
      confirmButton: { name: "Attach", funcName: "attach", hide: false},
      discardButton: { name: "Cancel", funcName: "cancel" },
      resolve: {
        account: function() {
          return account;
        },
        advertisers: function() {
          return $scope.modalAdvertiserAccounts;
        }
      }
    });

		modalInstance.result.then(function () {
			$scope.isModalOpen = false;
			$scope.modalAdvertiserAccounts.refreshCentral();
		}, function () {
			$scope.isModalOpen = false;
		});
	};

	var attachAdvertiser = function(all, selected) {
		if (selected.length !== 1) {
			return;
		}
		$scope.openAttachModal(selected[0]);
	};

	var centralAccountActions = [
		{ name: 'Delete', func: null, disable: true},
		{ name: 'Attach', func: attachAdvertiser }
	];
	var centralAdvertiserActions = [
		{ name: 'Delete', func: null, disable: true },
		{ name: 'Update', func: null }
	];

	function advertiserAccounts2advertisers(advertiserAccounts) {
    if($scope.modalAdvertiserAccounts == undefined){
      $scope.modalAdvertiserAccounts = [];
      $scope.modalAdvertiserAccounts._advID2accID = {};
      $scope.modalAdvertiserAccounts._orig = [];
    }
		advertiserAccounts._orig = [];
		advertiserAccounts._advID2accID = {};
		var goodAdvertisers = [];
		while (advertiserAccounts.length > 0) {
			var adv = advertiserAccounts.pop();
			advertiserAccounts._orig.push(adv);
      $scope.modalAdvertiserAccounts._orig.push(adv);
			advertiserAccounts._advID2accID[adv.id] = {};
      $scope.modalAdvertiserAccounts._advID2accID[adv.id] = {};
			if (adv.advertiserAccounts != null && adv.advertiserAccounts.length > 0) {
				for (var i = 0; i < adv.advertiserAccounts.length; i++) {
					var aa = adv.advertiserAccounts[i];
					if(!_.contains(adv.advertiserAccounts, {accountId : adv.advertiserAccounts[i].accountId})){
						adv.advertiserAccounts[i].aaID = aa.id;
						adv.advertiserAccounts[i]._id_ = aa.id;
						adv.advertiserAccounts[i].id = aa.advertiserId + "." + aa.accountId;
						goodAdvertisers.push(aa);
						advertiserAccounts._advID2accID[adv.id][aa.accountId] = i;
						$scope.modalAdvertiserAccounts._advID2accID[adv.id][aa.accountId] = i;
					}
				}
			} else {
				adv.advertiserAccounts = [];
			}
		}
		for (var i = 0; i < goodAdvertisers.length; i++) {
			advertiserAccounts.push(goodAdvertisers[i]);
		}
    if($scope.modalAdvertiserAccounts.length == 0){
      $scope.modalAdvertiserAccounts = advertiserAccounts;
    } else {
      for (var i = 0; i < goodAdvertisers.length; i++) {
        $scope.modalAdvertiserAccounts.push(goodAdvertisers[i]);
      }
    }

		//TODO remove commented out lines when indication on when entity selected will be available in the central
//		$scope.selectedItems = $filter('filter')($scope.advertiserAccounts, {isSelected:true});
//		if (_.isUndefined($scope.selectedItems) || _.isNull($scope.selectedItems) || _.isEmpty($scope.selectedItems) || $scope.selectedItems.length > 1){
//			$scope.centralDataObject[0].centralActions[1]["disable"] = true;
//		}
	}

	function removeDuplicationAAonAdvertiser(aas){
		var noneDiplicateAAsList = [];
		noneDiplicateAAsList =  _.uniq(aas, function(aa, key, accountId) {
			return aa.accountId;
		});

		return noneDiplicateAAsList;
	}

	$scope.centralDataObject = [
		{ type: 'account', centralActions: centralAccountActions, dataManipulator: null, isEditable: true, editButtons: [] },
		{ type: 'advertiserAA', centralActions: centralAdvertiserActions, dataManipulator: advertiserAccounts2advertisers, isEditable: true, editButtons: [] }
	];
}]);