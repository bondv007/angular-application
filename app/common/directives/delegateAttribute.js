/**
 * Created by Asaf David on 3/5/15.
 */

/**
 * Generic helper, creates a form control wrapper with a specific directive inside.
 *
 * @param tagName
 * @returns {Function}
 */
function delegateAttributeDirective(tagName) {
	return function() {
		return {
			scope: true,
			restrict: 'E',
			template: function (element, attrs) {
				var attrString = "";
				angular.forEach(attrs.$attr, function(val, key) {
					attrString += val + '="' + attrs[key] + '" ';
				});

				var template = '<form-control ' + attrString + '> \
					<' + tagName + ' ' + attrString + '></' + tagName + '>\
				</form-control>';
				return template;
			}
		}
	}
}
