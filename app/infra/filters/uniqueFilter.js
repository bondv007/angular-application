/**
 * Created by Ofir.Fridman on 1/19/2015.
 */
'use strict';
app.filter('unique', function () {
  return function (arr, field) {
    return _.uniq(arr, function (item) {
      return item[field];
    });
  };
});
