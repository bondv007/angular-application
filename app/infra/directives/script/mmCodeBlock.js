// Created by Jeff Gunderson 3/16/15

/**
 * mmCodeBlock
 * Directive that wraps google prettify to add code syntax highlighting
 * mmCode: (string) The code you pass into the directive that will be "pretty-fied"
 * selectOnClick: (boolean) set to true if you want the whole code block selected when you click on it
 * HAS A DEPENDENCY ON GOOGLE PRETTIFY https://code.google.com/p/google-code-prettify/
 */

'use strict';

app.directive( 'mmCodeBlock', [ '$timeout', '$compile',
	function( $timeout, $compile ) {

		return {
			restrict: 'E',
			scope: {
				mmCode: '=',
				selectOnClick: '@'
			},
			link: function( scope, element, attrs ) {

				scope.$watch('mmCode', function( code ) {

					// if there is code to render
					if ( code ) {

						// compile the element and set as the html of the element
						// replacing html each time we get new code because prettify breaks the binding( {{mmCode}} )
						// because it adds <span>'s and <br>'s to prettify the code
						element.html( $compile( '<pre class="prettyprint">{{mmCode}}</pre>' )(scope) );

						// timeout because outside of angular world
						// and then run prettyPrint to make the code "pretty"
						$timeout(function() {

							// run the prettify
							prettyPrint();

							// then bind the click if we want to select all text when clicking the code
							if ( scope.selectOnClick ) {
								bindSelectClick();
							}

						});

					}

				});

				/**
				 * Function that will select all the text of the element when clicked on
				 */
				function bindSelectClick() {

					element.bind( 'click', function() {

						if ( document.selection ) {
							var range = document.body.createTextRange();
							range.moveToElementText( element[0].querySelector('.prettyprint') );
							range.select();
						}

						else if ( window.getSelection() ) {
							var range = document.createRange();
							range.selectNode( element[0].querySelector('.prettyprint') );
							window.getSelection().removeAllRanges();
							window.getSelection().addRange(range);
						}

					});

				};

			}
		}

	}
]);