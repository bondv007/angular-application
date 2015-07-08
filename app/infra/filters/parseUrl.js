/**
 * Created by eran.nachum on 3/3/14.
 */
app.filter('parseUrl', function() {
	return function(text) {

		if (text != ""){
			if (!/^https?:\/\//i.test(text)) {
				return 'http://' + text;
			}
			else {
				return text;
			}
		}
	};
});