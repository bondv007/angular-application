/**
 * Created by atd on 8/19/2014.
 */
/*
//defined in mmtreeview.js also

app.directive('newNode', ['$parse', function ($parse) {
	return function (scope, element, attr) {
		var treeId = scope.treeId;
        var clickHandler = function (event) {
            var ref = $('#' + treeId).jstree(true),
                sel = ref.get_selected();
            if (!sel.length) {
                return false;
            }
            sel = sel[0];
            sel = ref.create_node(sel, {"type": "file"});
            if (sel) {
                ref.edit(sel);
            }
        };
		element.bind('click', clickHandler);

        scope.$on('$destroy', function() {
            element.unbind('click', clickHandler);
        });

	}
}]);

app.directive('renameNode', ['$parse', function ($parse) {
	return function (scope, element, attr) {
		var treeId = scope.treeId;
        var clickHandler = function (event) {
            var ref = $('#' + treeId).jstree(true),
                sel = ref.get_selected();
            if (!sel.length) {
                return false;
            }
            sel = sel[0];
            ref.edit(sel);
        };
		element.bind('click', clickHandler);

        scope.$on('$destroy', function() {
            element.unbind('click', clickHandler);
        });
	}
}]);

app.directive('searchNode', ['$parse', function ($parse) {
	return function (scope, element, attr) {
		var treeId = scope.treeId;
		var timer = false;
        var keyUpHandler = function (event) {
            var v = $(this).val();
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                $('#' + treeId).jstree(true).search(v);
            }, 250);
        };

		element.bind('keyup', keyUpHandler);
        scope.$on('$destroy', function() {
            element.unbind('keyup', keyUpHandler);
        });
	}
}]);
*/

