/**
 * Created by xicom on 7/17/2014.
 */

app.directive('fSlider', function () {
	return {
		restrict: 'E',
		require: ['additionalAssets'],
		scope: {
			additionalAssets: "="
		},
		replace: false,
		transclude: false,
		templateUrl: 'adManagementApp/views/slider.html',
		controller: ['$scope', '$timeout', function ($scope, $timeout) {
			console.log("items", $scope.additionalAssets);
			// The slider being synced must be initialized first

			$scope.showSlider = $scope.additionalAssets.length > 0;
			console.log("fired");
			angular.element("#carousel").flexslider({
				animation: "slide",
				controlNav: false,
				animationLoop: false,
				slideshow: false,
				itemWidth: 151,
				itemMargin: 5,
				asNavFor: '#slider',
				start: function (slider) {
				}
			});

			angular.element("#slider").flexslider({
				animation: "slide",
				controlNav: false,
				animationLoop: false,
				slideshow: false,
				sync: "#carousel",
				start: function (slider) {
				}
			});
			$scope.$watch("additionalAssets", function () {
				$scope.showSlider = $scope.additionalAssets.length > 0;
				var sliderCorousel = angular.element('#carousel').data('flexslider');
				var slider = angular.element('#slider').data('flexslider');
				angular.forEach(sliderCorousel.slides, function (data, key) {
					sliderCorousel.removeSlide(data);
				});
				angular.forEach(slider.slides, function (data, key) {
					slider.removeSlide(data);
				});
				angular.forEach($scope.additionalAssets, function (asset, index) {
					var url = "";
					for (var index = 0; index < asset.thumbnails.length; index++) {
						var thumb = asset.thumbnails[index];
						if (thumb.name == asset.assetCode) {
							url = thumb.url;
							break;
						}
					}
					var slide = '<li><img src=' + url + ' alt="Slide Images"></li>';
					sliderCorousel.addSlide(slide);
					var slide = "<li>\r" +
						"\n" +
						"<div class=\"slide-content row\">\r" +
						"\n" +
						"<div class=\"left-inner-slide\"><img src=" + url + " alt=\"Slide Images\">\r" +
						"\n" +
						"</div>\r" +
						"\n" +
						"<div class=\"right-inner-slide\">\r" +
						"\n" +
						"<h3>Additional Asset | " + asset.fileName + "</h3>\r" +
						"\n" +
						" <ul>\r" +
						"\n" +
						"<li>\r" +
						"\n" +
						"<label>Size</label>\r" +
						"\n" +
						"<span>" + asset.formatContext.fileSize + " kb</span>\r" +
						"\n" +
						"</li>\r" +
						"\n" +
						"<li>\r" +
						"\n" +
						"<label>Dimensions</label>\r" +
						"\n" +
						"<span>" + asset.imageContext.height + " X " + asset.imageContext.width + " px</span>\r" +
						"\n" +
						"</li>\r" +
						"\n" +
						"<li>\r" +
						"\n" +
						"<label>Last Update</label>\r" +
						"\n" +
						"<span>June 1 2014</span>\r" +
						"\n" +
						"</li>\r" +
						"\n" +
						"<li>\r" +
						"\n" +
						"<label>Updated by</label>\r" +
						"\n" +
						"<span>Vitaly Mijiraski</span>\r" +
						"\n" +
						"</li>\r" +
						"\n" +
						"</ul>\r" +
						"\n" +
						"<ul class=\"list-inline\">\r" +
						"\n" +
						"<li>\r" +
						"\n" +
						"<a href=\"#\" class=\"fa-stack fa-lg\">\r" +
						"\n" +
						"<i class=\"fa fa-circle fa-stack-2x\"></i>\r" +
						"\n" +
						"<i class=\"fa fa-refresh fa-stack-1x fa-inverse\"></i>\r" +
						"\n" +
						"</a>\r" +
						"\n" +
						"<a href=\"#\" class=\"btn btn-default\">\r" +
						"\n" +
						"<i class=\"fa fa-share\"> </i>Share </a>\r" +
						"\n" +
						"<a href=\"#\" class=\"btn btn-default\">\r" +
						"\n" +
						"<i class=\"fa fa-edit\"> </i>Edit </a>\r" +
						"\n" +
						"</li>\r" +
						"\n" +
						"</ul>\r" +
						"\n" +
						"<div class=\"clear\"></div>\r" +
						"\n" +
						"<div class=\"ads-section\">\r" +
						"\n" +
						"<h4>Ads</h4>\r" +
						"\n" +
						"<div class=\"table-container\">\r" +
						"\n" +
						"<table>\r" +
						"\n" +
						"<tbody>\r" +
						"\n" +
						"<tr>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"</tr>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"</tr>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"</tr>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"<td>&nbsp;</td>\r" +
						"\n" +
						"</tr>\r" +
						"\n" +
						"</tbody>\r" +
						"\n" +
						"</table>\r" +
						"\n" +
						"</div>\r" +
						"\n" +
						"</div>\r" +
						"\n" +
						"</div>\r" +
						"\n" +
						"</div>\r" +
						"\n" +
						"</li>\r" +
						"\n";
					slider.addSlide(slide);
					angular.element('#carousel .slides li img').click(function (event) {
						angular.element('#slider').flexslider("prev");
						console.log("index", slider.currentSlide);
					});
					angular.element('#slider').flexslider("prev");
				});
			}, true);
		}]
	}
});
