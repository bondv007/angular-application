/**
 * Created by atd 11/14.
 */
app.controller('spreadsheetDemo', ['$scope', '$rootScope', 'EC2Restangular', 'enums','$document', '$timeout', 'mmAlertService',
  function ($scope, $rootScope, EC2Restangular, enums,$document,$timeout, mmAlertService) {
  $scope.error = {name: ""};
//  $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
//  $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: updateState, ref: null, nodes: []};
//  $rootScope.mmIsPageDirty = 0;
  $scope.bannerSizeMap = [];
  $scope.placementTypes = enums.placementTypes;

  function updateState() {
    console.log('update state');
  }

  function save(){
    console.log('save called');
  }

  function processError(error) {
    console.log('ohh no!');
    console.log(error);
  }

    //Custom Cell Type
    function FivePointedStarCellType() {
      this.size = 10;
    }
    FivePointedStarCellType.prototype = new $.wijmo.wijspread.CustomCellType();
    FivePointedStarCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
      if (!ctx) {
        return;
      }

      ctx.save();

      // draw inside the cell's boundary
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.beginPath();

      if (value) {
        ctx.fillStyle = "orange";
      } else {
        ctx.fillStyle = "gray";
      }

      var size = this.size;
      var dx = x + w / 2;
      var dy = y + h / 2;
      ctx.beginPath();
      var dig = Math.PI / 5 * 4;
      for (var i = 0; i < 5; i++) {
        ctx.lineTo(dx + Math.sin(i * dig) * size, dy + Math.cos(i * dig) * size);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };
    FivePointedStarCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
      var xm = cellRect.x + cellRect.width / 2,
        ym = cellRect.y + cellRect.height / 2,
        size = 10;
      var info = { x: x, y: y, row: context.row, col: context.col, cellRect: cellRect, sheetArea: context.sheetArea };
      if (xm - size <= x && x <= xm + size && ym - size <= y && y <= ym + size) {
        info.isReservedLocation = true;
      }
      return info;
    };
    FivePointedStarCellType.prototype.processMouseUp = function (hitInfo) {
      var sheet = hitInfo.sheet;
      if (sheet && hitInfo.isReservedLocation) {
        var row = hitInfo.row, col = hitInfo.col, sheetArea = hitInfo.sheetArea;
        var newValue = !sheet.getValue(row, col, sheetArea);
        var cellEditInfo = { row: row, col: col, newValue: newValue };
        var undoAction = new $.wijmo.wijspread.UndoRedo.CellEditUndoAction(sheet, cellEditInfo);
        sheet.doCommand(undoAction);
        return true;
      }
      return false;
    };

    function FullNameCellType() {
    }
    FullNameCellType.prototype = new $.wijmo.wijspread.CustomCellType();
    FullNameCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
      if (value) {
        $.wijmo.wijspread.CustomCellType.prototype.paint.apply(this, [ctx, value.firstName + "." + value.lastName, x, y, w, h, style, context]);
      }
    };
    FullNameCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
      if (editorContext) {
        $(editorContext).width(cellRect.width);
        $(editorContext).height(100);
      }
    };
    FullNameCellType.prototype.createEditorElement = function () {
      var div = document.createElement("div");
      var $div = $(div);
      $div.attr("gcUIElement", "gcEditingInput");
      $div.css("background-color", "white");
      $div.css("position", "absolute");
      $div.css("overflow", "hidden");
      $div.css("border", "2px #5292f7 solid");
      var $span1 = $("<span></span>");
      $span1.css("display", "block");
      $span1.css("font", "bold 10pt arial");
      $span1.css("margin-top", "5px");
      var $span2 = $("<span></span>");
      $span2.css("display", "block");
      $span2.css("font", "bold 10pt arial");
      var $input1 = $("<input type='text'/>");
      $input1.css("margin-bottom", "10px");
      $input1.css("margin-left", "2px");
      var $input2 = $("<input type='text'/>");
      $input2.css("margin-left", "2px");
      $div.append($span1);
      $div.append($input1);
      $div.append($span2);
      $div.append($input2);
      return div;
    };
    FullNameCellType.prototype.getEditorValue = function (editorContext) {
      if (editorContext && editorContext.children.length === 4) {
        var input1 = editorContext.children[1];
        var firstName = $(input1).val();
        var input2 = editorContext.children[3];
        var lastName = $(input2).val();
        return { firstName: firstName, lastName: lastName };
      }
    };
    FullNameCellType.prototype.setEditorValue = function (editorContext, value) {
      if (editorContext && editorContext.children.length === 4) {
        var span1 = editorContext.children[0];
        $(span1).text("First Name:");
        var span2 = editorContext.children[2];
        $(span2).text("Last Name:");
        if (value) {
          var input1 = editorContext.children[1];
          $(input1).val(value.firstName);
          var input2 = editorContext.children[3];
          $(input2).val(value.lastName);
        }
      }
    };
    FullNameCellType.prototype.isReservedKey = function (e) {
      //cell type handle tab key by itself
      return (e.keyCode === $.wijmo.wijspread.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey);
    };
    FullNameCellType.prototype.isEditingValueChanged = function (oldValue, newValue) {
      if (oldValue !== newValue && (!oldValue || !newValue)) {
        return true;
      }
      if (newValue.firstName != oldValue.firstName || newValue.lastName != oldValue.lastName) {
        return true;
      }
      return false;
    };

    $(document).ready(function () {
      $("#ss").wijspread({ sheetCount: 1 });

      /*if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
        //run for ie7/8
        var spread = $("#ss").wijspread("spread");
        spread.bind("SpreadsheetObjectLoaded", function () {
          initSpread();
        });
      } else {
        initSpread();
      }*/
    });

    //load data elements
    var dataOperations = 0;

    $scope.placementTypeList = [];
    $scope.siteList = [];
    $scope.siteSectionList = [];
    $scope.packageList = [];

    for (var i = 0; i < $scope.placementTypes.length; i++){
      $scope.placementTypeList.push($scope.placementTypes[i].name);
    }

//    EC2Restangular.all('placements').all('packages').getList({campaignId:$stateParams.campaignId}).then(function (all) {
    EC2Restangular.all('placements').all('packages').getList({campaignId:'HRA0YE'}).then(function (all) {
      $scope.packages = all;
      $scope.selectedPackages = $scope.packages;
      for (var i = 0; i < $scope.packages.length; i++){
        $scope.packageList.push($scope.packages[i].name);
      }
      dataOperations++;
      init();
    }, function (response) {
      console.log(response);
    });

    EC2Restangular.all('sites').all('global').getList().then(function (all) {
      $scope.sites = all;
      for (var i = 0; i < $scope.sites.length; i++){
        $scope.siteList.push($scope.sites[i].name);
      }
      dataOperations++;
      init();
    }, function (response) {
      console.log(response);
    });

    EC2Restangular.all('sites').all('sitesection').all('global').getList().then(function (all) {
      $scope.sections = all;
      $scope.changeSectionsBySiteId();
      for (var i = 0; i < $scope.sections.length; i++){
        $scope.siteSectionList.push($scope.sections[i].name);
      }
      dataOperations++;
      init();
    }, function (response) {
      console.log(response);
    });

    EC2Restangular.all('placements').all('bannerSizes').getList().then(function (all) {
      $scope.bannerSize = all;
      formatBannerSize();
      dataOperations++;
      init();
    }, function (response) {
      mmAlertService.addError(response);
    });

    $scope.changeSectionsBySiteId = function() {
      if ($scope.placement && $scope.placement.siteId) {
        $scope.siteSections = _.filter($scope.sections,{ siteId: $scope.placement.siteId });
        $scope.selectedPackages = _.filter($scope.packages,{ siteId: $scope.placement.siteId, campaignId: $scope.placement.campaignId });
      }
      else {
        $scope.siteSections = $scope.sections;
        $scope.selectedPackages = $scope.packages;
      }
      /*if(!$scope.isSectionExistInSiteSectionsList() && $scope.placement){
        $scope.placement.sectionId = null;
      }*/
    }

    function formatBannerSize() {
      var name;
      $scope.bannerSizeDD = [];
      for (var i = 0; i < $scope.bannerSize.length; i++) {
        name = $scope.bannerSize[i]['width'] + 'X' + $scope.bannerSize[i]['height'];
        addBannerSizeToDropDown(name);
      }
    }
    function addBannerSizeToDropDown(name){
      $scope.bannerSizeDD.push({id: name, name: name});
      $scope.bannerSizeMap.push(name);
    }

    function init(){
      if (dataOperations == 4){
        initSpread();
      }
    }

    function initSpread() {
      var spread = $("#ss").wijspread("spread");
      //spread.useWijmoTheme = true;
      spread.showVerticalScrollbar = true;
      var sheet = spread.getActiveSheet();
      sheet.isPaintSuspended(true);
      var dataSource = [];
      /*var dataSource = [
        { result: true, name: { firstName: "Nancy", lastName: "Freehafer" }, phone: "(123)555-5100", country: "US",email: "mailto:nancy@northwindtraders.com",onJob:true},
        { result: false, name: { firstName: "Andrew", lastName: "Cencini" }, phone: "(123)555-5101", country: "UK", email: "mailto:andrew@northwindtraders.com", onJob: false },
        { result: true, name: { firstName: "Jan", lastName: "Kotas" }, phone: "(123)555-5102", country: "Germany", email: "mailto:jan@northwindtraders.com", onJob: true },
        { result: false, name: { firstName: "Mariya", lastName: "Sergienko" }, phone: "(123)555-5103", country: "US", email: "mailto:mariya@northwindtraders.com", onJob: true },
        { result: true, name: { firstName: "Steven", lastName: "Thorpe" }, phone: "(123)555-5104", country: "Mexico", email: "mailto:steven@northwindtraders.com", onJob: false },
        { result: true, name: { firstName: "Michael", lastName: "Neipper" }, phone: "(123)555-5105", country: "US", email: "mailto:michael@northwindtraders.com", onJob: true },
        { result: true, name: { firstName: "Robert", lastName: "Zare" }, phone: "(123)555-5106", country: "UK", email: "mailto:robert@northwindtraders.com", onJob: true },
        { result: true, name: { firstName: "Laura", lastName: "Giussani" }, phone: "(123)555-5107", country: "US", email: "mailto:laura@northwindtraders.com", onJob: false },
        { result: false, name: { firstName: "Anne", lastName: "Hellung-Larsen" }, phone: "(123)555-5108", country: "US", email: "mailto:anne@northwindtraders.com", onJob: true }
      ];*/

      for (var i = 0; i < 5000; i++){
        var obj = { bannerSize: '5x5', placementType: 'In Banner', site: 'EranSite', siteSection: 'kooo', result: true, name: { firstName: "Nancy", lastName: "Freehafer" }, phone: "(123)555-5100", country: "US",email: "mailto:nancy@northwindtraders.com",onJob:true};
        dataSource.push(obj);
      }

      var comboCellType = new $.wijmo.wijspread.ComboBoxCellType();
      comboCellType.items(["US", "UK", "Germany", "Maxico"]);

      var sitesCell = new $.wijmo.wijspread.ComboBoxCellType();
      sitesCell.items($scope.siteList);

      var sectionsCell = new $.wijmo.wijspread.ComboBoxCellType();
      sectionsCell.items($scope.siteSectionList);

      var placementTypeCell = new $.wijmo.wijspread.ComboBoxCellType();
      placementTypeCell.items($scope.placementTypeList);

      var bannerSizeCell = new $.wijmo.wijspread.ComboBoxCellType();
      bannerSizeCell.items($scope.bannerSizeMap);

      var packageCell = new $.wijmo.wijspread.ComboBoxCellType();
      packageCell.items($scope.packageList);

      var buttonCellType = new $.wijmo.wijspread.ButtonCellType();
      buttonCellType.marginLeft(5).marginRight(5).marginTop(5).marginBottom(5).text("Delete");

      var colInfos = [
        { name: "result", displayName: "Check", size: 50, cellType: new FivePointedStarCellType() },
        //{ name: "name", displayName: "Name", size: 157, cellType: new FullNameCellType() },
        //{ name: "phone", displayName: "Phone", size: 100 },
        //{ name: "country", displayName: "Country", size: 75, cellType: comboCellType },
        { name: "site", displayName: "Site", size: 200, cellType: sitesCell },
        { name: "siteSection", displayName: "Site Section", size: 150, cellType: sectionsCell },
        { name: "placementType", displayName: "Placement Type", size: 150, cellType: placementTypeCell },
        { name: "bannerSize", displayName: "Banner Size", size: 125, cellType: bannerSizeCell },
        { name: "package", displayName: "Package", size: 100, cellType: packageCell },
        //{ name: "email", displayName: "Email", size: 220, cellType: new $.wijmo.wijspread.HyperLinkCellType() },
        //{ name: "onJob", displayName: "OnJob", size: 50, cellType: new $.wijmo.wijspread.CheckBoxCellType() },
        { displayName:" ",size: 60, cellType: buttonCellType }
      ];

      sheet.setDataSource(dataSource);
      sheet.bindColumns(colInfos);
      sheet.defaults.rowHeight = 30;
      for (var i = 0; i < sheet.getColumnCount(); i++) {
        sheet.getColumn(i).
          hAlign($.wijmo.wijspread.HorizontalAlign.center).
          vAlign($.wijmo.wijspread.VerticalAlign.center);
      }
      sheet.isPaintSuspended(false);

      /*spread.bind($.wijmo.wijspread.Events.EditEnd, function (e, info) {
        console.log (e, info);
      });*/

      spread.bind($.wijmo.wijspread.Events.LeaveCell, function (e, info) {
        //console.log (e, info);
        //console.log('cols: ' + sheet.getColumnCount() + ' rows: ' + sheet.getRowCount());
        if ( info.col == (sheet.getColumnCount()-1) && info.row == (sheet.getRowCount()-1)){
          //console.log('last cell');
          sheet.addRows(sheet.getRowCount(),1);
        }
      });

      spread.bind($.wijmo.wijspread.Events.CellChanged, function (event, cellInfo) {
        //console.log(event, cellInfo);
      });

      spread.bind($.wijmo.wijspread.Events.InvalidOperation, function (e, info) {
        console.log(e, info);
      });

      document.addEventListener("paste", function (e) {
        var pastedText = undefined;
        if (window.clipboardData && window.clipboardData.getData) { // IE
          pastedText = window.clipboardData.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
          pastedText = e.clipboardData.getData('text/plain');
        }
        var pastedRows = pastedText.split(/\r\n|\r|\n/).length - 1;
        var active_ri = sheet.getActiveRowIndex();
        var remainingRows = sheet.getRowCount() - (active_ri + 1);
        if ( pastedRows > remainingRows){
          var rowsToAdd = pastedRows - (remainingRows > 0 ? remainingRows + 1 : 1);
          sheet.addRows(sheet.getRowCount(), rowsToAdd);
        }
        //console.log("You just pasted '" + pastedText + "'");
      });

      spread.bind($.wijmo.wijspread.Events.ClipboardPasting, function (sender, args) {
        console.log(sender);
        console.log(args);
        console.log('pasted: ' + args.cellRange.rowCount + " left: " + (sheet.getRowCount() - args.cellRange.row));
        if (args.cellRange.rowCount > (sheet.getRowCount() - args.cellRange.row)){
          sheet.addRows(sheet.getRowCount(),sheet.getRowCount() - args.cellRange.rowCount);
        }
        for (var i = args.cellRange.row; i < args.cellRange.row + args.cellRange.rowCount; i++) {
          for (var j = args.cellRange.col; j < args.cellRange.col + args.cellRange.colCount; j++) {
            var cell = args.sheet.getCell(i, j, $.wijmo.wijspread.SheetArea.viewport);
            console.log(cell);
            console.log(dataSource);
          }
        }
        $scope.packageList.push('j1');
      });

      spread.bind($.wijmo.wijspread.Events.ButtonClicked, function (e, args) {
        var cellType = args.sheet.getCellType(args.row, args.col);
        if (cellType instanceof $.wijmo.wijspread.ButtonCellType) {
          var result = confirm("Are you sure you want to delete this record", "OK", "Cancel");
          if (result) {
            args.sheet.deleteRows(args.sheet.getActiveRowIndex(), 1);
            if (args.sheet.isEditing()) {
              args.sheet.endEdit();
            }
          }
        }
      });


    }

  }]);
