/**
 * Created by atd on 9/16/2014.
 */
app.filter('startFrom', function () {
	return function (input, start) {
		start = +start;
		return input.slice(start);
	}
});
