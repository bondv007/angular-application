/**
 * Created by ATD
 */

'use strict';

app.service('spreadsheetService', ['mmModal', '$q', function(mmModal, $q){

  function colDef (type, name, label, size, selectList, onEnterFunc, validateFunc, addNewFunc, onChangeFunc, readOnly, validatePair, validationFixPrepare, validationFixSave){
    return { type: type,
      name: name,
      label: label,
      size: size,
      selectList: selectList,
      validateFunc: validateFunc,
      onEnterFunc: onEnterFunc,
      addNewFunc: addNewFunc,
      onChangeFunc: onChangeFunc,
      readOnly: readOnly,
      validatePair: validatePair,
      validationFixPrepare: validationFixPrepare,
      validationFixSave: validationFixSave
    }
  }

  function buildColumns(colDefs){
    var cols = [];
    for (var i = 0; i < colDefs.length; i++){
      cols.push(createColumn(colDefs[i].type, colDefs[i].name, colDefs[i].label, colDefs[i].size, colDefs[i].selectList, colDefs[i].onEnterFunc, colDefs[i].validateFunc, colDefs[i].addNewFunc, colDefs[i].onChangeFunc, colDefs[i].readOnly, colDefs[i].validatePair, colDefs[i].validationFixPrepare, colDefs[i].validationFixSave));
    }
    return cols;
  }

  function createColumn(type, name, label, size, list, onEnterFunc, validateFunc, addNewFunc, onChangeFunc, readOnly, validationPair, validationFixPrepare, validationFixSave){
    var cell;
    switch (type){
      case "combo":
        cell = new $.wijmo.wijspread.ComboBoxCellType();
        cell.items(list);
        break;
      case "button":
        cell = new $.wijmo.wijspread.ButtonCellType();
        cell.marginLeft($scope.cellButtonMargin)
          .marginRight($scope.cellButtonMargin)
          .marginTop($scope.cellButtonMargin)
          .marginBottom($scope.cellButtonMargin)
          .text(label);
        break;
      case "link":
        cell = new $.wijmo.wijspread.HyperLinkCellType();
        break;
      case "checkbox":
        cell = new $.wijmo.wijspread.CheckBoxCellType();
        break;
      case "input":
        //cell = new $.wijmo.wijspread.TextCellType();
        cell = new CustomTextCellType();
        break;
      case "date":
        //cell = new $.wijmo.wijspread.TextCellType();
        cell = new CustomTextCellType();
        break;
      case "check":
        cell = new $.wijmo.wijspread.CheckBoxCellType();
        cell.caption('').textAlign($.wijmo.wijspread.CheckBoxTextAlign.right);
        break;
      case "autoComplete":
        cell = new AutoCompleteCellType();
        cell.items(list);
        break;
      case "multiAutoComplete":
        cell = new AutoCompleteCellType();
        cell.items(list);
        cell.multiSelect(true);
        break;
    }
    var col = {
      name: name,
      displayName: label,
      size: size,
      cellType: cell,
      onEnterFunc: onEnterFunc,
      validator: validateFunc,
      addNewFunc: addNewFunc,
      onChangeFunc: onChangeFunc,
      readOnly: readOnly ? true : false,
      type: type,
      validationPair: validationPair,
      list: list,
      validationFixPrepare: validationFixPrepare,
      validationFixSave: validationFixSave
    };
    return col;
  }

  /*** Custom cell types ***/
  function AutoCompleteCellType() {
    this._autoCompleteItems = [];
    this._comboInstance = null;
  }

  AutoCompleteCellType.prototype = new $.wijmo.wijspread.CustomCellType();

  function split( val ) {
    return val.split( /,\s*/ );
  }

  function extractLast( term ) {
    return split( term ).pop();
  }

  AutoCompleteCellType.prototype.activateEditor = function (editorContext, cellStyle, cellRect, context) {
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var self = this;
    var oeType = typeof $scope.spreadCols[context.col].onEnterFunc;
    if ($scope.spreadCols[context.col].onEnterFunc != undefined && oeType == 'function'){
      $scope.spreadCols[context.col].onEnterFunc(context.row);
    }
    var anType = typeof $scope.spreadCols[context.col].addNewFunc;
    var supportsAddNew = anType == 'function' ? true : false;
    $.wijmo.wijspread.CustomCellType.prototype.activateEditor.apply(self, arguments);
    if (editorContext) {
      $(editorContext).width(cellRect.width).height(cellRect.height);
      var $editor = $(editorContext.children[0]);
      $editor.width(cellRect.width).height(cellRect.height);
      if (!self.multiSelect()){
        $editor.autocomplete({
          minLength: 0,
          source: self.items(),
          messages: {
            noResults: '',
            results: function() {}
          },
          focus: function(event, ui){
            this.value = ui.item.value;
          }
        }).on('focus', function(event) {
          $(this).autocomplete("search", "");
        }).on('autocompletechange',function(event){
          if (supportsAddNew) {
            var inList = false;
            if(this.className.indexOf("siteSectionName ") > -1)
            {
              var $scope = angular.element($(".spreadsheetEntity")).scope();
              for (var i = 0; i < $scope.siteSectionList.length; i++){
                if ($scope.siteSectionList[i] == this.value) {inList = true; break;}
              }
            }
            else
            {
              for (var i = 0; i < self.items().length; i++){
                if (self.items()[i] == this.value) {inList = true; break;}
              }
            }

            if (!inList) this.value = "Add New: " + this.value;
          }
        });
      }
      else {
        $editor.bind("keydown", function (event) {
          if (event.keyCode === $.ui.keyCode.TAB &&
            $(this).autocomplete("instance").menu.active) {
            event.preventDefault();
          }
        }).autocomplete({
          minLength: 0,
          source: function (request, response) {
            response($.ui.autocomplete.filter(
              self.items(), extractLast(request.term)));
          },
          focus: function( event, ui ) {
            var items = this.value.split(',');
            var alreadyInList = false;
            for (var i = 0; i < items.length; i++){
              if (items[i].trim() == ui.item.value) alreadyInList = true;
            }
            if (this.value == "") this.value = ui.item.value;
            else if (!alreadyInList)
              if (this.value.trim().indexOf(',') > -1) this.value = this.value + ui.item.value;
              else {
                this.value = ui.item.value;
              }
            return false;
          },
          messages: {
            noResults: '',
            results: function() {}
          }
        }).on('focus', function(event) {
          $(this).autocomplete("search", "");
        });
      }
    }
  };

  AutoCompleteCellType.prototype.isReservedKey = function (e) {
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    if ($scope.spreadSheet.isEditing())
      return ((e.keyCode === $.wijmo.wijspread.Key.up || e.keyCode === $.wijmo.wijspread.Key.down || e.keyCode === $.wijmo.wijspread.Key.enter) && !e.ctrlKey && !e.shiftKey && !e.altKey);
    else return false;
  };

  AutoCompleteCellType.prototype.deactivateEditor = function (editorContext, context) {
    $('#sAutoComplete').autocomplete("destroy");
    $.wijmo.wijspread.CustomCellType.prototype.deactivateEditor.apply(this, arguments);
  };

  AutoCompleteCellType.prototype.createEditorElement = function (context) {
    var container = document.createElement("div");
    container.id = "spreadsheetAutoCompleteContainer";
    var editor = document.createElement("input");
    editor.id = "sAutoComplete";
    container.className = "spreadsheetAutoComplete";
    var $editor = $(editor);
    var $container = $(container);
    $container.css("position", "absolute");
    $container.css("margin", "0");
    $container.attr("gcUIElement", "gcEditor");
    $container.append($editor);
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    $scope.autoCompleteId = "#" + editor.id;
    if($scope.spreadCols[context.col].name === "siteName"){

      var typingTimer;
      var doneTypingInterval = 400;

      $(editor).keyup(function(){
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function(){
          var searchText = $(editor).val();
           $scope.searchSitesList(searchText);
        }, doneTypingInterval);
      });

      $(editor).keydown(function(){
        clearTimeout(typingTimer);
      });
    }
    else if($scope.spreadCols[context.col].name === "siteSectionName")
    {
      $editor.addClass('siteSectionName');
      var name = $scope.spreadSheet.getCell(context.row,4).text();
      if(name.length > 1)
      {
        for(var i= 0,len=$scope.sites.length;i<len;i++)
        {
          if(name == $scope.sites[i].name)
          {
            $scope.getSiteSections($scope.sites[i].id);
            break;
          }
        }
      }
    }
    return container;
  };

  AutoCompleteCellType.prototype.items = function (data) {
    if (arguments.length === 0) {
      return this._autoCompleteItems;
    }
    else {
      this._autoCompleteItems = data;
      return this;
    }
  };

  AutoCompleteCellType.prototype.multiSelect = function (val) {
    if (arguments.length === 0) {
      return this._autoCompleteMultiSelect;
    }
    else {
      this._autoCompleteMultiSelect = val;
      return this;
    }
  };

  AutoCompleteCellType.prototype.focus = function (editorContext, context) {
    $( "#sAutoComplete" ).focus();
  };

  AutoCompleteCellType.prototype.getEditorValue = function (editorContext, context) {
    return editorContext.children[1].value;
  };

  AutoCompleteCellType.prototype.setEditorValue = function (editorContext, value) {
    editorContext.children[1].value = value;
  };

  AutoCompleteCellType.prototype.getHitInfo = function (x, y, row, col, cellStyle, cellRect, sheetArea) {
    return { x: x, y: y, row: row, col: col, cellStyle: cellStyle, cellRect: cellRect, sheetArea: sheetArea };
  };

  AutoCompleteCellType.prototype.processMouseEnter = function (hitinfo){
    processCellMouseEnter(hitinfo);
  };

  AutoCompleteCellType.prototype.processMouseLeave = function (hitinfo) {
    processCellMouseLeave(hitinfo);
  };

  function CustomTextCellType(){ }

  CustomTextCellType.prototype = new $.wijmo.wijspread.TextCellType();

  CustomTextCellType.prototype.getHitInfo = function (x, y, row, col, cellStyle, cellRect, sheetArea) {
    return { x: x, y: y, row: row, col: col, cellStyle: cellStyle, cellRect: cellRect, sheetArea: sheetArea };
  };

  CustomTextCellType.prototype.processMouseEnter = function (hitinfo){
    processCellMouseEnter(hitinfo);
  };

  CustomTextCellType.prototype.processMouseLeave = function (hitinfo) {
    processCellMouseLeave(hitinfo);
  };

  function processCellMouseEnter(hitinfo){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var match = false;
    //console.log("row: " + $scope.validationErrorActiveCell.row + " col: " + $scope.validationErrorActiveCell.col);
    //console.log("hit row: " + hitinfo.cellStyle.row + " hit col: " + hitinfo.cellStyle.col);
    for (var i = 0; i < $scope.validationErrorCells.length; i++){
      if ($scope.validationErrorCells[i].row == hitinfo.cellStyle.row && $scope.validationErrorCells[i].col == hitinfo.cellStyle.col && ($scope.validationErrorActiveCell.row != hitinfo.cellStyle.row || $scope.validationErrorActiveCell.col != hitinfo.cellStyle.col)) {
        match = true;
        $scope.validationErrorCells[i].mouseActive = true;
        setTimeout(function(){
          if (match && $scope.validationErrorCells[i].mouseActive) {
            $scope.toggleValidationFixContainer(true);
            $scope.initialValidationFixLoad = true;
            fixValidationErrorsFunc(hitinfo.cellStyle.row, hitinfo.cellStyle.col);
          }
        },400);
        break;
      }
    }
    if (!match){
      for (var i = 0; i < $scope.validationWarningCells.length; i++){
        if ($scope.validationWarningCells[i].row == hitinfo.cellStyle.row && $scope.validationWarningCells[i].col == hitinfo.cellStyle.col && ($scope.validationErrorActiveCell.row != hitinfo.cellStyle.row || $scope.validationErrorActiveCell.col != hitinfo.cellStyle.col)) {
          match = true;
          $scope.validationWarningCells[i].mouseActive = true;
          setTimeout(function(){
            if (match && $scope.validationWarningCells[i].mouseActive) {
              $scope.validationWarningActiveCell = $scope.validationWarningCells[i];
              $scope.toggleValidationWarningContainer(true);
              $scope.initialValidationFixLoad = true;
              setTimeout(function() {
                var elementStyle = document.getElementById("validationWarningContainerId").style;
                if (hitinfo.col.x <450) elementStyle.left = (hitinfo.col.x+hitinfo.col.width+30) + "px";
                else elementStyle.left = (hitinfo.col.x-475) + "px";
                elementStyle.top = hitinfo.col.y + "px";
                elementStyle.visibility = "visible";
              }, 10);
            }
          },400);
          break;
        }
      }
    }
  }

  function processCellMouseLeave(hitinfo){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    for (var i = 0; i < $scope.validationErrorCells.length; i++) {
      if ($scope.validationErrorCells[i].row == hitinfo.cellStyle.row && $scope.validationErrorCells[i].col == hitinfo.cellStyle.col) {
        $scope.validationErrorCells[i].mouseActive = false;
      }
    }
    for (var i = 0; i < $scope.validationWarningCells.length; i++) {
      if ($scope.validationWarningCells[i].row == hitinfo.cellStyle.row && $scope.validationWarningCells[i].col == hitinfo.cellStyle.col) {
        $scope.validationWarningCells[i].mouseActive = false;
      }
    }
  }

  /*** End Custom Cell Types ***/

  function initSpread(dataSource, colDefs) {
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    $scope.prepareData(dataSource, colDefs);
    $scope.showSpread = true;
    var spread = $("#ss").wijspread("spread");
    spread.showVerticalScrollbar = true;
    var sheet = spread.getActiveSheet();
    $scope.spreadSheet = sheet;
    sheet.isPaintSuspended(true);
    sheet.setDataSource(dataSource);
    sheet.bindColumns(colDefs);
    sheet.canUserDragFill(false);
    sheet.canUserDragDrop(false);
    sheet.defaults.rowHeight = 30;
    for (var i = 0; i < sheet.getColumnCount(); i++) {
      sheet.getColumn(i).
        hAlign($.wijmo.wijspread.HorizontalAlign.center).
        vAlign($.wijmo.wijspread.VerticalAlign.center);
    }

    for (var i = 0; i < colDefs.length; i++){
      sheet.getColumn(i).locked(colDefs[i].readOnly);
      sheet.isProtected = true;
      spread.isProtected = true;
    }
    addBlankRows(40);
    sheet.isPaintSuspended(false);

    spread.bind($.wijmo.wijspread.Events.DragDropBlock, function (e, info) {
      console.log(e, info);
    });

    spread.bind($.wijmo.wijspread.Events.DragFillBlock, function (e, info) {
      console.log(e, info);
    });

    spread.bind($.wijmo.wijspread.Events.EnterCell, function (e, info) {
      if (!$.isEmptyObject(dataSource[info.row])) {
        if (colDefs[info.col].onEnterFunc != undefined && colDefs[info.col].onEnterFunc.length > 0)
          colDefs[info.col].onEnterFunc(dataSource[info.row]);
      }
    });

    spread.bind($.wijmo.wijspread.Events.EditStarted, function (e, info) {
      if ($scope.showValidationFixContainer) {
        if ($scope.initialValidationFixLoad) {
          $scope.closeValidationFix(false, false);
          $scope.initialValidationFixLoad = false;
        }
        else $scope.closeValidationFix(false, true);
      }
    });

    spread.bind($.wijmo.wijspread.Events.LeaveCell, function (e, info) {
      //console.log("leave cell",info);
      colDefs = $scope.spreadCols;
      if (info.col != -1 && info.row != -1) {
        if (info.col == (sheet.getColumnCount() - 1) && info.row == (sheet.getRowCount() - 1) && ($scope.allowNewRows == undefined || $scope.allowNewRows)) {
          sheet.addRows(sheet.getRowCount(), 1); //add column if tabbing out of last cell in sheet
          $scope.placements[$scope.placements.length - 1] = angular.copy($scope.newPlacement);
        }
        if (colDefs[info.col].type == "date") {
          var cell = sheet.getCell(info.row, info.col, $.wijmo.wijspread.SheetArea.viewport);

          var dateText = $('textarea[gcuielement=gcEditingInput]').val();
          var shortDatePattern = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}$/;
          if(shortDatePattern.test(dateText))
          {
            var splitter = /\./.test(dateText)? '.' : /\//.test(dateText)? '/' : '-';
            dateText = dateText.split(splitter);
            dateText = dateText[0] + splitter + dateText[1] + splitter + "20" + dateText[2] ;
            $('textarea[gcuielement=gcEditingInput]').val(dateText);
          }

          cell.formatter("MM/dd/yyyy");
        }
        $scope.validationProgress['inProgress'] = true;
        validateRows(info.row + 1, 1, sheet, dataSource, colDefs, false, info.col);
        if (colDefs[info.col].validationPair != undefined && colDefs[info.col].validationPair.length > 0) {
          for (var j = 0; j < colDefs[info.col].validationPair.length; j++) {
            var colPair = colDefs[info.col].validationPair[j];
            for (var i = 0; i < colDefs.length; i++) {
              if (colDefs[i].name == colPair) {
                validateRows(info.row + 1, 1, sheet, dataSource, colDefs, false, i);
                break;
              }
            }
          }
        }
      }
    });

    spread.bind($.wijmo.wijspread.Events.EditEnded, function (e, info) {
      validateRows(info.row+1, 1, sheet, dataSource, colDefs, false, info.col, true);
      if (colDefs[info.col].validationPair != undefined && colDefs[info.col].validationPair.length > 0){
        for (var j = 0; j < colDefs[info.col].validationPair.length; j++) {
          var colPair = colDefs[info.col].validationPair[j];
          for (var i = 0; i < colDefs.length; i++) {
            if (colDefs[i].name == colPair) {
              validateRows(info.row + 1, 1, sheet, dataSource, colDefs, false, i);
              break;
            }
          }
        }
      }
    });

    spread.bind($.wijmo.wijspread.Events.CellChanged, function (event, cellInfo) {
      if (cellInfo.propertyName == "value") {
        if (colDefs[cellInfo.col].addNewFunc != undefined && typeof colDefs[cellInfo.col].addNewFunc == 'function') {
          var cellValue = fetchFromObject(dataSource[cellInfo.row], colDefs[cellInfo.col].name);
          if (cellValue.indexOf ("Add New") >= 0) colDefs[cellInfo.col].addNewFunc(dataSource[cellInfo.row], cellInfo._oldValue, cellInfo.row);
        }
        if (colDefs[cellInfo.col].onChangeFunc != undefined && typeof colDefs[cellInfo.col].onChangeFunc == 'function') {
          colDefs[cellInfo.col].onChangeFunc(dataSource[cellInfo.row], cellInfo._oldValue, cellInfo.row);
        }
      }
    });

    spread.bind($.wijmo.wijspread.Events.InvalidOperation, function (e, info) {
      console.log(e, info);
    });

    spread.bind($.wijmo.wijspread.Events.SelectionChanged, function (e, info) {
      var selectedRanges = sheet.getSelections().toArray();
      var rowNums = "";
      $scope.selectedRows.length = 0;
      $scope.firstSelectedRowIndex = -1;
      $scope.selectedRowIndexes.length =0;
      for(var i = 0; i < selectedRanges.length; i++){
        for (var j = 0; j < selectedRanges[i].rowCount; j++){
          var rowIndex = selectedRanges[i].row + j;
          if (rowIndex == -1 || rowIndex < $scope.firstSelectedRowIndex) $scope.firstSelectedRowIndex = rowIndex;
          if (rowNums.indexOf("-" + rowIndex + "-") < 0) {
            $scope.selectedRows.push(dataSource[rowIndex]);
            $scope.selectedRowIndexes.push(rowIndex);
          }
          rowNums = rowNums + "-" + rowIndex + "-";
        }
      }
    });

    spread.bind($.wijmo.wijspread.Events.TopRowChanged, function (sender, args) {
      if (args.newTopRow > args.oldTopRow && args.newTopRow > $scope.placements.length - 11) {
        addBlankRows(20);
      }
    });

    document.addEventListener("paste", function (e) {
      var pastedText = undefined;
      if (window.clipboardData && window.clipboardData.getData) { // IE
        pastedText = window.clipboardData.getData('Text');
      } else if (e.clipboardData && e.clipboardData.getData) {
        pastedText = e.clipboardData.getData('text/plain');
      }
      var rows = pastedText.split(/\r\n|\r|\n/);
      var pastedRows = rows.length - 1;
      $scope.pastedColsOnly = rows[0].split("\t").length < colDefs.length ? true : false;
      var active_ri = sheet.getActiveRowIndex();
      var active_col = 0;
      var remainingRows = sheet.getRowCount() - (active_ri + 1);
      if ($scope.pastedColsOnly) {
        active_col = sheet.getActiveColumnIndex();
      }
      var newRows = [];
      for (var i = 0; i < rows.length; i++){
        if (rows[i] != "") {
          var placement = angular.copy($scope.newPlacement);
          var cols = rows[i].split("\t");
          for (var j = 0; j < cols.length; j++) {
            assignValue(placement, $scope.spreadCols[j + active_col].name, cols[j]);
          }
          placement.isNew = false;
          newRows.push(placement);
        }
      }
      $scope.copyRows = newRows;
      pasteRowsFunc(active_col, cols.length);
    });

    spread.bind($.wijmo.wijspread.Events.ClipboardPasting, function (sender, args) {
      //cancel the default pasting behavior; we handle the paste ourselves in paste rows function
      args.cancel = true;
      args.cellRange = null;
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

  function validateRows(startRow, numRowsToValidate, sheet, dataSource, colDefs, saveData, colNum, isDirty){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var rowValidationError = 0;
    for (var i = 0; i < numRowsToValidate; i++){
      var rowIndex = startRow == 0 ? startRow : (startRow + i) - 1;
      var startExec = new Date();
      var row = dataSource[rowIndex];
      if (isDirty) {row['isDirty'] = true; row['isNew'] = false;}
      if (!$.isEmptyObject(row) && (row.isDeleted == undefined || row.isDeleted == false) && (row.isNew == undefined || row.isNew == false)) {
        var rowValid = true;
        var rowWarning = false;
        var cStart = colNum != undefined ? colNum : 0;
        var indexLen = colNum != undefined ? colNum + 1 : colDefs.length;
        for (var c = cStart; c < indexLen; c++) {
          var startColExec = new Date();
          var col = colDefs[c];
          if (col.validator != undefined && col.validator.length > 0) {
            var result = col.validator(row, rowIndex, dataSource, col);
            if (!result.isValid) {
              var cell = sheet.getCell(rowIndex, c, $.wijmo.wijspread.SheetArea.viewport);
              var line = new $.wijmo.wijspread.LineBorder("Red", $.wijmo.wijspread.LineStyle.medium);
              cell.borderRight(line);
              cell.borderLeft(line);
              cell.borderTop(line);
              cell.borderBottom(line);
              /*var comment = new $.wijmo.wijspread.Comment();
              comment.text(result.message);
              sheet.setComment(rowIndex, c, comment);*/
              rowValid = false;
              row['row_hasAlert'] = true;
              var inValErrList = false;
              for (var ve = 0; ve < $scope.validationErrorCells.length; ve++) {
                if ($scope.validationErrorCells[ve].row == rowIndex && $scope.validationErrorCells[ve].col == c) inValErrList = true;
              }
              if (!inValErrList) $scope.validationErrorCells.push({row: rowIndex, col: c, message: result.message});
            }
            else if (result.hasWarning) {
              var cell = sheet.getCell(rowIndex, c, $.wijmo.wijspread.SheetArea.viewport);
              var line = new $.wijmo.wijspread.LineBorder("Yellow", $.wijmo.wijspread.LineStyle.medium);
              cell.borderRight(line);
              cell.borderLeft(line);
              cell.borderTop(line);
              cell.borderBottom(line);
              /*var comment = new $.wijmo.wijspread.Comment();
              comment.text(result.message);
              sheet.setComment(rowIndex, c, comment);*/
              var inValWarningList = false;
              for (var vw = 0; vw < $scope.validationWarningCells.length; vw++){
                if ($scope.validationWarningCells[vw].row == rowIndex && $scope.validationWarningCells[vw].col == c) inValWarningList = true;
              }
              if (!inValWarningList) $scope.validationWarningCells.push({row: rowIndex, col: c, message: result.message});
              row['row_hasAlert'] = true;
              rowWarning = true;
              var remove = [];
              for (var ve = 0; ve < $scope.validationErrorCells.length; ve++) {
                if ($scope.validationErrorCells[ve].row == rowIndex && $scope.validationErrorCells[ve].col == c)
                  remove.push(ve);
              }
              for (var rem = 0; rem < remove.length; rem++) {
                $scope.validationErrorCells.splice(remove[rem], 1);
              }
            }
            else {
              if (colNum > 0 || (row.row_hasAlert != undefined && row.row_hasAlert)) {
                var cell = sheet.getCell((startRow + i) - 1, c, $.wijmo.wijspread.SheetArea.viewport);
                cell.borderRight(null);
                cell.borderLeft(null);
                cell.borderTop(null);
                cell.borderBottom(null);
                sheet.setComment(rowIndex, c, null);
              }
              var remove = [];
              for (var ve = 0; ve < $scope.validationErrorCells.length; ve++) {
                if ($scope.validationErrorCells[ve].row == rowIndex && $scope.validationErrorCells[ve].col == c)
                  remove.push(ve);
              }
              for (var rem = 0; rem < remove.length; rem++) {
                $scope.validationErrorCells.splice(remove[rem], 1);
              }
              remove.length = 0;
              for (var ve = 0; ve < $scope.validationWarningCells.length; ve++) {
                if ($scope.validationWarningCells[ve].row == rowIndex && $scope.validationWarningCells[ve].col == c)
                  remove.push(ve);
              }
              for (var rem = 0; rem < remove.length; rem++) {
                $scope.validationWarningCells.splice(remove[rem], 1);
              }
            }
          }
        }
        row['row_isValid'] = rowValid;
        if (rowValid && !rowWarning) row['row_hasAlert'] = false;
        if (rowValid) $scope.validationSuccessCount++;
        else if (!rowValid) $scope.validationErrorCount++;
        if (rowWarning) $scope.validationWarningCount++;
      }
    }
  }

  function initializeModalAutoComplete(multi, list, storeObj, element){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var dataSource = list;
    if (!multi){
      var anType = typeof $scope.validationFixColDef.addNewFunc;
      var supportsAddNew = anType == 'function' ? true : false;
      $("#"+element).autocomplete({
        minLength: 0,
        source: dataSource,
        messages: {
          noResults: '',
          results: function() {}
        },
        select: function( event, ui ) {
          storeObj = ui.item.value;
          $scope.validationFixInputVal.theValue = ui.item.value;
          $("#"+element).blur();
        }
      }).on('focus', function(event) {
        $(this).autocomplete("search", "");
      }).on('autocompletechange',function(event){
        if (supportsAddNew) {
          var inList = false;
          for (var i = 0; i < dataSource.length; i++){
            if (dataSource[i] == this.value) {inList = true; break;}
          }
          if (!inList) {
            this.value = "Add New: " + this.value;
            storeObj = this.value;
          }
        }
      }).val('').data('autocomplete');
    }
    else {
      $("#"+element).bind("keydown", function (event) {
        if (event.keyCode === $.ui.keyCode.TAB) {
          event.preventDefault();
        }
      }).autocomplete({
        minLength: 0,
        source: function (request, response) {
          response($.ui.autocomplete.filter(
            dataSource, extractLast(request.term)));
        },
        focus: function( event, ui ) {
          var items = this.value.split(',');
          var alreadyInList = false;
          for (var i = 0; i < items.length; i++){
            if (items[i].trim() == ui.item.value) alreadyInList = true;
          }
          if (this.value == "") this.value = ui.item.value;
          else if (!alreadyInList)
            if (this.value.trim().indexOf(',') > -1) this.value = this.value + ui.item.value;
            else {
              this.value = ui.item.value;
            }
          return false;
        },
        select: function( event, ui ) {
          storeObj = this.value;
          return false;
        },
        messages: {
          noResults: '',
          results: function() {}
        }
      }).on('focus', function(event) {
        $(this).autocomplete("search", "");
      }).val('').data('autocomplete');
    }
  }

  function fixValidationErrorsFunc(row, col) {
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    if (row == undefined || col == undefined){
      if ($scope.validationErrorCells.length == 0) return;
      $scope.validationErrorCells.sort(function (a, b) {
        return a.row - b.row || a.col - b.col;
      });
      row = $scope.validationErrorCells[0].row;
      col = $scope.validationErrorCells[0].col;
    }
    $scope.validationErrorActiveCell.row = row;
    $scope.validationErrorActiveCell.col = col;
    for (var i = 0; i < $scope.validationErrorCells.length; i++){
      if ($scope.validationErrorCells[i].row == row && $scope.validationErrorCells[i].col == col){
        $scope.validationErrorActiveCell.message = $scope.validationErrorCells[i].message != undefined ? $scope.validationErrorCells[i].message : '';
      }
    }
    $scope.validationFixColDef = $scope.spreadCols[col];
    $scope.spreadSheet.setActiveCell(row, col);
    $scope.spreadSheet.startEdit();
    $scope.spreadSheet.endEdit();
    var cellRect = $scope.spreadSheet.getCellRect(row, col);
    $scope.toggleValidationFixContainer(true);
    setTimeout(function() {
      var element = document.getElementById("validationFixContainerId");
      if(element)
      {
        var elementStyle = element.style;
        if (cellRect.x <450) elementStyle.left = (cellRect.x+cellRect.width+30) + "px";
        else elementStyle.left = (cellRect.x-475) + "px";
        elementStyle.top = cellRect.y + "px";
        elementStyle.visibility = "visible";
        if (typeof $scope.validationFixColDef.validationFixPrepare == 'function') $scope.validationFixColDef.validationFixPrepare(row, col, $scope.validationFixColDef);
        else {
          if ($scope.validationFixColDef.type == "autoComplete") initializeModalAutoComplete(false, $scope.validationFixColDef.list, $scope.validationFixInputVal.theValue, 'modalAutoComplete');
          if ($scope.validationFixColDef.type == "multiAutoComplete") initializeModalAutoComplete(true, $scope.validationFixColDef.list, $scope.validationFixInputVal.theValue, 'modalAutoComplete');
          if ($scope.validationFixColDef.type == "combo") initializeModalAutoComplete(false, $scope.validationFixColDef.list, $scope.validationFixInputVal.theValue, 'modalAutoComplete');
        }
      }
    }, 10);
  }

  function moveToNextError (fix, close){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    if (fix){
      var errorValue = $scope.spreadSheet.getValue($scope.validationErrorActiveCell.row,$scope.validationErrorActiveCell.col);
      var rowsToSetAndValidate = [];
      rowsToSetAndValidate.push($scope.validationErrorActiveCell.row);

      if ($scope.validationFixSimilar){
        for (var i = 0; i < $scope.validationErrorCells.length; i++) {
          if ($scope.validationErrorCells[i].col == $scope.validationErrorActiveCell.col && $scope.validationErrorCells[i].row != $scope.validationErrorActiveCell.row){
            var row = $scope.sheetData[$scope.validationErrorCells[i].row];
            if (fetchFromObject(row,$scope.validationFixColDef.name) == errorValue) {
              if ($scope.validationFixColDef.name == "siteName")
                rowsToSetAndValidate.push($scope.validationErrorCells[i].row);
              /*if ($scope.validationFixColDef.name == "contactNames" && row.siteName == $scope.placements[$scope.validationErrorActiveCell.row].siteName)
               rowsToSetAndValidate.push($scope.validationErrorCells[i].row);*/
              if ($scope.validationFixColDef.name == "siteSectionName" && row.siteSectionName == $scope.sheetData[$scope.validationErrorActiveCell.row].siteSectionName)
                rowsToSetAndValidate.push($scope.validationErrorCells[i].row);
              if ($scope.validationFixColDef.name == "servingAndCostData.mediaServingData.startDate" && row.servingAndCostData.mediaServingData.endDate == $scope.sheetData[$scope.validationErrorActiveCell.row].servingAndCostData.mediaServingData.endDate)
                rowsToSetAndValidate.push($scope.validationErrorCells[i].row);
              if ($scope.validationFixColDef.name == "servingAndCostData.mediaServingData.endDate" && row.servingAndCostData.mediaServingData.startDate == $scope.sheetData[$scope.validationErrorActiveCell.row].servingAndCostData.mediaServingData.startDate)
                rowsToSetAndValidate.push($scope.validationErrorCells[i].row);
            }
          }
        }
      }
      $scope.spreadSheet.isPaintSuspended(true);
      for (var i = 0; i < rowsToSetAndValidate.length; i++){
        if (typeof $scope.validationFixColDef.validationFixSave == 'function') $scope.validationFixColDef.validationFixSave(rowsToSetAndValidate[i], $scope.validationErrorActiveCell.col, $scope.validationFixColDef);
        else $scope.spreadSheet.setValue(rowsToSetAndValidate[i],$scope.validationErrorActiveCell.col, $scope.validationFixInputVal.theValue);
        if ((typeof $scope.validationFixColDef.validator) == 'function') {
          validateRows(rowsToSetAndValidate[i]+1, 1, $scope.spreadSheet, $scope.sheetData, $scope.spreadCols, false, $scope.validationErrorActiveCell.col);
          if ($scope.validationFixColDef.validationPair != undefined && $scope.validationFixColDef.validationPair.length > 0){
            for (var c = 0; c < $scope.validationFixColDef.validationPair.length; c++) {
              for (var s = 0; s < $scope.spreadCols.length; s++) {
                if ($scope.spreadCols[s].name == $scope.validationFixColDef.validationPair[c]) {
                  if ((typeof $scope.spreadCols[s].validator) == 'function') {
                    validateRows(rowsToSetAndValidate[i]+1, 1, $scope.spreadSheet, $scope.sheetData, $scope.spreadCols, false, s);
                  }
                  break;
                }
              }
            }
          }
          /*$scope.spreadSheet.setActiveCell(rowsToSetAndValidate[i], $scope.validationErrorActiveCell.col);
          $scope.spreadSheet.startEdit();
          $scope.spreadSheet.endEdit();*/
        }
      }
      $scope.spreadSheet.isPaintSuspended(false);
      $scope.validationFixInputVal.theValue = "";
    }

    if (close || $scope.validationErrorCells.length < 1){
      $scope.toggleValidationFixContainer(false, true);
    }
    else {
      $scope.validationErrorCells.sort(function (a, b) {
        return a.row - b.row || a.col - b.col;
      });
      var nextRow = -1;
      var nextCol = -1;
      for (var i = 0; i < $scope.validationErrorCells.length; i++) {
        if ($scope.validationErrorCells[i].row == $scope.validationErrorActiveCell.row && $scope.validationErrorCells[i].col > $scope.validationErrorActiveCell.col) {
          nextRow = $scope.validationErrorCells[i].row;
          nextCol = $scope.validationErrorCells[i].col;
          break;
        }
        else if (nextRow == -1 && ($scope.validationErrorActiveCell.row != $scope.validationErrorCells[i].row || $scope.validationErrorActiveCell.col != $scope.validationErrorCells[i].col)) {
          nextRow = $scope.validationErrorCells[i].row;
          nextCol = $scope.validationErrorCells[i].col;
        }
        else if (nextRow <= $scope.validationErrorCells[i].row && nextCol > $scope.validationErrorCells[i].col) {
          nextRow = $scope.validationErrorCells[i].row;
          nextCol = $scope.validationErrorCells[i].col;
        }
      }
      if (nextRow == -1 && nextCol == -1) $scope.toggleValidationFixContainer(false, true);
      else fixValidationErrorsFunc(nextRow, nextCol);
    }
  }

  function fetchFromObject(obj, prop){
    if(typeof obj === 'undefined') return false;
    var _index = prop.indexOf('.')
    if(_index > -1){
      return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index+1));
    }
    return obj[prop];
  }

  function sortNumber(a,b) {
    return b - a;
  }

  function clearRowsFunc(){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    for (var i = 0; i <$scope.selectedRowIndexes.length; i++){
      if ($scope.sheetData[$scope.selectedRowIndexes[i]].id != ""){
        $scope.toggleConfirmDeleteContainer(true);
        return;
      }
    }
    removeRows();
  }

  function removeRows(){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var errorRowsToRemove = [];
    for (var i = 0; i <$scope.selectedRowIndexes.length; i++){
      if ($scope.sheetData[$scope.selectedRowIndexes[i]].id != null) $scope.idsToDelete.push($scope.placements[$scope.selectedRowIndexes[i]].id);
    }
    $scope.selectedRowIndexes.sort(sortNumber);
    $scope.spreadSheet.isPaintSuspended(true);
    for (var i = 0; i <$scope.selectedRowIndexes.length; i++){
      for (var c = 0; c < $scope.spreadCols.length; c++){
        var cell = $scope.spreadSheet.getCell($scope.selectedRowIndexes[i], c, $.wijmo.wijspread.SheetArea.viewport);
        cell.borderRight(null);
        cell.borderLeft(null);
        cell.borderTop(null);
        cell.borderBottom(null);
        $scope.spreadSheet.setComment($scope.selectedRowIndexes[i], c, null);
      }
      if ($scope.sheetData[$scope.selectedRowIndexes[i]].id != null && $scope.sheetData[$scope.selectedRowIndexes[i]].id != "") {
        $scope.spreadSheet.getCells($scope.selectedRowIndexes[i], 0, $scope.selectedRowIndexes[i], $scope.spreadCols.length - 1, $.wijmo.wijspread.SheetArea.viewport).textDecoration($.wijmo.wijspread.TextDecorationType.LineThrough);
        $scope.sheetData[$scope.selectedRowIndexes[i]]['isDeleted'] = true;
      }
      else
        $scope.spreadSheet.deleteRows($scope.selectedRowIndexes[i],1);
    }

    $scope.validationErrorCells.length = 0;
    $scope.validationWarningCells.length = 0;
    validateRows(1, $scope.sheetData.length, $scope.spreadSheet, $scope.sheetData, $scope.spreadCols, false);
    $scope.spreadSheet.isPaintSuspended(false);
    $scope.selectedRowIndexes.length = 0;
  }

  function pasteRowsFunc(startCol, numCols){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var active_ri = $scope.spreadSheet.getActiveRowIndex();
    var remainingRows = $scope.spreadSheet.getRowCount() - (active_ri + 1);
    $scope.spreadSheet.isPaintSuspended(true);
    if ( $scope.copyRows.length > remainingRows){
      var rowsToAdd = $scope.copyRows.length - (remainingRows > 0 ? remainingRows + 1 : 1);
      $scope.spreadSheet.addRows($scope.spreadSheet.getRowCount(), rowsToAdd);
    }
    if ($scope.selectedRowIndexes.length > $scope.copyRows.length){
      var copyRowsIndex = 0;
      var loopCnt = $scope.selectedRowIndexes.length - $scope.copyRows.length;
      for (var i = 0; i < loopCnt; i++){
        if (i > ($scope.copyRows.length - 1)) copyRowsIndex = 0;
        $scope.copyRows.push(angular.copy($scope.copyRows[copyRowsIndex]));
        copyRowsIndex++;
      }
    }
    for (var i = 0; i < $scope.copyRows.length; i++){
      for (var j = 0; j < $scope.sheetData.length; j++){
        if ($scope.sheetData[j].name == $scope.copyRows[i].name){
          $scope.copyRows[i].name = $scope.copyRows[i].name + "_" + (active_ri + i + 1);
        }
      }
      //if the target is not a new row just replace any copied columns
      if (!$scope.sheetData[active_ri + i].isNew && startCol != undefined && numCols != undefined){
        for (var j = 0; j < numCols; j++){
          var colName = $scope.spreadCols[j + startCol].name;
          assignValue($scope.sheetData[active_ri + i], colName, $scope.copyRows[i][colName]);
        }
      }
      else {
        $scope.sheetData[active_ri + i] = angular.copy($scope.copyRows[i]);
        $scope.sheetData[active_ri + i].id = "";
        $scope.sheetData[active_ri + i].status = "New";
        if (typeof $scope.sheetData[active_ri + i].servingAndCostData.mediaCostData.ignoreOverDelivery == 'string')
          $scope.sheetData[active_ri + i].servingAndCostData.mediaCostData.ignoreOverDelivery = $scope.sheetData[active_ri + i].servingAndCostData.mediaCostData.ignoreOverDelivery.toLowerCase();
      }
      //$scope.placements[$scope.placements.length-1].packageId = "";
      validateRows(active_ri + i + 1, 1, $scope.spreadSheet, $scope.sheetData, $scope.spreadCols, false);
      //run validation a second time to recheck after all the validation inter-dependencies have been run
      validateRows(active_ri + i + 1, 1, $scope.spreadSheet, $scope.sheetData, $scope.spreadCols, false);
      $scope.spreadSheet.setValue(active_ri + i,0,$scope.sheetData[active_ri + i].status);
    }
    $scope.spreadSheet.isPaintSuspended(false);
  }

  function addBlankRows(numRows){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    if ($scope.allowNewRows == undefined || $scope.allowNewRows) {
      numRows++;
      $scope.spreadSheet.isPaintSuspended(true);
      for (var i = 0; i < numRows; i++) {
        $scope.spreadSheet.addRows($scope.spreadSheet.getRowCount(), 1);
        $scope.sheetData[$scope.sheetData.length - 1] = angular.copy($scope.newSheetDataObject);
        $scope.sheetData[$scope.sheetData.length - 1].id = "";
        $scope.sheetData[$scope.sheetData.length - 1].packageId = "";
        $scope.spreadSheet.setValue($scope.spreadSheet.getRowCount() + 1 + i, 0, $scope.sheetData[$scope.sheetData.length - 1].status);
      }
      $scope.spreadSheet.isPaintSuspended(false);
    }
  }

  /****** Import Data  ****/
  function importCSVFile (evt, convertItemFunc){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    $scope.showImportOverlay = true;
    var file = evt.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        importFromTemplate(results.data, convertItemFunc);
        $scope.showImportOverlay = false;
        addBlankRows(20);
        $scope.$root.isDirtyEntity = true;
      }
    });
  }

  function importXLSXFile(evt, convertItemFunc) {
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    $scope.showImportOverlay = true;
    var file = evt.files[0];
    var reader = new FileReader();
    var name = file.name;
    reader.onload = function(e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {type: 'binary'});
      var result = {};
      var index = 0;
      workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if(roa.length > 0){
          result[index] = roa;
          index++;
        }
      });
      importFromTemplate(result[0], convertItemFunc);
      $scope.showImportOverlay = false;
      addBlankRows(20);
      $scope.$root.isDirtyEntity = true;
      $scope.spreadSheet.repaint();
    };
    reader.readAsBinaryString(file);
  }

  function importFromTemplate(data, convertItemFunc){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    for (var i = $scope.sheetData.length -1 ; i >= 0; i--){
      if ($scope.sheetData[i].isNew != undefined && $scope.sheetData[i].isNew)
        $scope.spreadSheet.deleteRows(i,1);
    }
    $scope.spreadSheet.isPaintSuspended(true);
    for (var i = 0; i < data.length; i++) {

      if(typeof data[i]["Ignore Over Delivery"] == "boolean"){
        data[i]["Ignore Over Delivery"] = data[i]["Ignore Over Delivery"]? "TRUE" : "";
      }
      else if(data[i]["Ignore Over Delivery"] == undefined || data[i]["Ignore Over Delivery"] == "" || (data[i]["Ignore Over Delivery"] && data[i]["Ignore Over Delivery"].toLowerCase() == "no"))
      {
        data[i]["Ignore Over Delivery"] = "";
      }
      else
      {
        data[i]["Ignore Over Delivery"] = "TRUE";
      }
      if (Object.keys(data[i]).length > 1) {
        var existing = false;
        for (var j = 0; j < $scope.sheetData.length; j++) {
          if (data[i].ID != undefined && data[i].ID != "" && data[i].ID == $scope.sheetData[j].id) {
            $scope.sheetData[j] = convertItemFunc($scope.sheetData[j], data[i]);
            existing = true;
            break;
          }
        }
        if (!existing) {
          var placement = convertItemFunc(angular.copy($scope.newSheetDataObject), data[i]);
          placement.isNew = false;
          if (!_.isEmpty(placement)) {
            $scope.spreadSheet.addRows($scope.spreadSheet.getRowCount(), 1);
            $scope.sheetData[$scope.sheetData.length - 1] = placement;
            validateRows($scope.sheetData.length, 1, $scope.spreadSheet, $scope.sheetData, $scope.spreadCols, false);
            $scope.spreadSheet.setValue($scope.spreadSheet.getRowCount() + 1 + i, 0, $scope.sheetData[$scope.sheetData.length - 1].status);
          }
        }
      }
    }
    $scope.spreadSheet.isPaintSuspended(false);
    $scope.spreadSheet.repaint();
  }

  /**** Export data ****/
  function exportToXLSX(worksheetName, fileName){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var ws_name = worksheetName;
    var wb = new Workbook();
    var ws = sheet_from_array($scope.sheetData);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
    var wbout = XLSX.write(wb,wopts);
    saveAs(new Blob([s2ab(wbout)],{type:""}), fileName);
  }

  function exportToCSV(fileName){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var data = $scope.sheetData;
    var header = angular.copy($scope.newSheetDataObject);
    header.isNew = false;
    var csv = "";
    for (var j = 0; j < $scope.spreadCols.length; j++){
      assignValue(header, $scope.spreadCols[j].name, $scope.spreadCols[j].displayName);
    }
    data.unshift(header);
    var exportItems = [];
    for (var i = 0; i < data.length; i++) {
      if (!data[i].isNew) {
        var item = {};
        for (var j = 0; j < $scope.spreadCols.length; j++) {
          var val = fetchFromObject(data[i], $scope.spreadCols[j].name);
          item[$scope.spreadCols[j].displayName] = val != undefined ? val : "";

          if($scope.spreadCols[j].displayName === "Ignore Over Delivery" && val !== "Ignore Over Delivery")
          {
            item[$scope.spreadCols[j].displayName] = val? "Yes" : "No";
          }
        }
        exportItems.push(item);
      }
    }

    var json = JSON.stringify(exportItems);
    var array = typeof json != 'object' ? JSON.parse(json) : json;
    var str = '';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ','
        line += array[i][index];
      }

      str += line + '\r\n';
    }
    data.shift(0);
    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
    exportItems.length = 0;
    array.length = 0;
    json = null;
  }

  function datenum(v, date1904) {
    if(date1904) v+=1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
  }

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  function Workbook() {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
  }

  function sheet_from_array(data, opts) {
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    var ws = {};
    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
    //build header row
    var header = angular.copy($scope.newSheetDataObject);
    header.isNew = false;
    for (var j = 0; j < $scope.spreadCols.length; j++){
      assignValue(header, $scope.spreadCols[j].name, $scope.spreadCols[j].displayName);
    }
    data.unshift(header);
    for(var R = 0; R != data.length; ++R) {
      if (!data[R].isNew) {
        //convert placement to array of properties
        var propArr = [];
        for (var i = 0; i < $scope.spreadCols.length; i++) {
          if ($scope.spreadCols[i].name.indexOf(".")) propArr.push(fetchFromObject(data[R], $scope.spreadCols[i].name));
          else propArr.push(data[R][$scope.spreadCols[i].name]);
        }
        for (var C = 0; C != propArr.length; ++C) {
          if (range.s.r > R) range.s.r = R;
          if (range.s.c > C) range.s.c = C;
          if (range.e.r < R) range.e.r = R;
          if (range.e.c < C) range.e.c = C;
          var cell = {v: propArr[C] };
          if (cell.v == null){
            if (C === 14) cell.v = false;
            else continue;
          }
          var cell_ref = XLSX.utils.encode_cell({c: C, r: R});

          /* TEST: proper cell types and value handling */
          if (typeof cell.v === 'number') cell.t = 'n';
          else if (typeof cell.v === 'boolean'){
            cell.t = 's';
            cell.v = cell.v? "Yes" : "No";
          }
          else if (cell.v instanceof Date) {
            cell.t = 't';
            cell.z = XLSX.SSF._table[14];
            cell.v = datenum(cell.v);
          }
          else cell.t = 's';
          ws[cell_ref] = cell;
        }
      }
    }
    if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    data.shift(0);
    return ws;
  }

  function assignValue(obj, prop, value) {
    if (typeof prop === "string")
      prop = prop.split(".");

    if (prop.length > 1) {
      var e = prop.shift();
      assignValue(obj[e] =
            Object.prototype.toString.call(obj[e]) === "[object Object]"
          ? obj[e]
          : {},
        prop,
        value);
    } else
      obj[prop[0]] = value;
  }

  function sortFunc(asc){
    var $scope = angular.element($(".spreadsheetEntity")).scope(),
        colCount = $scope.spreadSheet.getColumnCount(),
        rowCount = $scope.spreadSheet.getRowCount(),
        selectedRanges = $scope.spreadSheet.getSelections()[0];
    $scope.spreadSheet.sortRange(0, 0, rowCount, colCount, true, [{ index: selectedRanges.col, ascending: asc }]);
  }

  function turnFilterOn(){
    var $scope = angular.element($(".spreadsheetEntity")).scope(),
        selectedRanges = $scope.spreadSheet.getSelections()[0],
        rowsCount = $scope.spreadSheet.getRowCount(),
        filterRange = {row : -1, rowCount: rowsCount , col:selectedRanges.col , colCount:selectedRanges.colCount};
    $scope.spreadSheet.rowFilter(new $.wijmo.wijspread.HideRowFilter(filterRange));
  }

  function clearAllFilters(){
    var $scope = angular.element($(".spreadsheetEntity")).scope();
    $scope.spreadSheet.rowFilter(null);
  }

  return {
    colDef: colDef,
    buildColumns: buildColumns,
    initSpread: initSpread,
    validateRows: validateRows,
    initializeModalAutoComplete: initializeModalAutoComplete,
    fixValidationErrorsFunc: fixValidationErrorsFunc,
    moveToNextError: moveToNextError,
    clearRowsFunc: clearRowsFunc,
    removeRows: removeRows,
    addBlankRows: addBlankRows,
    exportToXLSX: exportToXLSX,
    exportToCSV: exportToCSV,
    importCSVFile: importCSVFile,
    importXLSXFile: importXLSXFile,
    clearAllFilters : clearAllFilters,
    turnFilterOn : turnFilterOn,
    sortFunc : sortFunc
  };

  /*function insertRowsFunc(){
   if ($scope.copyRows.length == 0) $scope.copyRows.push(angular.copy($scope.newPlacement));
   for (var i = 0; i < $scope.copyRows.length; i++){
   $scope.spreadSheet.addRows($scope.spreadSheet.getRowCount(), 1);
   $scope.placements[$scope.placements.length-1] = angular.copy($scope.copyRows[i]);
   $scope.placements[$scope.placements.length-1].id = "";
   $scope.placements[$scope.placements.length-1].packageId = "";
   $scope.validateRows($scope.placements.length, 1, $scope.spreadSheet, $scope.placements, $scope.spreadCols, false);
   $scope.spreadSheet.setValue($scope.spreadSheet.getRowCount() + 1 + i,0,$scope.placements[$scope.placements.length-1].status);
   }
   }*/

}]);

