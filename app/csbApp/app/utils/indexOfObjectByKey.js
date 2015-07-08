Array.prototype.indexOfObjectByKey = function (key, value) {
    
    var len = this.length;
    for (var i = 0; i < len; i++) {
        if (this[i][key] === value) {
            return i;
        }
    }

    return -1;
}