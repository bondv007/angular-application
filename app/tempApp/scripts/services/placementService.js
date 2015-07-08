//'use strict';
//
//app.service('placementService', function placementService() {
//	var placements = [];
//
//	var year = 1980 + Math.floor((Math.random() * 10) + 1);
//	var month = Math.floor((Math.random() * 8) + 1);
//	for (var i = 0; i < 1000; i++) {
//		var day = Math.floor((Math.random() * 20) + 1);
//
//		var startDate = new Date(year, month, day);
//		var endDate = new Date(year, month, day + 3);
//
//		placements.push(new Placement(i, 'placement_' + i, 'site_' + (i % 9), startDate.toLocaleDateString(), endDate.toLocaleDateString()));
//	}
//
//
//////    function callbackfunc(data) {
//////        placements = data;
//////    }
//////
//////    delete $http.defaults.headers.common['X-Requested-With'];
//////    $http.jsonp('http://localhost:3123?callback=callbackfunc')
//////        .success(function(data, status, header, config){
//////            callbackfunc(data);
//////        })
//////        .error(function(data, status, header, config){
//////            console.log(data);
//////            console.log(status);
//////            console.log(header());
//////            console.log(config);
//////        });
//
//
////    var deferred = $q.defer();
////
////
////    $.ajax({
////        url: "http://rotem_perets_pc/nancyapp/placements/list",
////        context: document.body,
////        contentType: "application\jsonp",
////        dataType: 'jsonp'
////    }).done(function (data) {
////
////            deferred.resolve(data);
////
////            placements = data;
////            alert("success   " + data[0].PlacementID);
////        }).error(function(err) {
////
////            alert("error" + err.message);
////        });
//
//
//	return {
//		getPlacements: function () {
//			return placements;
//		},
//		getPlacementById: function (id) {
//			for (var i = 0; i < placements.length; i++) {
//				if (placements[i].id === id) {
//					return placements[i];
//				}
//			}
//
//			return null;
//		},
//		savePlacement: function (placement) {
//			placements[placement.id] = placement;
//		},
//		getPlacementsByMemberValue: function (memberName, memberValue) {
//			var list = [];
//			for (var i = 0; i < placements.length; i++) {
//				if (placements[i][memberName] === memberValue) {
//					list.push(placements[i]);
//				}
//			}
//
//			return list;
//		}
//	};
//});
