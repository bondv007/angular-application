/*
 *
 * SpreadJS Library 3.20142.13
 * http://wijmo.com/
 *
 * Copyright(c) GrapeCity, Inc.  All rights reserved.
 *
 * Licensed under the Wijmo Commercial License. Also available under the GNU GPL Version 3 license.
 * licensing@wijmo.com
 * http://wijmo.com/widgets/license/
 *
 *
 **/
var m = angular.module("wijspread", []);
(function()
{
    function lineBorderConverter(stringValue)
    {
        if (!stringValue)
        {
            return undefined
        }
        stringValue = stringValue.trim();
        var parts;
        if (stringValue.indexOf(",") >= 0)
        {
            parts = stringValue.split(",")
        }
        else
        {
            parts = stringValue.split(" ")
        }
        var lineBorder = new $.wijmo.wijspread.LineBorder;
        lineBorder.color = parts[0].trim();
        if (parts.length > 1)
        {
            lineBorder.style = $.wijmo.wijspread.LineStyle[parts[1].trim()]
        }
        return lineBorder
    }
    function setValidator(style, validatorType, value)
    {
        if (!style || !validatorType)
        {
            return
        }
        validatorType = validatorType.toLowerCase();
        var validator;
        if (validatorType === "numbervalidator")
        {
            validator = $.wijmo.wijspread.DefaultDataValidator.createNumberValidator(value.comparisonOperator, value.value1, value.value2, value.isIntegervalue)
        }
        else if (validatorType === "datevalidator")
        {
            validator = $.wijmo.wijspread.DefaultDataValidator.createDateValidator(value.comparisonOperator, value.value1, value.value2)
        }
        else if (validatorType === "textlengthvalidator")
        {
            validator = $.wijmo.wijspread.DefaultDataValidator.createTextLengthValidator(value.comparisonOperator, value.value1, value.value2)
        }
        else if (validatorType === "formulavalidator")
        {
            validator = $.wijmo.wijspread.DefaultDataValidator.createFormulaValidator(value.formula)
        }
        else if (validatorType === "formulalistvalidator")
        {
            validator = $.wijmo.wijspread.DefaultDataValidator.createFormulaListValidator(value.formulaList)
        }
        else if (validatorType === "listvalidator")
        {
            validator = $.wijmo.wijspread.DefaultDataValidator.createListValidator(value.list)
        }
        if (validator)
        {
            if (value.ignoreBlank !== undefined)
            {
                validator.ignoreBlank = value.ignoreBlank
            }
            if (value.inCellDropdown !== undefined)
            {
                validator.inCellDropdown = value.inCellDropdown
            }
            if (value.showInputMessage !== undefined)
            {
                validator.showInputMessage = value.showInputMessage
            }
            if (value.showErrorMessage !== undefined)
            {
                validator.showErrorMessage = value.showErrorMessage
            }
            if (value.errorStyle !== undefined)
            {
                validator.errorStyle = value.errorStyle
            }
            if (value.inputMessage !== undefined)
            {
                validator.inputMessage = value.inputMessage
            }
            if (value.inputTitle !== undefined)
            {
                validator.inputTitle = value.inputTitle
            }
            if (value.errorMessage !== undefined)
            {
                validator.errorMessage = value.errorMessage
            }
            if (value.errorTitle !== undefined)
            {
                validator.errorTitle = value.errorTitle
            }
            style.validator = validator
        }
    }
    function setDataValidationResult(spread, name, value)
    {
        spread._angularDataValidationResult = value
    }
    function setComboboxItems(comboBoxCellType, itemType, value)
    {
        if (value.text === undefined && value.value === undefined)
        {
            return
        }
        if (value.text === undefined)
        {
            value.text = value.value
        }
        else if (value.value === undefined)
        {
            value.value = value.text
        }
        var items;
        if (!comboBoxCellType.items())
        {
            items = [];
            comboBoxCellType.items(items)
        }
        else
        {
            items = comboBoxCellType.items()
        }
        items.push(value)
    }
    function setSheetGroup(sheet, groupType, value)
    {
        if (groupType && value.groups)
        {
            groupType = groupType.toLowerCase().trim();
            angular.forEach(value.groups, function(groupInfo)
            {
                if (groupType === "rowrangegroup")
                {
                    sheet.rowRangeGroup.group(groupInfo.index, groupInfo.count)
                }
                else
                {
                    sheet.colRangeGroup.group(groupInfo.index, groupInfo.count)
                }
            })
        }
    }
    function addGroup(rangeGroup, groupType, value)
    {
        if (!rangeGroup.groups)
        {
            rangeGroup.groups = []
        }
        rangeGroup.groups.push(value)
    }
    function getCurrentTheme(sheet, property)
    {
        return sheet[property].call(sheet).name()
    }
    var styleDef = {
            backcolor: {
                type: "string", name: "backColor"
            }, forecolor: {
                    type: "string", name: "foreColor"
                }, halign: {
                    type: "enum, HorizontalAlign", name: "hAlign"
                }, valign: {
                    type: "enum, VerticalAlign", name: "vAlign"
                }, font: {
                    type: "string", name: "font"
                }, themefont: {
                    type: "string", name: "themeFont"
                }, formatter: {
                    type: "string", name: "formatter"
                }, border: {
                    type: "LineBordeer", name: "border", getProperties: ["borderLeft", "borderTop", "borderRight", "borderBottom"], setProperties: ["borderLeft", "borderTop", "borderRight", "borderBottom"], converter: lineBorderConverter
                }, borderleft: {
                    type: "LineBorder", name: "borderLeft", converter: lineBorderConverter
                }, bordertop: {
                    type: "LineBorder", name: "borderTop", converter: lineBorderConverter
                }, borderright: {
                    type: "LineBorder", name: "borderRight", converter: lineBorderConverter
                }, borderbottom: {
                    type: "LineBorder", name: "borderBottom", converter: lineBorderConverter
                }, locked: {
                    type: "boolean", name: "locked"
                }, wordwrap: {
                    type: "boolean", name: "wordWrap"
                }, textindent: {
                    type: "number", name: "textIndent"
                }, shrinktofit: {
                    type: "boolean", name: "shrinkToFit"
                }, backgroundimage: {
                    type: "string", name: "backgroundImage"
                }, backgroundimagelayout: {
                    type: "enum, ImageLayout", name: "backgroundImageLayout"
                }, numbervalidator: {
                    type: "object", name: "numberValidator", setFunction: setValidator, properties: {
                            comparisonoperator: {
                                type: "enum,ComparisonOperator", name: "comparisonOperator"
                            }, value1: {
                                    type: "string", name: "value1"
                                }, value2: {
                                    type: "string", name: "value2"
                                }, isintegervalue: {
                                    type: "boolean", name: "isIntegerValue"
                                }
                        }
                }, datevalidator: {
                    type: "object", name: "dateValidator", setFunction: setValidator, properties: {
                            comparisonoperator: {
                                type: "enum,ComparisonOperator", name: "comparisonOperator"
                            }, value1: {
                                    type: "string", name: "value1"
                                }, value2: {
                                    type: "string", name: "value2"
                                }
                        }
                }, textlengthvalidator: {
                    type: "object", name: "textLengthValidator", setFunction: setValidator, properties: {
                            comparisonoperator: {
                                type: "enum,ComparisonOperator", name: "comparisonOperator"
                            }, value1: {
                                    type: "string", name: "value1"
                                }, value2: {
                                    type: "string", name: "value2"
                                }
                        }
                }, formulavalidator: {
                    type: "object", name: "formulaValidator", setFunction: setValidator, properties: {formula: {
                                type: "string", name: "formula"
                            }}
                }, formulalistvalidator: {
                    type: "object", name: "formulaListValidator", setFunction: setValidator, properties: {formulalist: {
                                type: "string", name: "formulaList"
                            }}
                }, listvalidator: {
                    type: "object", name: "listValidator", setFunction: setValidator, properties: {list: {
                                type: "string", name: "list"
                            }}
                }, textcelltype: {
                    type: "TextCellType", name: "cellType", properties: {}
                }, buttoncelltype: {
                    type: "ButtonCellType", name: "cellType", properties: {
                            buttonbackcolor: {
                                type: "string", name: "buttonBackColor", setFunction: "buttonBackColor"
                            }, marginleft: {
                                    type: "number", name: "marginLeft", setFunction: "marginLeft"
                                }, margintop: {
                                    type: "number", name: "marginTop", setFunction: "marginTop"
                                }, marginright: {
                                    type: "number", name: "marginRight", setFunction: "marginRight"
                                }, marginbottom: {
                                    type: "number", name: "marginBottom", setFunction: "marginBottom"
                                }, text: {
                                    type: "string", name: "text", setFunction: "text"
                                }
                        }
                }, checkboxcelltype: {
                    type: "CheckBoxCellType", name: "cellType", properties: {
                            caption: {
                                type: "string", name: "caption", setFunction: "caption"
                            }, isthreestate: {
                                    type: "boolean", name: "isThreeState", setFunction: "isThreeState"
                                }, textalign: {
                                    type: "enum,CheckBoxTextAlign", name: "textAlign", setFunction: "textAlign"
                                }, textfalse: {
                                    type: "string", name: "textFalse", setFunction: "textFalse"
                                }, textindeterminate: {
                                    type: "string", name: "textIndeterminate", setFunction: "textIndeterminate"
                                }, texttrue: {
                                    type: "string", name: "textTrue", setFunction: "textTrue"
                                }
                        }
                }, comboboxcelltype: {
                    type: "ComboBoxCellType", name: "cellType", properties: {
                            editorvaluetype: {
                                type: "enum,EditorValueType", name: "editorValueType", setFunction: "editorValueType"
                            }, item: {
                                    type: "object", name: "items", setFunction: setComboboxItems, properties: {
                                            value: {
                                                type: "string", name: "value"
                                            }, text: {
                                                    type: "string", name: "text"
                                                }
                                        }
                                }
                        }
                }, hyperlinkcelltype: {
                    type: "HyperLinkCellType", name: "cellType", properties: {
                            linkcolor: {
                                type: "string", name: "linkColor", setFunction: "linkColor"
                            }, linktooltip: {
                                    type: "string", name: "linkToolTip", setFunction: "linkToolTip"
                                }, text: {
                                    type: "string", name: "text", setFunction: "text"
                                }, visitedlinkcolor: {
                                    type: "string", name: "visitedLinkColor", setFunction: "visitedLinkColor"
                                }
                        }
                }
        };
    var validators = ["numbervalidator", "datevalidator", "textlengthvalidator", "formulavalidator", "formulalistvalidator", "listvalidator"];
    for (var i = 0; i < validators.length; i++)
    {
        var validatorProperties = styleDef[validators[i]]["properties"];
        validatorProperties["ignoreblank"] = {
            type: "boolean", name: "ignoreBlank"
        };
        validatorProperties["incelldropdown"] = {
            type: "boolean", name: "inCellDropdown"
        };
        validatorProperties["showinputmessage"] = {
            type: "boolean", name: "showInputMessage"
        };
        validatorProperties["showerrormessage"] = {
            type: "boolean", name: "showErrorMessage"
        };
        validatorProperties["errorstyle"] = {
            type: "enum, ErrorStyle", name: "errorStyle"
        };
        validatorProperties["inputmessage"] = {
            type: "string", name: "inputMessage"
        };
        validatorProperties["inputtitle"] = {
            type: "string", name: "inputTitle"
        };
        validatorProperties["errormessage"] = {
            type: "string", name: "errorMessage"
        };
        validatorProperties["errortitle"] = {
            type: "string", name: "errorTitle"
        }
    }
    var groupDef = {group: {
                type: "object", name: "group", setFunction: addGroup, properties: {
                        index: {
                            type: "number", name: "index"
                        }, count: {
                                type: "number", name: "count"
                            }
                    }
            }};
    var spreadPropertyMap = {
            name: {
                type: "string", name: "name"
            }, usewijmotheme: {
                    type: "boolean", name: "useWijmoTheme"
                }, allowuserzoom: {
                    type: "boolean", name: "allowUserZoom", setFunction: "allowUserZoom", getFunction: "allowUserZoom"
                }, allowuserresize: {
                    type: "boolean", name: "allowUserResize", setFunction: "allowUserResize", getFunction: "allowUserResize"
                }, tabstripvisible: {
                    type: "boolean", name: "tabStripVisible", setFunction: "tabStripVisible", getFunction: "tabStripVisible"
                }, tabeditable: {
                    type: "boolean", name: "tabEditable", setFunction: "tabEditable", getFunction: "tabEditable"
                }, newtabvisible: {
                    type: "boolean", name: "newTabVisible", setFunction: "newTabVisible", getFunction: "newTabVisible"
                }, canusereditformula: {
                    type: "boolean", name: "canUserEditFormula", setFunction: "canUserEditFormula", getFunction: "canUserEditFormula"
                }, autofittype: {
                    type: "enum, AutoFitType", name: "autoFitType", setFunction: "autoFitType", getFunction: "autoFitType"
                }, canuserdragfill: {
                    type: "boolean", name: "canUserDragFill", setFunction: "canUserDragFill", getFunction: "canUserDragFill"
                }, canuserdragdrop: {
                    type: "boolean", name: "canUserDragDrop", setFunction: "canUserDragDrop", getFunction: "canUserDragDrop"
                }, highlightinvaliddata: {
                    type: "boolean", name: "highlightInvalidData", setFunction: "highlightInvalidData", getFunction: "highlightInvalidData"
                }, referencestyle: {
                    type: "enum, ReferenceStyle", name: "referenceStyle", setFunction: "referenceStyle", getFunction: "referenceStyle"
                }, backcolor: {
                    type: "string", name: "backColor", setFunction: "backColor", getFunction: "backColor"
                }, grayareabackcolor: {
                    type: "string", name: "grayAreaBackColor", setFunction: "grayAreaBackColor", getFunction: "grayAreaBackColor"
                }, backgroundimage: {
                    type: "string", name: "backgroundImage", setFunction: "backgroundImage", getFunction: "backgroundImage"
                }, backgroundimagelayout: {
                    type: "enum, ImageLayout", name: "backgroundImageLayout", setFunction: "backgroundImageLayout", getFunction: "backgroundImageLayout"
                }, showverticalscrollbar: {
                    type: "boolean", name: "showVerticalScrollbar", setFunction: "showVerticalScrollbar", getFunction: "showVerticalScrollbar"
                }, showhorizontalscrollbar: {
                    type: "boolean", name: "showHorizontalScrollbar", setFunction: "showHorizontalScrollbar", getFunction: "showHorizontalScrollbar"
                }, showscrolltip: {
                    type: "enum, ShowScrollTip", name: "showScrollTip", setFunction: "showScrollTip", getFunction: "showScrollTip"
                }, showresizetip: {
                    type: "enum, ShowResizeTip", name: "showResizeTip", setFunction: "showResizeTip", getFunction: "showResizeTip"
                }, showdragdroptip: {
                    type: "boolean", name: "showDragDropTip", setFunction: "showDragDropTip", getFunction: "showDragDropTip"
                }, showdragfilltip: {
                    type: "boolean", name: "showDragFillTip", setFunction: "showDragFillTip", getFunction: "showDragFillTip"
                }, datavalidationresult: {
                    type: "enum, DataValidationResult", name: "DataValidationResult", setFunction: setDataValidationResult
                }
        };
    var sheetPropertyMap = {
            name: {
                type: "string", name: "name", setFunction: "setName", getFunction: "getName"
            }, referencestyle: {
                    type: "enum, ReferenceStyle", name: "referenceStyle", setFunction: "referenceStyle", getFunction: "referenceStyle"
                }, frozentrailingcolumncount: {
                    type: "number", name: "frozenTrailingColumnCount", setFunction: "setFrozenTrailingColumnCount", getFunction: "getFrozenTrailingColumnCount"
                }, frozentrailingrowcount: {
                    type: "number", name: "frozenTrailingRowCount", setFunction: "setFrozenTrailingRowCount", getFunction: "getFrozenTrailingRowCount"
                }, frozencolumncount: {
                    type: "number", name: "frozenColumnCount", setFunction: "setFrozenColumnCount", getFunction: "getFrozenColumnCount"
                }, frozenrowcount: {
                    type: "number", name: "frozenRowCount", setFunction: "setFrozenRowCount", getFunction: "getFrozenRowCount"
                }, defaultstyle: {
                    type: "Style", name: "defaultStyle", setFunction: {
                            name: "setDefaultStyle", args: ["$value-replace$", $.wijmo.wijspread.SheetArea.viewport]
                        }, properties: styleDef
                }, rowheaderdefaultstyle: {
                    type: "Style", name: "rowHeaderDefaultStyle", setFunction: {
                            name: "setDefaultStyle", args: ["$value-replace$", $.wijmo.wijspread.SheetArea.rowHeader]
                        }, properties: styleDef
                }, columnheaderdefaultstyle: {
                    type: "Style", name: "columnHeaderDefaultStyle", setFunction: {
                            name: "setDefaultStyle", args: ["$value-replace$", $.wijmo.wijspread.SheetArea.colHeader]
                        }, properties: styleDef
                }, cornerheaderdefaultstyle: {
                    type: "Style", name: "cornerHeaderDefaultStyle", setFunction: {
                            name: "setDefaultStyle", args: ["$value-replace$", $.wijmo.wijspread.SheetArea.corner]
                        }, properties: styleDef
                }, allowcelloverflow: {
                    type: "boolean", name: "allowCellOverflow", setFunction: "allowCellOverflow", getFunction: "allowCellOverflow"
                }, frozenlinecolor: {
                    type: "string", name: "frozenlineColor", setFunction: "frozenlineColor", getFunction: "frozenlineColor"
                }, sheettabcolor: {
                    type: "string", name: "sheetTabColor", setFunction: "sheetTabColor", getFunction: "sheetTabColor"
                }, rowcount: {
                    type: "number", name: "rowCount", setFunction: "setRowCount", getFunction: "getRowCount"
                }, selectionpolicy: {
                    type: "enum, SelectionPolicy", name: "selectionPolicy", setFunction: "selectionPolicy", getFunction: "selectionPolicy"
                }, selectionunit: {
                    type: "enum,SelectionUnit", name: "selectionUnit", setFunction: "selectionUnit", getFunction: "selectionUnit"
                }, zoom: {
                    type: "number", name: "zoom", setFunction: "zoom", getFunction: "zoom"
                }, currenttheme: {
                    type: "string", name: "currentTheme", setFunction: "currentTheme", getFunction: getCurrentTheme
                }, clipboardoptions: {
                    type: "enum,ClipboardPasteOptions", name: "clipBoardOptions", setFunction: "clipBoardOptions", getFunction: "clipBoardOptions"
                }, canuserdragfill: {
                    type: "boolean", name: "canUserDragFill", setFunction: "canUserDragFill", getFunction: "canUserDragFill"
                }, canuserdragdrop: {
                    type: "boolean", name: "canUserDragDrop", setFunction: "canUserDragDrop", getFunction: "canUserDragDrop"
                }, rowheadervisible: {
                    type: "boolean", name: "rowHeaderVisible", setFunction: "setRowHeaderVisible", getFunction: "getRowHeaderVisible"
                }, columnheadervisible: {
                    type: "boolean", name: "columnHeaderVisible", setFunction: "setColumnHeaderVisible", getFunction: "getColumnHeaderVisible"
                }, rowheaderautotext: {
                    type: "enum, HeaderAutoText", name: "rowHeaderAutoText", setFunction: "setRowHeaderAutoText", getFunction: "getRowHeaderAutoText"
                }, columnheaderautotext: {
                    type: "enum, HeaderAutoText", name: "columnHeaderAutoText", setFunction: "setColumnHeaderAutoText", getFunction: "getColumnHeaderAutoText"
                }, rowheaderautotextindex: {
                    type: "number", name: "rowHeaderAutoTextIndex", setFunction: "setRowHeaderAutoTextIndex", getFunction: "getRowHeaderAutoTextIndex"
                }, columnheaderautotextindex: {
                    type: "number", name: "columnHeaderAutoTextIndex", setFunction: "setColumnHeaderAutoTextIndex", getFunction: "getColumnHeaderAutoTextIndex"
                }, isprotected: {
                    type: "boolean", name: "isProtected", setFunction: "setIsProtected", getFunction: "getIsProtected"
                }, showrowrangegroup: {
                    type: "boolean", name: "showRowRangeGroup", setFunction: "showRowRangeGroup", getFunction: "showRowRangeGroup"
                }, showcolumnrangegroup: {
                    type: "boolean", name: "showColumnRangeGroup", setFunction: "showColumnRangeGroup", getFunction: "showColumnRangeGroup"
                }, rowrangegroup: {
                    type: "object", name: "rowRangeGroup", setFunction: setSheetGroup, properties: groupDef
                }, colrangegroup: {
                    type: "object", name: "colRangeGroup", setFunction: setSheetGroup, properties: groupDef
                }, selectionbackcolor: {
                    type: "string", name: "selectionBackColor", setFunction: "selectionBackColor", getFunction: "selectionBackColor"
                }, selectionbordercolor: {
                    type: "string", name: "selectionBorderColor", setFunction: "selectionBorderColor", getFunction: "selectionBorderColor"
                }, datasourcedeepwatch: {
                    type: "boolean", name: "dataSourceDeepWatch"
                }
        };
    var columnPropertyMap = {
            datafield: {
                type: "string", name: "dataField"
            }, headertext: {
                    type: "string", name: "headerText"
                }, width: {
                    type: "number", name: "width", setFunction: "width", getFunction: "width"
                }, visible: {
                    type: "boolean", name: "visible", setFunction: "visible", getFunction: "visible"
                }, resizable: {
                    type: "boolean", name: "resizable", setFunction: "resizable", getFunction: "resizable"
                }, defaultstyle: {
                    type: "Style", name: "defaultStyle", setFunction: "defaultStyle", getFunction: "defaultStyle", properties: styleDef
                }
        };
    var Node;
    (function(Node)
    {
        Node._map = [];
        Node.ELEMENT_NODE = 1;
        Node.ATTRIBUTE_NODE = 2;
        Node.TEXT_NODE = 3;
        Node.CDATA_SECTION_NODE = 4;
        Node.ENTITY_REFERENCE_NODE = 5;
        Node.ENTITY_NODE = 6;
        Node.PROCESSING_INSTRUCTION_NODE = 7;
        Node.COMMENT_NODE = 8;
        Node.DOCUMENT_NODE = 9;
        Node.DOCUMENT_TYPE_NODE = 10;
        Node.DOCUMENT_FRAGMENT_NODE = 11;
        Node.NOTATION_NODE = 12
    })(Node || (Node = {}));
    var SpreadAngularManager;
    (function(SpreadAngularManager)
    {
        var ngMgr = SpreadAngularManager;
        SpreadAngularManager.setValuesAndBindings = function(scope)
        {
            if (ngMgr.valueCatch)
            {
                angular.forEach(ngMgr.valueCatch, function(catchObject)
                {
                    var target = catchObject.target;
                    angular.forEach(catchObject.setting, function(propertySet)
                    {
                        var nodeDef = propertySet.nodeDef;
                        var value = propertySet.value;
                        ngMgr.setPropertyValue(target, nodeDef, value)
                    })
                })
            }
            ;
            var parentScope = scope.$parent;
            if (ngMgr.bindings)
            {
                angular.forEach(ngMgr.bindings, function(attBinding)
                {
                    if (attBinding.dynamicText)
                    {
                        var bindingPath = attBinding.dynamicText.substring(2, attBinding.dynamicText.length - 2);
                        attBinding.target.bindingPath = bindingPath;
                        attBinding.target.parentScope = parentScope;
                        var bindingPathLowerCase = bindingPath;
                        if (parentScope[bindingPathLowerCase] === undefined)
                        {
                            parentScope[bindingPathLowerCase] = SpreadAngularManager.getPropertyValue(attBinding.target, attBinding.metadata)
                        }
                        else
                        {
                            ngMgr.setPropertyValue(attBinding.target, attBinding.metadata, parentScope[bindingPathLowerCase])
                        }
                        parentScope.$watch(bindingPath, function(value)
                        {
                            ngMgr.setPropertyValue(attBinding.target, attBinding.metadata, value)
                        })
                    }
                })
            }
            ;
        };
        SpreadAngularManager.initSpread = function(scope, element, attrs)
        {
            var node = element[0];
            ngMgr._readNodeWithChildren(scope, node, spreadPropertyMap, "sheets", false)
        };
        SpreadAngularManager.initSheet = function(scope, element, attrs)
        {
            var node = element[0];
            ngMgr._readNodeWithChildren(scope, node, sheetPropertyMap, "columns", false)
        };
        SpreadAngularManager.initColumn = function(scope, element, attrs)
        {
            var node = element[0];
            ngMgr._readNodeWithChildren(scope, node, columnPropertyMap, undefined, false)
        };
        SpreadAngularManager._readNodeWithChildren = function(target, node, map, excludeChildren, setValueDirectly)
        {
            if (!setValueDirectly)
            {
                if (!ngMgr.valueCatch)
                {
                    ngMgr.valueCatch = []
                }
                var catchObject;
                angular.forEach(ngMgr.valueCatch, function(catchTmp)
                {
                    if (catchTmp.target === target)
                    {
                        catchObject = catchTmp
                    }
                });
                if (!catchObject)
                {
                    catchObject = {
                        target: target, setting: []
                    };
                    ngMgr.valueCatch.push(catchObject)
                }
            }
            angular.forEach(node.attributes, function(attNode)
            {
                ngMgr._readNode(target, attNode, map, catchObject, setValueDirectly)
            });
            if (node.childNodes.length > 0)
            {
                angular.forEach(node.childNodes, function(childNode)
                {
                    var nodeName = childNode.nodeName.toLowerCase();
                    nodeName = ngMgr.normalizeName(nodeName);
                    if (excludeChildren && nodeName === excludeChildren)
                    {
                        return
                    }
                    var nodeDef = map[nodeName];
                    if (!nodeDef || !nodeDef.type)
                    {
                        return
                    }
                    var childTarget;
                    if (nodeDef.type === "object")
                    {
                        childTarget = {}
                    }
                    else
                    {
                        var type = $.wijmo.wijspread[nodeDef.type];
                        if (!type)
                        {
                            return
                        }
                        childTarget = new type
                    }
                    ngMgr._readNodeWithChildren(childTarget, childNode, nodeDef.properties, undefined, true);
                    if (setValueDirectly)
                    {
                        ngMgr.setPropertyValue(target, nodeDef, childTarget)
                    }
                    else
                    {
                        catchObject.setting.push({
                            nodeDef: nodeDef, value: childTarget
                        })
                    }
                })
            }
        };
        SpreadAngularManager.convertValue = function(value, targetType, converter)
        {
            if (converter)
            {
                return converter.call(null, value)
            }
            if (value === undefined || targetType === undefined)
            {
                return value
            }
            if (typeof value === "string")
            {
                value = value.trim()
            }
            if (targetType.length > 2 && targetType[0] === "[")
            {
                var argType = targetType.substring(1, targetType.length - 2);
                if (value.length > 2)
                {
                    if (value[0] === "[" && value[value.length - 1] === "]")
                    {
                        value = value.substring(1, value.length - 2)
                    }
                    var partsValue = value.split(",");
                    var result = [];
                    for (var i = 0; i < partsValue.length; i++)
                    {
                        result.push(ngMgr.convertValue(partsValue[i], argType, converter))
                    }
                    return result
                }
            }
            switch (targetType)
            {
                case"string":
                    return value;
                case"boolean":
                    if (typeof value === "boolean")
                    {
                        return value
                    }
                    if (value.toLowerCase() === "true")
                    {
                        return true
                    }
                    else if (value.toLowerCase() === "false")
                    {
                        return false
                    }
                    return Boolean(value);
                case"number":
                    return Number(value);
                case"color":
                    return value
            }
            if (targetType.length > 5 && targetType.substring(0, 5) === "enum,")
            {
                if (typeof value === "number" || typeof value === "string" && parseInt(value) !== undefined && !isNaN(parseInt(value)))
                {
                    result = parseInt(value)
                }
                else
                {
                    targetType = targetType.substring(5).trim();
                    var resultType = $.wijmo.wijspread;
                    if (targetType.indexOf(".") > 0)
                    {
                        var parts = name.split(".");
                        for (var i = 0; i < parts.length; i++)
                        {
                            resultType = result[parts[i]]
                        }
                    }
                    else
                    {
                        resultType = resultType[targetType]
                    }
                    result = resultType[value];
                    if (result === undefined)
                    {
                        value = value[0].toUpperCase() + value.substring(1);
                        result = resultType[value]
                    }
                }
                return result
            }
            return value
        };
        SpreadAngularManager.normalizeName = function(name)
        {
            if (name.match(/-/))
            {
                var parts = name.split("-");
                name = parts.shift();
                angular.forEach(parts, function(p)
                {
                    name += p
                })
            }
            return name
        };
        SpreadAngularManager._readNode = function(target, node, map, catchObject, setValueDirectly)
        {
            var $node = $(node),
                value,
                name,
                propPath;
            switch (node.nodeType)
            {
                case Node.ATTRIBUTE_NODE:
                    value = $node.val();
                    break;
                case Node.ELEMENT_NODE:
                    value = $node.text();
                    break;
                default:
                    return
            }
            name = node.nodeName || node.name;
            name = name.toLowerCase();
            name = ngMgr.normalizeName(name);
            var metadata = map[name];
            if (metadata)
            {
                name = metadata.name
            }
            else
            {
                return
            }
            if (!ngMgr.hasChildElements(node) && value && value.length > 4 && value.substring(0, 2) === "{{" && value.substring(value.length - 2) === "}}")
            {
                if (!ngMgr.bindings)
                {
                    ngMgr.bindings = []
                }
                ngMgr.bindings.push({
                    target: target, metadata: metadata, path: name, dynamicText: value
                });
                return
            }
            if (value.match(/^[^\d]/) && node.nodeType === Node.ATTRIBUTE_NODE && (metadata.changeEvent || metadata.twoWayBinding))
            {
                if (!ngMgr.bindings)
                {
                    ngMgr.bindings = []
                }
                _ngMgr.bindings.push({
                    path: (path && path + ".") + name, expression: value
                })
            }
            else if (node.nodeType === Node.ATTRIBUTE_NODE)
            {
                if (setValueDirectly || name === "dataSourceDeepWatch")
                {
                    ngMgr.setPropertyValue(target, metadata, value)
                }
                else
                {
                    catchObject.setting.push({
                        nodeDef: metadata, value: value
                    })
                }
            }
            else
            {}
        };
        SpreadAngularManager.setPropertyValue = function(target, metadata, value)
        {
            if (value === undefined)
            {
                return
            }
            if (target.$scopeObject)
            {
                target = target.$scopeObject
            }
            try
            {
                value = ngMgr.convertValue(value, metadata.type, metadata.converter);
                if (metadata.setProperties)
                {
                    angular.forEach(metadata.setProperties, function(setProperty)
                    {
                        ngMgr.setPropertyValueCore(target, value, setProperty)
                    })
                }
                else if (metadata.setFunction)
                {
                    if (typeof metadata.setFunction === "function")
                    {
                        metadata.setFunction.call(ngMgr, target, metadata.name, value)
                    }
                    else
                    {
                        ngMgr.setPropertyValueCore(target, value, undefined, metadata.setFunction)
                    }
                }
                else
                {
                    ngMgr.setPropertyValueCore(target, value, metadata.name);
                    target[metadata.name] = value
                }
            }
            catch(ex) {}
        };
        SpreadAngularManager.setPropertyValueCore = function(target, value, propertyName, setFunction)
        {
            if (propertyName)
            {
                target[propertyName] = value
            }
            else if (setFunction)
            {
                if (typeof setFunction === "string")
                {
                    target[setFunction].call(target, value)
                }
                else
                {
                    var functionName = setFunction.name;
                    var args = [];
                    for (var i = 0; i < setFunction.args.length; i++)
                    {
                        if (setFunction.args[i] === "$value-replace$")
                        {
                            args[i] = value
                        }
                        else
                        {
                            args[i] = setFunction.args[i]
                        }
                    }
                    switch (args.length)
                    {
                        case 1:
                            target[functionName].call(target, args[0]);
                            break;
                        case 2:
                            target[functionName].call(target, args[0], args[1]);
                            break;
                        case 3:
                            target[functionName].call(target, args[0], args[1], args[2]);
                            break;
                        case 4:
                            target[functionName].call(target, args[0], args[1], args[2], args[3]);
                            break;
                        case 5:
                            target[functionName].call(target, args[0], args[1], args[2], args[3], args[4]);
                            break
                    }
                }
            }
        };
        SpreadAngularManager.getPropertyValue = function(target, metadata)
        {
            if (target.$scopeObject)
            {
                target = target.$scopeObject
            }
            var value = "";
            try
            {
                if (metadata.getProperties)
                {
                    angular.forEach(metadata.getProperties, function(setProperty)
                    {
                        if (value === "")
                        {
                            value = ngMgr.setPropertyValueCore(target, value, setProperty)
                        }
                        else
                        {
                            value = value + "," + ngMgr.setPropertyValueCore(target, value, setProperty)
                        }
                    })
                }
                else if (metadata.getFunction)
                {
                    if (typeof metadata.getFunction === "function")
                    {
                        return metadata.getFunction.call(ngMgr, target, metadata.name)
                    }
                    else
                    {
                        value = ngMgr.getPropertyValueCore(target, undefined, metadata.getFunction)
                    }
                }
                else
                {
                    value = ngMgr.getPropertyValueCore(target, name)
                }
            }
            catch(ex) {}
            return value
        };
        SpreadAngularManager.getPropertyValueCore = function(target, propertyName, getFunction)
        {
            if (propertyName)
            {
                return target[propertyName]
            }
            else if (getFunction)
            {
                if (typeof getFunction === "string")
                {
                    return target[getFunction].call(target)
                }
            }
            return ""
        };
        SpreadAngularManager.hasChildElements = function(node)
        {
            if (!node || !node.childNodes)
            {
                return false
            }
            var len = node.childNodes.length;
            for (var i = 0; i < len; i++)
            {
                var child = node.childNodes[i];
                if (child.nodeType == Node.ELEMENT_NODE)
                {
                    return true
                }
            }
            return false
        }
    })(SpreadAngularManager || (SpreadAngularManager = {}));
    m.directive("wijSpread", function()
    {
        return {
                restrict: "E", replace: true, transclude: true, template: "<div ng-transclude/>", scope: {}, controller: ["$scope", function($scope)
                        {
                            $scope.sheets = [];
                            this.addSheet = function(sheet)
                            {
                                $scope.sheets.push(sheet)
                            }
                        }], link: function(scope, element, attrs)
                    {
                        SpreadAngularManager.initSpread(scope, element, attrs);
                        for (var i = 0; i < scope.sheets.length; i++)
                        {
                            SpreadAngularManager.initSheet(scope.sheets[i].sheet, scope.sheets[i].element, scope.sheets[i].attrs);
                            scope.sheets[i].sheet.initColumns()
                        }
                        var sheetCount = scope.sheets ? scope.sheets.length : 1;
                        element.wijspread({sheetCount: sheetCount});
                        var spread = element.wijspread("spread");
                        scope.$scopeObject = spread;
                        for (var i = 0; i < scope.sheets.length; i++)
                        {
                            var sheet = spread.getSheet(i);
                            scope.sheets[i].sheet.setSheet(spread, sheet)
                        }
                        SpreadAngularManager.setValuesAndBindings(scope)
                    }
            }
    });
    m.directive("sheets", function()
    {
        return {
                require: "^wijSpread", restrict: "E", replace: true, transclude: true, template: "<div ng-transclude/>", link: function(scope, element, attrs, wijSpread)
                    {
                        angular.forEach(scope.sheets, function(sheet)
                        {
                            wijSpread.addSheet(sheet)
                        })
                    }, controller: ["$scope", function($scope)
                        {
                            $scope.sheets = [];
                            this.addSheet = function(sheet, element, attrs)
                            {
                                $scope.sheets.push({
                                    sheet: sheet, element: element, attrs: attrs
                                })
                            }
                        }]
            }
    });
    m.directive("sheet", function()
    {
        return {
                require: "^sheets", restrict: "E", replace: true, transclude: true, template: "<div ng-transclude/>", scope: {
                        datasource: "=", autoFit: "@"
                    }, controller: ["$scope", function($scope)
                        {
                            $scope.columns = [];
                            this.addColumn = function(column)
                            {
                                $scope.columns.push(column);
                                return $scope.columns.length - 1
                            };
                            this.updataBinding = function(colIndex, value)
                            {
                                var columnWraper = $scope.columnWrappers[colIndex];
                                columnWraper.dataField = value
                            };
                            $scope.initColumns = function()
                            {
                                $scope.columnWrappers = [];
                                for (var col = 0; col < $scope.columns.length; col++)
                                {
                                    var columnWraper = new ColumnWrapper(col);
                                    SpreadAngularManager.initColumn(columnWraper, $scope.columns[col].element, $scope.columns[col].attrs);
                                    $scope.columnWrappers.push(columnWraper)
                                }
                            }
                        }], link: function(scope, element, attrs, sheets)
                    {
                        var ns = $.wijmo.wijspread;
                        sheets.addSheet(scope, element, attrs);
                        scope.setSheet = function(spread, sheet)
                        {
                            scope.$scopeObject = sheet;
                            var hasColumns = scope.columns && scope.columns.length > 0;
                            if (hasColumns)
                            {
                                sheet.setColumnCount(scope.columns.length);
                                angular.forEach(scope.columnWrappers, function(columnWrapper)
                                {
                                    columnWrapper.sheet = sheet;
                                    columnWrapper.column = sheet.getColumn(columnWrapper.index)
                                })
                            }
                            var dataSourceDeepWatch = true;
                            if (scope.dataSourceDeepWatch !== undefined)
                            {
                                dataSourceDeepWatch = scope.dataSourceDeepWatch
                            }
                            scope.$watch("datasource", dataChanged, dataSourceDeepWatch);
                            sheet.bind(ns.Events.ValidationError, function(event, data)
                            {
                                if (spread._angularDataValidationResult !== undefined)
                                {
                                    data.validationResult = spread._angularDataValidationResult
                                }
                                else
                                {
                                    data.validationResult = ns.DataValidationResult.Discard
                                }
                            });
                            sheet.bind(ns.Events.ColumnWidthChanged, function(event, data)
                            {
                                var sheet = data.sheet;
                                var colList = data.colList;
                                var parentScope;
                                for (var col = 0; col < colList.length; col++)
                                {
                                    var columnWrapper = scope.columnWrappers[colList[col]];
                                    if (columnWrapper.parentScope && columnWrapper.bindingPath)
                                    {
                                        parentScope = columnWrapper.parentScope;
                                        parentScope[columnWrapper.bindingPath] = sheet.getColumnWidth(colList[col])
                                    }
                                }
                                if (parentScope)
                                {
                                    parentScope.$apply()
                                }
                            });
                            sheet.bind(ns.Events.SheetNameChanged, function(event, data)
                            {
                                if (scope.parentScope && scope.bindingPath)
                                {
                                    scope.parentScope[scope.bindingPath] = data.newValue;
                                    scope.parentScope.$apply()
                                }
                            });
                            sheet.bind(ns.Events.UserZooming, function(event, data)
                            {
                                if (scope.parentScope && scope.bindingPath)
                                {
                                    scope.parentScope[scope.bindingPath] = data.newZoomFactor;
                                    scope.parentScope.$apply()
                                }
                            });
                            function dataChanged(newVal, oldVal)
                            {
                                bindSheet(newVal, oldVal)
                            }
                            function bindSheet(newVal, oldVal)
                            {
                                if (scope.datasource)
                                {
                                    if (scope.datasource !== sheet.getDataSource())
                                    {
                                        sheet.isPaintSuspended(true);
                                        var hasColumns = scope.columns && scope.columns.length > 0;
                                        if (hasColumns)
                                        {
                                            sheet.autoGenerateColumns = false;
                                            sheet.setDataSource(scope.datasource, false);
                                            sheet.setColumnCount(scope.columns.length);
                                            for (var col = 0; col < scope.columns.length; col++)
                                            {
                                                bindColumn(col)
                                            }
                                        }
                                        else
                                        {
                                            var colWidths = getColWidths();
                                            sheet.autoGenerateColumns = true;
                                            sheet.setDataSource(scope.datasource, false);
                                            for (var col = 0; col < sheet.getColumnCount(); col++)
                                            {
                                                var header = sheet.getValue(0, col, ns.SheetArea.colHeader);
                                                header = getHeader(header);
                                                sheet.setValue(0, col, header, ns.SheetArea.colHeader);
                                                if (header.indexOf("$$") == 0)
                                                {
                                                    sheet.deleteColumns(col, 1);
                                                    col--
                                                }
                                            }
                                            setColWidths(colWidths)
                                        }
                                        sheet.isPaintSuspended(false)
                                    }
                                    else if (newVal && oldVal && newVal.length != oldVal.length)
                                    {
                                        sheet.setRowCount(newVal.length);
                                        sheet.invalidateLayout();
                                        sheet.repaint()
                                    }
                                    else
                                    {
                                        sheet.invalidateLayout();
                                        sheet.repaint()
                                    }
                                }
                                else
                                {
                                    sheet.invalidateLayout();
                                    sheet.repaint()
                                }
                            }
                            function bindColumn(index)
                            {
                                var column = sheet.getColumn(index);
                                var columnWraper = scope.columnWrappers[index];
                                var scopeCol = scope.columns[index];
                                if (columnWraper.dataField || columnWraper.headerText)
                                {
                                    sheet.bindColumn(index, {
                                        name: columnWraper.dataField, displayName: columnWraper.headerText
                                    })
                                }
                                if (columnWraper._width !== undefined)
                                {
                                    column.width(columnWraper._width)
                                }
                                if (columnWraper._visible !== undefined)
                                {
                                    column.visible(columnWraper._visible)
                                }
                                if (columnWraper._resizable !== undefined)
                                {
                                    column.resizable(columnWraper._resizable)
                                }
                                if (scope.columns[index].autofit)
                                {
                                    sheet.autoFitColumn(index)
                                }
                            }
                            function getHeader(name)
                            {
                                name = name.charAt(0).toUpperCase() + name.slice(1);
                                while (name.indexOf("_") > -1)
                                    name = name.replace("_", " ");
                                return name
                            }
                            function getColWidths()
                            {
                                var arr = [];
                                for (var i = 0; i < sheet.getColumnCount(); i++)
                                {
                                    arr.push(sheet.getColumn(i).width())
                                }
                                return arr
                            }
                            function setColWidths(colWidths)
                            {
                                if (sheet.getColumnCount() == colWidths.length)
                                {
                                    for (var i = 0; i < sheet.getColumnCount(); i++)
                                    {
                                        sheet.getColumn(i).width(colWidths[i])
                                    }
                                }
                            }
                        }
                    }
            }
    });
    m.directive("columns", function()
    {
        return {
                require: "^sheet", restrict: "E", replace: true, transclude: true, template: "<div ng-transclude/>", link: function(scope, element, attrs, sheet)
                    {
                        scope.sheet = sheet;
                        angular.forEach(scope.columns, function(column)
                        {
                            sheet.addColumn(column)
                        })
                    }, controller: ["$scope", function($scope)
                        {
                            $scope.columns = [];
                            this.addColumn = function(column)
                            {
                                $scope.columns.push(column)
                            };
                            this.indexOf = function(column)
                            {
                                return $scope.columns.indexOf(column)
                            };
                            this.updataBinding = function(column, value)
                            {
                                $scope.sheet.updataBinding(this.indexOf(column), value)
                            }
                        }]
            }
    });
    function ColumnWrapper(index)
    {
        this.headerText = "";
        this.dataField = "";
        this.index = index
    }
    ColumnWrapper.prototype = {
        width: function(value)
        {
            if (arguments.length === 0)
            {
                return this.column.width()
            }
            else
            {
                this._width = value;
                this.column.width(value);
                return this
            }
        }, visible: function(value)
            {
                if (arguments.length === 0)
                {
                    return this.column.visible()
                }
                else
                {
                    this._visible = value;
                    this.column.visible(value);
                    return this
                }
            }, resizable: function(value)
            {
                if (arguments.length === 0)
                {
                    return this.column.resizable()
                }
                else
                {
                    this._resizable = value;
                    this.column.resizable(value);
                    return this
                }
            }, defaultStyle: function(value)
            {
                if (arguments.length === 0)
                {
                    return this.sheet.getStyle(-1, this.index, $.wijmo.wijspread.SheetArea.viewport)
                }
                else
                {
                    this._defaultStyle = value;
                    this.sheet.setStyle(-1, this.index, value, $.wijmo.wijspread.SheetArea.viewport);
                    return this
                }
            }
    };
    m.directive("column", function()
    {
        return {
                require: "^columns", restrict: "E", replace: true, transclude: true, template: "<div ng-transclude/>", scope: {
                        datafield: "@", autofit: "@"
                    }, controller: ["$scope", function($scope)
                        {
                            $scope.items = {
                                title: $scope.header, wdth: $scope.width
                            }
                        }], link: function(scope, element, attrs, columns)
                    {
                        columns.addColumn(scope);
                        scope.element = element;
                        scope.attrs = attrs;
                        scope.$watch("datafield", function(value)
                        {
                            columns.updataBinding(scope, value)
                        })
                    }
            }
    })
})()

