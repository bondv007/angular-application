/**
 * Created by yoav.karpeles on 07/4/2014.
 */
app.controller('mmEssentialCtrl', ['$scope', '$rootScope', 'EC2Restangular','mmAlertService', '$modal','mmModal', 'adService', function ($scope, $rootScope, EC2Restangular,mmAlertService, $modal, mmModal, adService) {
	$scope.error = {name: ""};
  $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
  $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
	$scope.entityLayoutButtons.push({name: 'Wiki Page',func:toWikiPage,nodes: []});
	function toWikiPage(){
		window.location.href = 'http://wiki/pages/editpage.action?pageId=24580283';
	}
	$rootScope.mmIsPageDirty = 0;
	$scope.start = {open:false};
	$scope.miniSectionTitle = "Title";
  $scope.show = true;
  $scope.notshow = false;
  $scope.disable = true;
  $scope.showToggle = true;
	$scope.cbEnableNotSelected = {selected: "No"};
	$scope.cbEnableNotSelected2 = {selected: "No"};
	$scope.cbDisableNotSelected = {selected: "No"};
	$scope.cbEnableSelected = {selected: true};
	$scope.cbDisableSelected = {selected: true};
	$scope.cbError = {text:"Example to Checkbox Error"};
	$scope.cb = {isDirty:0};
	$scope.checkboxClick = function(){
		mmAlertService.addSuccess("","You Click me :-)", false);
	};
	$scope.campaignName = {name: ""};
	$scope.campaignError = {text: ""};
	$scope.site = {selectedSite: null};
	$scope.sitesError = {text: ""};
	$scope.adName = {name: ""};
	$scope.adError = {text: ""};
	$scope.columns = [
		{field: 'id', displayName: 'ID'},
		{field: 'name', displayName: 'Name'}
	];

	$scope.centralDeliveryGroupActions = [
		{ name: 'New Master Ad', buttons:[{name:'Add',func: actionFunc},{name:'Delete',func: actionFunc}] },
		{ name: 'Delete' }
	];

	function actionFunc(){

	}

	$scope.isOpen = {open:true};

	$scope.rows = [{id:1,name:"ofir1",error:"Error"},{id:2,name:"ofir2"},{id:3,name:"ofir3"},{id:4,name:"ofir4"}]


	$scope.showAlert = function(alertType){
		if(alertType == "Error"){
			mmAlertService.addError("Error");
		}
		else if(alertType == "Success"){
			mmAlertService.addSuccess("Success");
		}
		else if(alertType == "Warning"){
			mmAlertService.addWarning("Warning");
		}
		else if(alertType == "Info"){
			mmAlertService.addInfo("Info");
		}
		else if (alertType == "LongText") {
			mmAlertService.addInfo("Long Text Long Text Long Text Long Text Long Text Long Text Long Text Long Text Long Text Long Text Long Text Long Text ");
		}
		else if (alertType == "WithLink") {
			mmAlertService.addSuccess("Success ", "http://www.google.com", "Click Me");
		}
	};

	$scope.date = { startDate:"05/10/2014",
								  endDate:"06/08/2015"};
	$scope.date2 ={ };
	$scope.date2.startDate = "05/10/2010";
	$scope.date2.endDate = {startDate:"06/08/2020"};
	$scope.radioSelected = 2;
	$scope.radioButtons =[ {name:"one", id: true },
												 {name:"two", id: false}/*,
												 {name:"three", id: 2},
												 {name:"four", id:3},
												 {name:"five", id:4}*/]

	$scope.radioButtons2 =[{name:"Zero", id: 0 },
			{name:"One", id: 1},
			{name:"Two", id: 2},
			{name:"Three", id: 3},
			{name:"Four", id :4}];
	$scope.radioButtons3 =[{name:"True", id: 0 },
																				{name:"false", id: 1}];



  $scope.dirty = {
    tab1 : 0,
    tab2 : 0,
    general: 0
  };
  $scope.$parent.mainEntity = {name: "mitzi", description: null, link: "linnkkkkk", displayName: "Some name"};
  $scope.$parent.mainEntity.listOfOptions = [
    {id3: 0, name: 'one', attribute: 'q'},
    {id3: 6, name: 'two', attribute: 'w'},
    {id3: 9, name: 'three', attribute: 'e'},
    {id3: 20, name: 'five', attribute: 'r'},
    {id3: 89, name: 'six', attribute: 't'}
  ];
  $scope.demoModel =
  {
    id: "YUIDOD137",
    name: "mitzi",
    description: null,
    link: "linnkkkkk",
    displayName: "Some name",
    url: "http://google.com",
    optionSingle: 6,
    optionSingle2: 9,
    optionMulti: [6,9],
    optionMulti2: [20,89,6],
    editMode: false
  };

  $scope.demoModel.listOfOptions = [
    {id: 'HRA0I1', name: 'one', attribute: 'q'},
    {id: 6, name: 'two', attribute: 'w'},
    {id: 9, name: 'three', attribute: 'e'},
    {id: 20, name: 'five', attribute: 'r'},
    {id: 89, name: 'six', attribute: 't'}
  ];

	$scope.demoModel.listOfOptionsMultiple = [
		{id: 0, name: 'one', attribute: 'q'},
		{id: 6, name: 'two', attribute: 'w'},
		{id: 9, name: 'three', attribute: 'e'},
		{id: 20, name: 'five', attribute: 'r'},
		{id: 89, name: 'six', attribute: 't'}
	];


  function save(){
    console.log('save called');
		if ($scope.campaignName.name == '') {
			$scope.campaignError = {text: "Please enter a Name. - Long Text Error Long Text Error Long Text Error Long Text Error Long Text Error Long Text Error."};
		} else {
			$scope.campaignError = {text: ""};
		}
		if ($scope.adName.name == '') {
			$scope.adError = {text: "Please enter a Name."};
		} else {
			$scope.adError = {text: ""};
		}
		if ($scope.site.selectedSite == null) {
			$scope.sitesError = {text: "Please select a Site.- Long Text Error Long Text Error Long Text Error Long Text Error Long Text Error Long Text Error."};
		} else {
			$scope.sitesError = {text: ""};
		}
	}

	function updateState() {

	}

	$scope.clicked = function(){
    console.log('clicked');
  }

	var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);
  $scope.uploadClick = function(){
    var modalInstance = $modal.open({
      templateUrl: './adManagementApp/views/uploadAsset.html',
      controller: 'uploadAssetCtrl',
      title: "Upload Asset",
      backdrop: 'static',
      //windowClass: windowClass
      //modalWidth: 800,
      confirmButton: { name: "Done", funcName: "save", hide: false, isPrimary: true},
      discardButton: { name: "Close", funcName: "cancel" },
			resolve: {
				adDetailsForUpload: function () {
					return adDetails;
				}
			}
      /*bodyHeight: 600,
       discardButton: { name: "Close", funcName: "closePopup" },
       confirmButton:{name: "Attach to Ad", funcName: "attachImagesToAd" ,hide: "hideExpresion"}*/
    });
  }

}]);
