/**
 * Created by liad.ron on 9/9/2014.
 */

'use strict';

app.controller('mediaCtrl', ['$scope', '$state','flowToolBar', 'mmPermissions', 'entityMetaData', 'mmFeatureFlagService', function ($scope, $state, flowToolBar, mmPermissions, entityMetaData, mmFeatureFlagService ) {

	var hasCampaignPermission = mmPermissions.hasPermissionBySession(entityMetaData['campaign'].permissions.entity);
	var hasAdvertiserPermission = mmPermissions.hasPermissionBySession(entityMetaData['advertiser'].permissions.entity);
	var hasBillingIoViewPermission = mmPermissions.hasPermissionBySession(entityMetaData['mediaIo'].permissions.entity.view);
	var hasVersaTagPermission = mmPermissions.hasPermissionBySession(entityMetaData['versaTag'].permissions.entity);
	// var hasAdvertiserTagsPermission = mmPermissions.hasPermissionBySession(entityMetaData['advertiserVtag'].permissions.entity );
	// TODO: change this back when there are advertiser tag permissions
	var hasAdvertiserTagsPermission = true;

	mmFeatureFlagService.GetFlagsAsync().then( function() {

		$scope.type = null;
		$scope.hideGoTo = true;
		$scope.entityId = null;
		$scope.entityActions = [];

		if( hasCampaignPermission ){
			$scope.entityActions.push(
				{
					name: 'Campaigns',
					ref: '.campaigns',
					func: changeToCampaignView,
					preventOpenMenu: true
				}
			);
		}

		if( hasAdvertiserPermission ){
			$scope.entityActions.push(
				{
					name: 'Advertisers',
					ref: '.advertisers',
					func: changeToAdvertiserView,
					preventOpenMenu: true
				}
			);
		}

		if ( hasAdvertiserTagsPermission && mmFeatureFlagService.IsFeatureOn( 'AdvertiserTagsUI' ) ) {
			$scope.entityActions.push(
				{
					name: 'Advertiser Tags',
					ref: '.advertiserTags',
					func: changeToAdvertiserTagsView,
					preventOpenMenu: true
				}
			);
		}

		if ( hasVersaTagPermission && mmFeatureFlagService.IsFeatureOn( 'VersaTagUI' ) ) {
			$scope.entityActions.push(
				{
					name: 'VersaTags',
					ref: '.versaTags',
					func: changeToVersaTagView,
					preventOpenMenu: true
				}
			);
		}

		if( hasBillingIoViewPermission ) {
			$scope.entityActions.push(
				{
					name: 'Io Management',
					ref: '.',
					func: changeToIOView,
					preventOpenMenu: true
				}
			);
		}

		$scope.entityActions.parentMenuItem = 'Media';
		if ( $scope.$parent.isActive ) {
			$scope.$parent.isActive( $scope.entityActions.parentMenuItem );
		}
		flowToolBar.setPrefixToEntityActions('spa.media',$scope.entityActions);

	});


	function changeToCampaignView(){
		changeView('spa.media.campaigns');
	};
	function changeToAdvertiserView(){
		changeView('spa.media.advertisers');
	};
	function changeToVersaTagView(){
		changeView('spa.media.versaTags');
	};
	function changeToAdvertiserTagsView() {
		changeView('spa.media.advertiserTags');
	};
    function changeToIOView(){
        changeView('spa.media.ioList.ioEdit');
    }
	function changeView(view) {
		$state.go(view);
	};

}]);
