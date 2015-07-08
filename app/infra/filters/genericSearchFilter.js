app.filter('genericSearchFilter', ['$filter', function ($filter) {
	return function (items, keyObj, unique) {
		var filterObj = {
			data: items,
			filteredData: [],
			fData: [],
      uniqueOnAll: unique,
			applyFilter: function (obj, key) {
				if (typeof this.filteredData == "undefined" || this.filteredData.length == 0)
					this.filteredData = this.data ? this.data : [];
				var firstOrDefault;
				if (this.filteredData.length > 0)
					firstOrDefault = items ? items[0] : {};
				if (obj) {
					var filter = $filter("filter");
					var fObj = {};
          var filterResult = [];
          if (!angular.isArray(obj)) {
						if (typeof firstOrDefault != "undefined") {
							var isKeyExist = firstOrDefault.hasOwnProperty(key);
							if (isKeyExist) {
								fObj[key] = obj;
                if (this.uniqueOnAll) {
                   //combine matching results of all keys but make resulting array objects unique
                   filterResult = (filter(this.data, fObj, function(expected, actual) {
                   if (expected != "") {
                   return expected.toLowerCase().indexOf(actual.toLowerCase()) > -1;     //contains, case insensitive
                   } else {
                   return false;
                   }
                   }));
                   this.fData = this.fData.concat(filterResult);
                } else {
                  this.fData = this.fData.concat(filter(this.filteredData, fObj));
                }
							} else {
                this.fData = this.fData.concat(filter(this.filteredData, obj));
							}
						} else {
							this.fData = this.fData.concat(filter(this.filteredData, function (data, index) {
								return(data[key].search(new RegExp(obj, "i")) != -1);
							}));
						}
					} else if (angular.isArray(obj)) {
						if (obj.length > 0) {
							for (var i = 0; i < obj.length; i++) {
								if (angular.isDefined(obj[i])) {
									fObj[key] = obj[i];
									this.fData = this.fData.concat(filter(this.filteredData, fObj));
								}
							}
						}
					}
					this.filteredData = this.fData;
				}
        if (this.uniqueOnAll) {
          this.filteredData = $filter('unique')(this.filteredData,'id');
        }
			}
		};
		if (keyObj) {
			angular.forEach(keyObj, function (obj, key) {
				if (typeof key != "undefined" && !this.uniqueOnAll)
					key = key.toLowerCase();
				filterObj.applyFilter(obj, key);
			});
      /*angular.forEach(keyObj, function (obj, key) {
          filterObj.applyFilter(obj, key);
      });*/
		}
		return filterObj.filteredData;
	}
}]);
