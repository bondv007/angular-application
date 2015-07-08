/**
 * Emptys array without losing reference
 * uses the fastest method ( this.pop() )
 */
if ( !Array.prototype.emptyArray ) {
    Array.prototype.emptyArray = function() {
        while (this.length > 0) {
            this.pop();
        }
    };
}