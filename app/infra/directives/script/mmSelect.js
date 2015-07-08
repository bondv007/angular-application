/**
 * Created by rotem.perets on 5/1/14.
 */
app.directive('mmSelect', ['$compile', '$parse',
	function($compile, $parse) {
		return {
			restrict: 'E',
			scope: {
				mmError: "=",
				mmModel: "=",
				mmPlaceholder: "@",
				mmIsDirty: "=",
				mmModelId: "@",
				mmModelName: "@",
				mmCaption: "@",
				mmClass: "@",
				mmShowLabel: "@",
				mmSelected: "="
			},
			link: function (scope, element, attrs) {
				scope.orig = undefined;
				scope.mmModelId = scope.mmModelId || 'id';
				scope.mmModelName = scope.mmModelName || 'name';
				if (attrs.mmIsDirty !== undefined && scope.mmIsDirty === undefined) {
					scope.mmIsDirty = 0;
				}
				scope.painted = false;
				var modelId2Index = {};

				function paint() {
					if (scope.painted === false && scope.mmModel != null && scope.mmSelected != null) {
						scope.painted = true;
						if(attrs.mmShowLabel === undefined){
							attrs.mmShowLabel = true;
						}
						for (var i = 0; i < scope.mmModel.length; i++) {
							modelId2Index[scope.mmModel[i][scope.mmModelId]] = i;
						}
						scope.modelId2Index = modelId2Index;
						if (scope.mmSelected.Id !== undefined) {
							scope.$watch('mmSelected.Id', function() {
								scope.selectedId = scope.mmSelected.Id;
							});
						} else if (scope.mmSelected.Obj !== undefined) {
							scope.$watch('mmSelected.Obj', function() {
								scope.selectedId = scope.mmSelected.Obj[scope.mmModelId];
							});
						} else if (scope.mmSelected.Index !== undefined) {
							scope.$watch('mmSelected.Index', function() {
								scope.selectedId = scope.mmModel[scope.mmSelected.Index];
							});
						} else {
							console.log("ERROR: no selected object for selected directive");
						}
						scope.$watch('selectedId', function () {
							if (scope.mmSelected.Id !== undefined) {
								scope.mmSelected.Id = scope.selectedId;
							}
							if (scope.mmSelected.Obj !== undefined) {
								scope.mmSelected.Obj = scope.mmModel[scope.modelId2Index[scope.selectedId]];
							}
							if (scope.mmSelected.Index !== undefined) {
								scope.mmSelected.Index = scope.modelId2Index[scope.selectedId];
							}
							if (scope.orig === undefined) {
								scope.orig = scope.selectedId;
							}
							var lastState = scope.mmLocalIsDirty;
							scope.mmLocalIsDirty = scope.selectedId != scope.orig;
							if (lastState !== undefined && lastState != scope.mmLocalIsDirty) {
								if (scope.mmIsDirty !== undefined) {
									scope.mmLocalIsDirty ? scope.mmIsDirty++ : scope.mmIsDirty--;
								}
								if (scope.$root.mmIsPageDirty !== undefined) {
									scope.mmLocalIsDirty ? scope.$root.mmIsPageDirty++ : scope.$root.mmIsPageDirty--;
								}
							}
						});

						var textHtml = '';
						if(attrs.mmShowLabel === true){
							textHtml += '<div class="col-lg-2 col-md-2 col-xs-4">';
							textHtml += '<span class="mm-label ' + scope.mmClass + '">' + scope.mmCaption + '</span>';
							textHtml += '</div>';
						}
						textHtml += '<div class="col-lg-2 col-md-4 col-xs-8">';
						textHtml += '<a ng-class="(mmError?\'error\':(mmLocalIsDirty?\'dirty\':\'regular\'))" tooltip-popup-delay="500" tooltip-placement="bottom" tooltip="{{mmError}}" ';
						textHtml += 'href="#" editable-select="selectedId" buttons="no" ';
						textHtml += 'e-ng-options="e.' + (scope.mmModelId) + ' as e.' + (scope.mmModelName) + ' for e in mmModel" ';
						textHtml += '>{{mmModel[modelId2Index[selectedId]].' + (scope.mmModelName) + '}}</a> '
						textHtml += '</div>';

						element.html(textHtml);
						$compile(element.contents())(scope);
					}
				}

				scope.$watch('mmModel', function() {
					paint();
				});

				scope.$watch('mmSelected', function() {
					paint();
				});
			}
		}
	}]
);