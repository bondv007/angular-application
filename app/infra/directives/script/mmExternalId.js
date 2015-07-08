/**
 * Created by liad.ron on 8/20/2014.
 */

'use strict';

app.directive('mmExternalId', [function(){
	return {
		restrict: "E",
		templateUrl: "infra/directives/views/externalId.html",
		controller: ['$scope', '$element', 'enums', '$timeout', function ($scope, $element, enums, $timeout) {
			$scope.mmTabIndex = ($element.attr('mm-tab-index') !== undefined) ? $element.attr('mm-tab-index') : 1;
			$scope.entityTypes = enums.externalIdEntityType;
			$scope.externalPadding = $scope.miniSection ? 0 : 40;
			if(!_.isUndefined($scope.$parent) && !!$scope.isEntral){
				$scope.externalPadding = 18;
			}
			$scope.externalIdlabelWidth = 100;
			$scope.externalIdMiniSectionStartOpen = false;

			var timer;
			var watcher = $scope.$watch('externalId', function (newValue, oldValue) {
				initExternalId();
			});

			$scope.setExternalLeftPadding = function(pageType){
				switch(pageType){
					case 'fullPage':
						$scope.externalPadding =  32;
						break;
					case 'entral':
						$scope.externalPadding = 10;
						break;
					case 'modal':
						$scope.externalPadding = 0;
						break;
//					case 'toggle':
//						$scope.externalPadding
//						break;
				}
			}

			$scope.onIdTextChanged = function(){

				$scope.externalId.isValid = true;

				if (_.isUndefined($scope.externalId) && _.isNull($scope.externalId)){
					$scope.externalId.isValid = false;
					return;
				}

				timer = $timeout(function(){ idValidation(); }, 50);
			};

			$scope.onEntityTypeSelected = function(){
				if($scope.externalId.entityType == null){//null mean that it is 'Please Select'
					if(regIsNumber($scope.externalId.id) && !_.isEmpty($scope.externalId.id))
						$scope.externalId.validation.id = '';
				}else{
					$scope.externalId.validation.entityType = '';
				}
			};

			function externalIdValidation(){
				var isValid = true;
//				if(!$scope.externalId.entityType){
//					$scope.externalId.validation.entityType = $scope.externalId.invalidEntityTypeValidationdMsg;
//					isValid = false;
//				}
//				if(!$scope.externalId.id){
//					$scope.externalId.validation.id = $scope.externalId.invalidExternalIdValidationdMsg;
//					isValid = false;
//				}
//
//				if(isValid){$scope.externalId.validation = {entityType:'',id:''};}
//				else {
//					openMiniSection();
//					return false;
//				}

				if(!$scope.externalId.isValid){
					isValid = false;
					$scope.externalId.validation.id = $scope.externalId.invalidExternalIdValidationdMsg;
				}

				if($scope.externalId.entityType && !$scope.externalId.id){
					$scope.externalId.validation.id = $scope.externalId.invalidExternalIdValidationdMsg;
					isValid = false;
				}

				if(!$scope.externalId.entityType && $scope.externalId.isValid && $scope.externalId.id){
					$scope.externalId.validation.entityType = $scope.externalId.invalidEntityTypeValidationdMsg;
					isValid = false;
				}

				if(isValid){$scope.externalId.validation = {entityType:'',id:''};}
				else openMiniSection();

				return isValid;
			}

			function openMiniSection(){
				if(!$scope.externalIdMiniSectionStartOpen){
					$scope.externalIdMiniSectionStartOpen = true;
				}
			}

			function initExternalId(){
				$scope.externalId.type ='ExternalId';
				$scope.externalId.isValid = true;
				$scope.externalId.invalidExternalIdValidationdMsg = 'Please enter an external id. Only numbers accepted';
				$scope.externalId.invalidEntityTypeValidationdMsg = 'Please select entity type';
				$scope.externalId.entityTypes = enums.externalIdEntityType;
				$scope.externalId.validation = {
					entityType:'',
					id:''
				};
				$scope.externalId.externalIdValidation = externalIdValidation;
			}

			function entityTypeValidation(){
				$scope.externalId.validation.entityType = '';
				if(_.isUndefined($scope.externalId.entityType) || _.isNull($scope.externalId.entityType)) {
					$scope.externalId.validation.entityType = $scope.invalidEntityTypeValidationdMsg;
					$scope.externalId.isValid = false;
				}
			}

			function idValidation(){
				$scope.externalId.validation.id = '';
				if(_.isUndefined($scope.externalId.id) || _.isNull($scope.externalId.id) || !regIsNumber($scope.externalId.id)){
					if(_.isUndefined($scope.validation.externalId) || _.isNull($scope.validation.externalId)){
						$scope.externalId.validation.id = $scope.externalId.invalidExternalIdValidationdMsg};
					$scope.externalId.isValid = false;
				}
			}

			// check is number
			function regIsNumber(fData)
			{
				var reg = /^\s*?\d+\s*$/;
				if(_.isEmpty(fData)) return true;
				return String(fData).search(reg) != -1
			}

			$scope.$on('$destroy', function() {
				if (watcher){
					watcher();
				}

				$timeout.cancel(timer);
			});
		}]
	}
}]);