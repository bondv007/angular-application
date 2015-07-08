app.directive('friendlyGridRow', function () {
	return {
		restrict: 'AE',
		replace: true,
		scope: {
			item: '='
		},
		template: '<div style="border-bottom: solid 1px black; margin-top: 5px; margin-bottom: 10px;">' +
			'<div style="display:inline-block;width:40px; height: 40px; ">' +
			'<img src="../../images/Icon.png" style="width:40px;height: 40px; top: -10px; position: relative;">' +
			'</div>' +
			'<div style="display:inline-block;height: 40px; margin-bottom: 10px;">' +
			'<div><a>{{item.name}}</a></div>' +
			'<span ng-repeat="a in item | limitTo:3">{{a}} &nbsp</span>  | &nbsp Add {{item.type}} &nbsp Delete {{item.type}} &nbsp Edit {{item.type}}' +
			'</div>' +
			'</div>'
	};
});