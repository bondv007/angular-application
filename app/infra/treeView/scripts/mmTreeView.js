app.directive('mmTreeView', [function () {
  return {
    restrict: 'E',
    template: '<div class="tree-master-class" id="{{treeId}}"></div>',
    scope: {
      data: '=',
      treeId: '@',
      newNodeHandler: '=?',
      renameNodeHandler: "=?",
      selectedNodeHandler: '=?',
      dragDropHandler: '=?',
      canDragDrop: "=?",
      currentParentId: "@"
    },
    replace: false,
    transclude: false,
    controller: ['$scope', '$attrs', '$timeout',
      function ($scope, $attrs, $timeout) {

        var currentParentId = 1;

        $attrs.$observe('treeId', function (val) {
          $scope.treeId = typeof (val) == 'undefined' ? "dvTree" : val;
        });
        $attrs.$observe('canDragDrop', function (val) {
          $scope.canDragDrop = typeof (val) == 'undefined' ? false : val == "true" ? true : false;
        });

        $attrs.$observe("currentParentId", function (newValue) {
          currentParentId = newValue;
        });

        var selectedText = "";
        var selectedType = "";
        var tree;
        var plugins = ["search", "state", "types", "sort"];
        if ($scope.canDragDrop)
          plugins.push("dnd");

        function refreshTree() {
          if($("#" + $scope.treeId).length == 0)
            return;
          if ($("#" + $scope.treeId).jstree() != undefined && $("#" + $scope.treeId).jstree().settings.core != undefined) {
            $("#" + $scope.treeId).jstree().settings.core.data = $scope.data;
            $("#" + $scope.treeId).jstree().refresh();
          }
          else {
            setTimeout(function () {
              refreshTree();
            }, 20);
          }
        }

        $scope.$on("refreshTree", function () {
          refreshTree();
        });

        var clicks = 0;

                var timer = $timeout(function () {
                    tree = $("#" + $scope.treeId);
                    tree.jstree({
                        'core': {
                            "animation": 300,
                            "check_callback": true,
                            "themes": { "stripes": false },
                            'data': $scope.data,
                            'multiple': false
                        },
                        "types": {
                            "default": {
                              "icon": "assets-icon-Mini_folder_color"
                            },
                            "file": {
                              "icon": "fa fa-file-o icon-lg"
                            },
                            "HTML5": {
                              "icon": "assets-icon-Mini_html_foldr_color"
                            },
                            "DEFAULT": {
                              "icon": "assets-icon-Mini_folder_color"
                            }
                        },
                        "search" : {
                          "case_insensitive" : true
                        },
                        "sort": function (a, b) {
                          return this.get_text(a).toLowerCase() > this.get_text(b).toLowerCase() ? 1 : -1;
                        },
                        "plugins": plugins
                    })
                    .bind("rename_node.jstree", function (e, data) {
                        if (typeof $scope.renameNodeHandler == 'function') {
                            $scope.renameNodeHandler(data);
                        }
                    })
                    .on('dblclick.jstree', function (e) {
                        e.preventDefault();
                      })
                    .bind('click.jstree', function (e) {
                        var node = $(e.target).closest("li");
                        var id = node[0].id; //id of the selected node
                        clicks++;  //count clicks
                        $timeout(function() {
                          if(clicks == 2) {
                            tree.jstree('toggle_node', id);
                          }
                          tree.jstree('deselect_all');
                          tree.jstree('select_node', id);
                          if (typeof $scope.selectedNodeHandler == 'function') {
                            var data = _.filter($scope.data, function(d) {
                              return d.id == id;
                            });
                            var nodeData = {"node": data[0]};
                            $scope.selectedNodeHandler(nodeData);
                            currentParentId = nodeData.node.id;
                          }
                          clicks = 0;  //after action performed, reset counter

                        }, 500);

                      })
                    .bind("create_node.jstree ", function (e, data) {
                        if (typeof $scope.newNodeHandler == 'function') {
                            $scope.newNodeHandler(data);
                        }
                    })
                    .bind("move_node.jstree", function (e, data) {
                        if (typeof $scope.dragDropHandler == 'function') {
                          $scope.dragDropHandler(data);
                        }
                    })
                    .on('open_node.jstree', function (e, data) {
                      $scope.adjustTreeNodes();
                      selectedType = data.node.type;
                      if (selectedType == "DEFAULT" || selectedType == "default" || selectedType == "") {
                        data.instance.set_icon(data.node, "assets-icon-Open_folder");
                      } else if (selectedType == "HTML5" || selectedType == "html5") {
                        data.instance.set_icon(data.node, "assets-icon-Open_html_folder");
                      }

                    })
                    .on('close_node.jstree', function (e, data) {
                      selectedType = data.node.type;
                      if (selectedType == "DEFAULT" || selectedType == "default" || selectedType == "") {
                        data.instance.set_icon(data.node, "assets-icon-Mini_folder_color");
                      } else if (selectedType == "HTML5" || selectedType == "html5") {
                        data.instance.set_icon(data.node, "assets-icon-Mini_html_foldr_color");
                      }
                    }) .bind('ready.jstree', function(e, data) {
                        // invoked after jstree has loaded
                        $scope.adjustTreeNodes();
                    })
                    .on('hover_node.jstree',function(e,data){
                        angular.element("#"+data.node.id).prop('title', data.node.text);
                    })
                    .on('refresh.jstree',function(e,data){
                      $scope.adjustTreeNodes();
                      tree.jstree('deselect_all');
                      tree.jstree('select_node', currentParentId);
                    })

                    /*.bind('search.jstree', function(e, data) {
                      console.log("Found " + data.res.length + " nodes matching '" + data.res[0] + "'.");
                        if (data.res.length > 0) {
                          if (typeof $scope.selectedNodeHandler == 'function') {
                            var folder = _.filter($scope.data, function(d) {
                              return d.id == data.res[0];
                            });
                            var nodeData = {"node": folder[0]};
                            $scope.selectedNodeHandler(nodeData);
                            //currentParentId = nodeData.node.id;
                          }
                        }
                    })*/;
                }, 20);

        $scope.adjustTreeNodes = function() {
          $(".jstree-node").each(function(i){
            var numVal = parseInt($(this).attr("aria-level"));
            $(this).children(".jstree-icon:first").css({"left": ((numVal-1)*24)+10 +"px"});
            $(this).children(".jstree-anchor:first").css({"padding-left": (numVal*24)+"px"});
          });
        }

        //Its time to collect the garbage in order to prevent memory leaks.
        $scope.$on("$destroy", function () {
          //deregister all timeouts
          if (timer)$timeout.cancel(timer);
        });
      }]}
}]).directive('newNode', ['$parse', function ($parse) {
  return function (scope, element, attr) {
    //var treeId = attr.treeId;
    var treeId = scope.treeId;
    element.bind('click', function (event) {
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
    });
  }
}]).directive('renameNode', ['$parse', function ($parse) {
  return function (scope, element, attr) {
    //var treeId = attr.treeId;
    var treeId = scope.treeId;
    element.bind('click', function (event) {
      var ref = $('#' + treeId).jstree(true),
        sel = ref.get_selected();
      if (!sel.length) {
        return false;
      }
      sel = sel[0];
      ref.edit(sel);
    });
  }
}]).directive('searchNode', ['$parse', function ($parse) {
  return function (scope, element, attr) {
    var treeId = attr.treeId;
    //var treeId = scope.treeId;
    var timer = false;
    element.bind('keyup', function (event) {
      var v = $(this).val();
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        $('#' + treeId).jstree(true).search(v);
      }, 250);
    });
  }
}]);
