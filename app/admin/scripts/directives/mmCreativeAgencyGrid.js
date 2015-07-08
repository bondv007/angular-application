/**
 * Created by liad.ron on 10/2/2014.
 */
app.directive('mmCreativeAgencyGrid', [function () {
    return {
      restrict: 'EA',
      scope: {
        mmModel: "=",
        mmAccountId: "=",
        mmGlobalContacts: "=",
        mmCreativeManagerContactsModel: "=",
        mmCreativeAccountsModel: "=",
        mmError: "=",
        mmIsEditMode: "=",
        mmMiniSectionState: "@",
        mmLabelWidth: "@",
        mmRemoveAgency: "&",
        mmCreativeAgencySelected: "&",
        mmFocusCreativeAgency: "=",
        mmIsCampaign: "@",
				mmPermission: "="
      },
      templateUrl: 'admin/views/contacts/creativeAgencyGrid.html',
      controller: ['$scope', '$element','mmRest', 'contactsService', 'enums', '$q', 'mmAlertService', '$timeout', 'mmUtils',
        function ($scope, $element, mmRest, contactsService, enums, $q, mmAlertService, $timeout, mmUtils) {

          var cellErrorObj = {type : '', fieldName : '', msg : ''},
					type = enums.defaultContactsTypes.getName("CREATIVE"),
					newContact = {};

					$scope.labelWidth = 155;
          $scope.agencyName = "";
          $scope.cloumns = [];
          $scope.contactsGridButtonActions = [];
					$scope.mmError.contacts = [];
					$scope.mmError.validationResult = {isSuccess: true, fields: []};

					if(!!$scope.mmIsCampaign){
            $scope.checkboxLabelWidth = $scope.labelWidth + 8;//TODO temporary until padding-left:8px will be changed in .mm-label-value class
            $scope.creativeAccountObj = _.find($scope.mmCreativeAccountsModel,{accountId : $scope.mmAccountId});
          }
          if(_.isUndefined($scope.mmGlobalContacts[$scope.mmAccountId])) getGlobalContacts();

					getAccountName();
          initGridsButtons();
          initGridsColumns();

          function getAccountName(){
            mmRest.accountGlobal($scope.mmAccountId).get().then(function(data){
              $scope.agencyName = data.name;
              $scope.agencySectionTitle = "Creative Manager - " + $scope.agencyName;
            },function(error){
              processError(error);
            });
          }

          function getGlobalContacts(){
            $scope.mmGlobalContacts[$scope.mmAccountId] = [];
            contactsService.getGlobalContactsByAccountId($scope.mmAccountId).then(
              function(data){
                for(var i = 0 ; i < data.length ; i++){
                  $scope.mmGlobalContacts[$scope.mmAccountId].push(data[i]);
                }
              },function(error){
                processError(error);
              }
            )
          }

          function initGridsButtons() {
            if($scope.mmPermission){
							$scope.contactsGridButtonActions = getGridsButtons();
						}
          }

          function initGridsColumns() {
            var columnObj = {};
            columnObj[type] = {onCellChanged: onCellChanged, contacts: $scope.mmGlobalContacts[$scope.mmAccountId], displayErrorMsg: displayErrorMsg};
            $scope.columns = contactsService.getGridColumnDefinition(columnObj, type);
          };

          function getGridsButtons() {
            return [
              {
                name: "Add",
                func: createNewContact,
                isDisable: false
              },
              {
                name: "Remove",
                func: removeContacts,
                isDisable: true
              }
            ]
          }

          function createNewContact() {
            $scope.$root.isDirtyEntity = true;

            var accountId = 0;
            if(!_.isUndefined($scope.mmAccountId) && !_.isNull($scope.mmAccountId)){
              accountId = $scope.mmAccountId;
            }
            var contactObj = {
              type:	type,
              clientRefId: mmUtils.clientIdGenerator.next(),
              accountId: accountId,
              clientType: type
            };

            newContact = contactsService.getNewContactObj(contactObj);
            $scope.mmModel.contacts.push(newContact);
            $scope.mmCreativeManagerContactsModel.push(newContact);
            contactsService.addErrorMessagesToGrid(newContact, 'please select value', $scope.mmError, contactObj.type, 'missing');

						//select new row
						newContact.fieldName = 'clientRefId';
						newContact.value = newContact.clientRefId;
						$scope.selectNewRowHandler();//make row selection
						tabValidation(false);
          }

          function removeContacts() {
            $scope.$root.isDirtyEntity = true;
            //remove all invalid object in mmError that being deleted
            $scope.mmModel.selectedItems.forEach(function(contact){
              removeErrorObj(contact.clientRefId);
            });

            var orgSelecteditems = mmRest.EC2Restangular.copy($scope.mmModel.selectedItems);

            contactsService.deleteContacts($scope.mmModel.selectedItems, $scope.mmModel.contacts);
            contactsService.deleteContacts(orgSelecteditems, $scope.mmCreativeManagerContactsModel);
            contactsService.contactsValidation($scope.mmModel.contacts, $scope.mmError, type);
            if(!_.isEmpty($scope.contactsGridButtonActions)){
							$scope.contactsGridButtonActions[1].isDisable = true;
						}
						tabValidation($scope.mmError.validationResult.isSuccess);
						contactsService.updateValidationHandler($scope.mmError, type, false);
          }

          function removeErrorObj(clientRefId){
            _.remove($scope.mmError.contacts, function(errorObj) {
              return _.isEqual(errorObj.clientRefId, clientRefId);
            });
          }

          function onCellChanged(col, valueId, colIndex, fieldName, row, selectedItem) {
						cellErrorObj = contactsService.onCellChanged(type, fieldName, row, selectedItem,
							$scope.mmModel.contacts, $scope.mmError, $scope.mmGlobalContacts[$scope.mmAccountId]);
						tabValidation(!_.isEmpty(cellErrorObj.msg));
						contactsService.updateValidationHandler($scope.mmError, false);
						return valueId;
					}

					function displayErrorMsg() {
						var result = {isSuccess: true, message: cellErrorObj.msg};
						if (!_.isEmpty(cellErrorObj.msg) && cellErrorObj.fieldName == 'name'){
							result.isSuccess = false;
						}
						return result;
					}

					function processError(error) {
						console.log('ohh no!');
						console.log(error);
						$scope.showSPinner = false;
						if (error && error.data){
							if(!error.data.error) {
								mmAlertService.addError("Server error. Please try again later.");
							} else {
								mmAlertService.addError(error.data.error);
							}
						}else{
							mmAlertService.addError("Server error. Please try again later.");
						}
					}

					function tabValidation(isValid){
						$scope.$emit('mmTabValidation', {
							type : type,
							isValid : isValid
						});
					}

					$scope.selectNewRowHandler = function(){
						var rows = [];
						rows.push(newContact);
						return rows;
					};

          $scope.afterSelectionChanged = function () {
            var selectedItems = $scope.mmModel.selectedItems;
						if(!_.isEmpty($scope.contactsGridButtonActions)) {
							$scope.contactsGridButtonActions[1].isDisable = !(selectedItems.length !== 0);
							$scope.$root.isDirtyEntity = true;
						}
          };

          $scope.onAgencySelected = function(){
            $scope.mmCreativeAgencySelected($scope.mmAccountId);
          };

          $scope.onRemoveAgencyClicked = function(){
            $scope.mmFocusCreativeAgency.accountId = $scope.mmAccountId;
            $scope.mmRemoveAgency();
          };

          $scope.onPrimaryToggle = function(){
            _.find($scope.mmCreativeAccountsModel,{accountId : $scope.mmAccountId}).primaryCreative = $scope.creativeAccountObj.primaryCreative;
          };

					$scope.errorHandler = function () {
						return $scope.mmError.validationResult;
					};

					var eventListener = $scope.$on('mmCreativeValidation', function (event, data) {
						if ($scope.mmError.contacts.length > 0) {
							contactsService.updateValidationHandler($scope.mmError, data.type, true);
						}
					});

					$scope.$on('$destroy', function () {
						if (eventListener) eventListener();
						//TODO init objects & arrays
					});
        }]
    }
  }]
);
