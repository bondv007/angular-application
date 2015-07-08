// created by Jeff Gunderson 2/17/2015
'use strict';

app.directive( 'mmSpreadsheet', [ 'EC2Restangular', 'mmAlertService', 'mmUtils', '$timeout', '$rootScope', '$compile',
	function( EC2Restangular, mmAlertService, mmUtils, $timeout, $rootScope, $compile ) {

		return {
			restrict: 'E',
			scope: {
				mmFile: '=',
				mmSheets: '=',
				mmButtons: '=',
				mmSpreadsheetData: '=',
				mmSpreadsheetName: '=',
				mmSaveFlag: '=',
				mmSaveObject: '=',
				mmSaveRestPath: '=',
				mmId: '@'
			},
			templateUrl: '/versaTag/app/directives/views/mmSpreadsheet.html',
			link: function( scope, element, attrs ) {

				/**
				 * Call the functoin to initialize the directive
 				 */
				init();


				/**
				 * Init the wijmo plugin and initialize some watchers
				 */
				function init() {

					$timeout(function() {

						scope.$element = $('#' + scope.mmId );
						scope.$element.wijspread();
						scope.spread = scope.$element.wijspread('spread');
						scope.spread.tabStripVisible( false );

						// I am setting this so I know that we have loaded the spreadsheet for the first time
						// That way when we reload the sheet data I can show a different loading graphic to the user
						scope.initialLoad = true;

						// some vars
						scope.errorCount = 0;
						scope.errorTooltips = [];

						// create the sheets needed
						createNeccessarySheets();

						// watch for a new file that is loaded
						scope.$watch( 'mmFile', function( mmFile ) {
							if ( mmFile ) {
								readFile( mmFile );
							}
						});

						// watch if the save flag (external or internal) is triggered
						// strange approach but all I could think of when clicking the save button that lives outside this scope
						scope.$watch( 'mmSaveFlag', function( mmSaveFlag ) {
							if ( mmSaveFlag == true ) {
								saveSpreadsheet();
							}
						});
					});

				};


				/**
				 * Colors for the sheet
				 * @type {string}
				 */
				var headerColor = '#6a7486',
					headerBackground = '#fafafd',
					enabledColor = '#6a7486',
					disabledColor = '#8694a6',
					regularBackground = '#FFFFFF',
					regularBorder = '#bacae4',
					errorBackground = '#ecd6d7',
					errorBorder = '#FF0000',
					updatedBackground = '#e6f4f2';


				/**
				 * Create the sheets passed in
				 */
				function createNeccessarySheets() {

					//$timeout(function() {
						if ( scope.mmSheets.length ) {

							scope.spread.clearSheets();

							// set initial counts that are used to show loading graphic
							scope.sheetDataCount = 0;
							scope.loadedSheetDataCount = 0;

							// first add the sheets to the spreadsheet
							angular.forEach( scope.mmSheets, function( sheet, i ) {
								scope.spread.addSheet();
								scope.spread.setActiveSheetIndex( i );
								scope.spread.getActiveSheet().setName( sheet.name );
								scope.spread.getActiveSheet().conversionToServerFunction = sheet.conversionToServerFunction;
								scope.spread.getActiveSheet().saveKey = sheet.saveKey;
								scope.spread.getActiveSheet().readOnlyColumns = sheet.readOnlyColumns;
								scope.spread.getActiveSheet().autoCompleteColumns = sheet.autoCompleteColumns;
								scope.spread.getActiveSheet().optionsForColumns = sheet.optionsForColumns;
								scope.spread.getActiveSheet().defaultDataObject = sheet.defaultDataObject;
								scope.spread.getActiveSheet().fieldsToSearchOnError = sheet.serverFieldsToSearchOnError;
								loadSheetData( i );
							});

						}
					//});

				};


				/**
				 * Loads the sheet data from the server
				 * @param sheetName
				 */
				function loadSheetData( index ) {

					var sheet = scope.mmSheets[ index ];

					// use the data object passed in
					if ( sheet.data ) {
						initSheet( sheet.name, sheet.data );
					}

					// otherwise use the rest path to get it from the server
					else if ( sheet.restPath ) {

						scope.loading = true;

						scope.sheetDataCount++;

						// if it's a single entity we will use restangulars 'one' method
						if ( sheet.singleEntity ) {
							EC2Restangular.one( sheet.restPath ).get().then(
								function( response ) {
									response = response.plain();

									if ( sheet.conversionFromServerFunction ) {
										response = sheet.conversionFromServerFunction( response );
									}
									else{
										response = [ response ];
									}

									scope.loadedSheetDataCount++;
									if ( scope.loadedSheetDataCount == scope.sheetDataCount ){
										scope.loading = false;
									}

									initSheet( sheet.name, response );

								},
								function( error ) {
									mmAlertService.addError( error );
								}
							);
						}

						// otherwise we are getting a list so using 'all' method
						else{
							EC2Restangular.all( sheet.restPath ).getList( sheet.restParameters ).then(
								function( response ) {
									response = response.plain();

									// we need to show the default data object if the array is empty
									if ( !response.length && sheet.defaultDataObject ) {
										response = [ sheet.defaultDataObject ];
									}

									if ( sheet.conversionFromServerFunction ) {
										response = sheet.conversionFromServerFunction( response );
									}

									scope.loadedSheetDataCount++;
									if ( scope.loadedSheetDataCount == scope.sheetDataCount ){
										scope.loading = false;
									}

									initSheet( sheet.name, response );

								},
								function( error ) {
									mmAlertService.addError( error );
								}
							)
						}
					}

				};

				/**
				 * Applies the sheet data that was either retrieved from server or excel sheet
				 * Can set other formatted data here as well
				 * @param name
				 * @param data
				 */
				function initSheet( name, data ) {

					// set the active sheet
					scope.spread.setActiveSheet( name );

					// get the active sheet
					var activeSheet = scope.spread.getActiveSheet();

					// set the data source
					activeSheet.setDataSource( data, false );

					// now update mmSpreadsheetData
					scope.mmSpreadsheetData[ name ] = activeSheet.getDataSource();

					// init
					applySheetBindings( activeSheet );
					applyFiltering( activeSheet );
					applyReadOnlyFormatting( activeSheet );
					applyStyling( activeSheet );
					applyAutoCompleteCells( activeSheet );
					applyCellOptions( activeSheet );

					scope.spread.setActiveSheetIndex(0);

				};


				/**
				 * Add some bindings to each sheet
				 * These are just general bindings
				 */
				function applySheetBindings( sheet ) {

					// when a cell is changed we are going to set the page as dirty
					// and will also update the mmSpreadSheetData
					sheet.bind( $.wijmo.wijspread.Events.CellChanged, function (event, cellInfo) {

						// we are also going to remove error styling to the row if needed
						removeErrorStylingOnRow( cellInfo );
						removeErrorTooltip( scope.spread.getSheetIndex( cellInfo.sheet.getName() ), cellInfo.row );
						applyEditedStylingToRow( scope.spread.getSheetIndex( cellInfo.sheet.getName() ), cellInfo.row );

						// after each cell change update the 'mmSpreadsheetData'
						$timeout(function() {
							// after each change make sure the entity is marked as dirty
							$rootScope.isDirtyEntity = true;
							scope.mmSpreadsheetData[ cellInfo.sheet.getName() ] = cellInfo.sheet.getDataSource();
						});



					});


					// bind hovers to check for error tooltips
					scope.$element.mousestop(function( event ) {

						console.log( event );

						var hitInfo = sheet.hitTest( event.pageX - scope.$element.offset().left, event.pageY - scope.$element.offset().top);

						if ( hitInfo.row ) {

							var rowBackground = scope.spread.getActiveSheet().getRow( hitInfo.row ).backColor();

							if ( rowBackground == errorBackground ) {
								showErrorTooltip( scope.spread.getActiveSheetIndex(), hitInfo.row, event );
							}
							else{
								hideErrorTooltip();
							}

						}

					});

				};



				/**
				 * Applies filtering to each of the columns of a sheet
				 * Can be extended to apply filtering only for some columns if needed later
				 * @param activeSheet
				 */
				function applyFiltering( activeSheet ) {

					// apply filtering to every row and column
					activeSheet.rowFilter(new $.wijmo.wijspread.HideRowFilter(new $.wijmo.wijspread.Range( 0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount() )));

				};


				/**
				 * Applies the styling to each sheet
				 * @param activeSheet
				 */
				function applyStyling( activeSheet ) {


					//Set the backcolor and forecolor for the entire column header.
					var headerRow = activeSheet.getRow(0, $.wijmo.wijspread.SheetArea.colHeader);
					headerRow.backColor( headerBackground );
					headerRow.borderBottom(new $.wijmo.wijspread.LineBorder( regularBorder, $.wijmo.wijspread.LineStyle.thin));
					headerRow.borderTop(new $.wijmo.wijspread.LineBorder( regularBorder, $.wijmo.wijspread.LineStyle.thin));
					headerRow.borderLeft(new $.wijmo.wijspread.LineBorder( regularBorder, $.wijmo.wijspread.LineStyle.thin));
					headerRow.borderRight(new $.wijmo.wijspread.LineBorder( regularBorder, $.wijmo.wijspread.LineStyle.thin));
					headerRow.foreColor( headerColor );
					headerRow.font("13px Titillium Semibold, arial,sans-serif uppercase");
					headerRow.height( headerRow.height() + 6 );
					headerRow.vAlign($.wijmo.wijspread.VerticalAlign.center);

					// set the rest of the sheets grid color
					activeSheet.gridline.color = regularBorder;

					// loop over each column in the sheet to decide if it should be locked
					for ( var i = 0; i < activeSheet.getColumnCount(); i++ ) {

						var column = activeSheet.getColumn( i );

						column.foreColor( enabledColor );

						if ( column.locked() !== false ) {
							column.foreColor( disabledColor );
						}

						// auto-fit all the columns
						scope.spread.autoFitType( $.wijmo.wijspread.AutoFitType.CellWithHeader );
						activeSheet.autoFitColumn( i );

						// and then make them a little bigger than the "autofit" size to give them some breathing room 8-)
						column.width( column.width() + 50 );

					}

					// increasing the height of the rows
					for ( var i = 0; i < activeSheet.getRowCount(); i++ ) {

						var row = activeSheet.getRow( i );
						row.height( row.height() + 6 );
						row.vAlign($.wijmo.wijspread.VerticalAlign.center);
					}

				};



				function applyEditedStylingToRow( sheetIndex, rowIndex ) {

					var sheet = scope.spread.getSheet( sheetIndex );
					var row = sheet.getRow( rowIndex );

					row.backColor( updatedBackground );
					row.borderBottom(new $.wijmo.wijspread.LineBorder( regularBorder, $.wijmo.wijspread.LineStyle.thin));
					row.borderTop(new $.wijmo.wijspread.LineBorder( regularBorder , $.wijmo.wijspread.LineStyle.thin));
					row.borderLeft(new $.wijmo.wijspread.LineBorder( regularBorder , $.wijmo.wijspread.LineStyle.thin));
					row.borderRight(new $.wijmo.wijspread.LineBorder( regularBorder , $.wijmo.wijspread.LineStyle.thin));

					sheet.getCell(rowIndex, 0, 3).value('Edited');

				};


				/**
				 * Applies error styles to certain rows
				 * @param item
				 */
				function applyErrorStylingToRow( sheetIndex, rowIndex ) {

					var sheet = scope.spread.getSheet( sheetIndex );
					var row = sheet.getRow( rowIndex );

					row.tag('error');

					row.backColor( errorBackground );
					row.borderBottom(new $.wijmo.wijspread.LineBorder( errorBorder, $.wijmo.wijspread.LineStyle.thin));
					row.borderTop(new $.wijmo.wijspread.LineBorder( errorBorder , $.wijmo.wijspread.LineStyle.thin));
					row.borderLeft(new $.wijmo.wijspread.LineBorder( regularBorder , $.wijmo.wijspread.LineStyle.thin));
					row.borderRight(new $.wijmo.wijspread.LineBorder( regularBorder , $.wijmo.wijspread.LineStyle.thin));

				};


				/**
				 * Removes the error style from the row
				 * Only removes if it's already set to error
				 * Using background color to decide which isn't ideal but their "tagging" method doesn't work
				 * Asked question about it in Wijmo forums: http://wijmo.com/topic/tagging-a-row/
				 * @param cellInfo
				 */
				function removeErrorStylingOnRow( cellInfo ) {

					var row = cellInfo.sheet.getRow( cellInfo.row );

					if ( row.backColor() == errorBackground ) {

						row.backColor('#ffffff');
						row.borderBottom(new $.wijmo.wijspread.LineBorder("#bacae4", $.wijmo.wijspread.LineStyle.thin));
						row.borderTop(new $.wijmo.wijspread.LineBorder("#bacae4", $.wijmo.wijspread.LineStyle.thin));
						row.borderLeft(new $.wijmo.wijspread.LineBorder("#bacae4", $.wijmo.wijspread.LineStyle.thin));
						row.borderRight(new $.wijmo.wijspread.LineBorder("#bacae4", $.wijmo.wijspread.LineStyle.thin));
						scope.errorCount--;

					}

				};

				/**
				 * Set the defined columns as read only
				 * WARNING: THIS SEEMS BACKWARDS.. I KNOW :-(
				 * activeSheet.getColumn( i ).locked( true ) DOESN'T WORK!!
				 * So I lock all columns and then if it doesn't match I unlock it.. STUPID :-/
				 * Wijmo answered my question in forums - this is the CORRECT approach
				 * http://wijmo.com/topic/locking-columns-issues/
				 */
				function applyReadOnlyFormatting( sheet ) {

					// first lock all the data.. we will unlock columns in the loop
					sheet.isProtected = true;

					// loop over each column in the sheet
					for ( var i = 0; i < sheet.getColumnCount(); i++ ) {

						// TODO: move to somewhere else
						sheet.getColumn( i ).wordWrap(true);

						// if the sheet has read only columns we will loop over to see what to unlock
						if ( sheet.readOnlyColumns && sheet.readOnlyColumns.length ) {

							var found = false;

							for ( var g = 0; g < sheet.readOnlyColumns.length; g++ ) {
								if ( sheet.getDataColumnName(i) == sheet.readOnlyColumns[g] ) {
									found = true
								}
							}

							if ( !found ) {
								sheet.getColumn( i ).locked( false );
							}

						}

						// if we didn't have any read only columns we will unlock them all
						else{
							sheet.getColumn( i ).locked( false );
						}
					}

				};


				/**
				 * Creates any needed auto-completion on cells
				 * @param sheet
				 */
				function applyAutoCompleteCells( sheet ) {
					findMatchingColumnsAndApplyCustomFormatting( sheet, 'autoCompleteColumns', createAutoCompleteCells );
				};


				/**
				 * Creates multiple options for a cell to display instead of typing
				 * @param sheet
				 */
				function applyCellOptions( sheet ) {
					findMatchingColumnsAndApplyCustomFormatting( sheet, 'optionsForColumns', createOptionsForCells );
				};


				/**
				 * Creates the auto complete cells ( type and fetch results from server to populate list )
				 * @param column
				 * @param autoComplete
				 */
				function createAutoCompleteCells( column, autoComplete ) {

					var cellType = new $.wijmo.wijspread.TextCellType();

					cellType.createEditorElement = function( context ) {

						scope.cellValue = context.sheet.getCell( context.row, context.col ).value();
						scope.autoCompleteRestPath = autoComplete.restPath;

						// create the element to return
						// creating select list as well
						// compiled so that scope is attached.. using mousedown.. ng-click is getting intercepted..
						var editor = document.createElement('div');
						var $textInput = $compile('<input class="mm-spreadsheet-input" type="text" ng-model="autoCompleteSuggestion" ng-keyup="searchAutoComplete( autoCompleteSuggestion )">')(scope);
						var $selectList = $compile('<div ng-show="autoCompleteOptions.length" class="mm-spreadsheet-dropdown" style="margin-top:0px;"><div class="item" ng-repeat="option in autoCompleteOptions" ng-mousedown="setCellValue( option.name, context );">{{ option.name }}</div></div>')(scope);

						// append.. needs timeout
						$timeout(function() {
							$( editor )
								.css({ width: column.width() } )
								.append( $textInput )
								.append( $selectList );
						});

						return editor;

					};

					cellType.getEditorValue = function( context ) {
						return scope.cellValue;
					};

					column.cellType( cellType );

				};

				// searches the server for auto complete suggestions
				scope.searchAutoComplete = function( value ) {

					if ( value ) {
						EC2Restangular.one( scope.autoCompleteRestPath ).getList( value ).then(function( response ) {
							scope.autoCompleteOptions = response;
						});
					}

					else {
						scope.autoCompleteOptions = null;
					}

				};


				// sets the value on the scope.. doesnt set it on the cell itself.. extending cellType (ex cellType.getEditorValue) will set actual value on the cell
				scope.setCellValue = function( name, context ) {
					scope.cellValue = name;
				};


				/**
				 * Creates the cell options ( dropdown to select a value )
				 * @param column
				 * @param option
				 */
				function createOptionsForCells( column, option ) {

					// create a combo box and set its items to the items passed in
					var cellType = new $.wijmo.wijspread.ComboBoxCellType();
					cellType.items( option.options );

					// applies the cell type to all the cells in the column
					column.cellType( cellType );

				};


				/**
				 * Shows the error tooltip when hovered over a row that is in the error array
				 * @param sheetIndex
				 * @param rowIndex
				 * @param event
				 */
				function showErrorTooltip( sheetIndex, rowIndex, event ) {

					// loop through the error tooltips
					for ( var i = 0; i < scope.errorTooltips.length; i++ ) {

						var index = i;

						// if it matches show the right message
						if ( scope.errorTooltips[index].sheetIndex == sheetIndex && scope.errorTooltips[index].rowIndex == rowIndex) {
							$timeout(function() {
								scope.errorTooltip = true;
								scope.errorTooltipMessage = scope.errorTooltips[index].message;
								scope.errorTooltipStyle = {
									top: event.pageY - 30,
									left: event.pageX + 30
								}
							});
						}
					}

				};


				/**
				 * Hides error tooltips
				 */
				function hideErrorTooltip() {
					$timeout(function() {
						scope.errorTooltip = false;
						scope.errorTooltipMessage = '';
					});
				};


				/**
				 * UTILITY
				 * Resuable function to loop through columns that need custom style types and then runs the function to create them
				 * @param sheet
				 * @param key
				 * @param func - needs to accept 2 params, the column and the columns options ( defined in the col definitions outside of the directive )
				 */
				function findMatchingColumnsAndApplyCustomFormatting( sheet, key, func ) {

					if ( sheet[ key ] && sheet[ key ].length ) {

						// loop over each column in the sheet
						for ( var i = 0; i < sheet.getColumnCount(); i++ ) {

							// now loop over the custom formatting columns to check for any matches
							for ( var g = 0; g < sheet[ key ].length; g++ ) {

								// if we found a match we need to create the custom formatting
								if ( sheet.getDataColumnName( i ) == sheet[ key ][ g ].columnName ) {

									// creat the needed custom formatting
									func( sheet.getColumn( i ), sheet[ key ][ g ] );

								}
							}

						}

					}

				};


				/**
				 * sets the files once selected
 				 */
				scope.importXLSXFile = function( evt ) {
					$timeout(function() {
						scope.spreadsheetFile = evt.files[0];
						scope.spreadsheetFile.fileType = 'xlsx';
						readFile( scope.spreadsheetFile );
					});
				};


				/**
				 * triggers the export to .XLSX
				 */
				function exportSpreadsheet() {

					var workbook = {
						SheetNames: [],
						Sheets: {}
					};

					angular.forEach( scope.spread.sheets, function( sheet, i ) {

						var worksheetName = sheet.getName();
						workbook.SheetNames.push( worksheetName );
						var data = sheet.getDataSource();
						if ( data && data.length ) {
							var sheetData = sheet_from_array( sheet.getDataSource() );
							workbook.Sheets[ worksheetName ] = sheetData;
						}

					});

					var workbookOptions = { bookType:'xlsx', bookSST:false, type:'binary' };
					var wbout = XLSX.write( workbook, workbookOptions );

					function s2ab(s) {
						var buf = new ArrayBuffer(s.length);
						var view = new Uint8Array(buf);
						for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
						return buf;
					}

					saveAs( new Blob([s2ab(wbout)], {type:""} ), scope.mmSpreadsheetName + '.xlsx' );

				};

				/**
				 * Converts the sheet data to an array that XLSX-JS can understand
				 * @param dataObject
				 * @param opts
				 * @returns {{}}
				 */
				function sheet_from_array(dataObject, opts) {

					// holds the data object we are going to create from "dataObject"
					var data = [];

					// so first we need to grab the headers out and push them to the array so they are the first array in the array
					var headerRow = [];
					for( var key in dataObject[0] ) {
						headerRow.push( key );
					}
					data.push( headerRow );

					// then we need to convert the row objects to arrays
					for ( var i = 0; i < dataObject.length; i++ ) {
						var row = $.map(dataObject[i], function(value, index) {
							return [value];
						});
						data.push(row);
					}

					// then we run this crazy function provided to use by XLSX-JS
					var ws = {};
					var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
					for(var R = 0; R != data.length; ++R) {
						for(var C = 0; C != data[R].length; ++C) {
							if(range.s.r > R) range.s.r = R;
							if(range.s.c > C) range.s.c = C;
							if(range.e.r < R) range.e.r = R;
							if(range.e.c < C) range.e.c = C;
							var cell = {v: data[R][C] };
							if(cell.v == null) continue;
							var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

							if(typeof cell.v === 'number') cell.t = 'n';
							else if(typeof cell.v === 'boolean') cell.t = 'b';
							else if(cell.v instanceof Date) {
								cell.t = 'n'; cell.z = XLSX.SSF._table[14];
								cell.v = datenum(cell.v);
							}
							else cell.t = 's';

							ws[cell_ref] = cell;
						}
					}

					if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
					return ws;
				};


				/**
				 * Saves the spreadsheet to the server
				 */
				function saveSpreadsheet() {

					// loop over the sheets and get each sheets data (and convert if needed) to create save object
					angular.forEach( scope.spread.sheets, function( sheet, i ) {

						// sheet.saveKey is from the sheet parameters passed into the directive
						// if it's undefined then we aren't going to attach to the saveObject
						if ( sheet.saveKey ) {

							var data = sheet.getDataSource();

							// convert if needed
							if ( sheet.conversionToServerFunction ) {
								data = sheet.conversionToServerFunction( data );
							}

							// assign the data to the save object using the key provided
							scope.mmSaveObject[ sheet.saveKey ] = data;

						}

					});

					scope.errorCount = 0;

					// send it to the server
					EC2Restangular.all( scope.mmSaveRestPath ).post( scope.mmSaveObject ).then(
						function( response ) {

							// need some timeouts here to get the UI to behave nicely
							$timeout(function() {
								mmUtils.cacheManager.clearCache();
								mmAlertService.addSuccess('You have successfully saved your VersaTag.');
								scope.mmSaveFlag = false;
								$rootScope.isDirtyEntity = false;
							});

							// small timeout extra from the previous for smoother transition
							$timeout(function() {
								scope.initialLoad = false;
								createNeccessarySheets();
							}, 100 );

						},
						function( errors ) {
							scope.mmSaveFlag = false;
							handleSaveErrors( errors.data.error );
						}
					);

				};


				/**
				 * Handles and shows errors on the spreadsheetv
				 */
				function handleSaveErrors( response ) {

					for ( var i = 0; i < response.errors.length; i++ ) {

						scope.errorCount++;

						var errorMessage = response.errors[i].innerMessage,
							spreadsheetItem = findRowByEntity( response.errors[i].entity );

						if ( spreadsheetItem ) {
							applyErrorStylingToRow( spreadsheetItem.foundSheetIndex, spreadsheetItem.foundRowIndex );
							addErrorTooltip( spreadsheetItem.foundSheetIndex, spreadsheetItem.foundRowIndex, errorMessage );
						}

					}

				};


				/**
				 * Adds an error tooltip to the array
				 * @param sheetIndex
				 * @param rowIndex
				 * @param message
				 */
				function addErrorTooltip( sheetIndex, rowIndex, message ) {

					// if we have errors we need to check if there is already an error on the row
					if ( scope.errorTooltips.length ) {

						// loop over each of the errors
						for ( var i = 0; i < scope.errorTooltips.length; i++ ) {

							// if we already have an error on this row we want to append the message to the existing one
							if ( scope.errorTooltips[i].sheetIndex == sheetIndex && scope.errorTooltips[i].rowIndex == rowIndex) {
								scope.errorTooltips[i].message += ' ' + message;
							}

							// otherwise we will push a new rule in
							else{
								scope.errorTooltips.push({
									sheetIndex: sheetIndex,
									rowIndex: rowIndex,
									message: message
								});
							}

						}

					}

					// otherwise we will just push directly
					else{

						scope.errorTooltips.push({
							sheetIndex: sheetIndex,
							rowIndex: rowIndex,
							message: message
						});

					}

				};


				/**
				 * Removes the error tooltip from a row
				 * @param sheetIndex
				 * @param rowIndex
				 */
				function removeErrorTooltip( sheetIndex, rowIndex ) {

					for( var i = 0; i < scope.errorTooltips.length; i++ ) {

						if ( scope.errorTooltips[i ].sheetIndex == sheetIndex && scope.errorTooltips[i ].rowIndex == rowIndex ){
							scope.errorTooltips.splice( i, 1 );
						}

						console.log( scope.errorTooltips );

					}

				};

				/**
				 * Finds the row of an entity by searching it's properties
				 * The entity is the response from the server
				 * Uses the sheets "fieldsToSearchOnError" property to see which key/value pairs of the entity to use to search
				 * @param entity
				 * @returns {*}
				 */
				function findRowByEntity( entity ) {

					var result;

					// first loop over the sheets
					for( var i = 0; i < scope.spread.getSheetCount() - 1; i++ ) {

						// get the fields/keys passed in to search by
						var fields = scope.spread.getSheet( i ).fieldsToSearchOnError;

						if ( fields && fields.length ) {

							// loop over the fields
							for ( var g = 0; g < fields.length; g++ ) {

								// now search the sheet by entity properties defined in the "fieldsToSearchOnError"
								result = scope.searchSheet( entity[ fields[g] ], i );

								// if we get it return immediately without continuing the loop
								if ( result.searchFoundFlag == 1 ) break;

							}

						}

					}

					return result;

				};


				/**
				 * If a file is passed in it will attempt to read/parse its contents
				 * @param file
				 */
				function readFile( file ) {

					$timeout(function() {
						scope.importing = true;
					});

					// reading a .xlsx file
					if ( file.fileType == 'xlsx' ) {

						var reader = new FileReader();

						// read the file
						reader.readAsBinaryString( file );

						// action when we load the file
						reader.onload = function(e) {

							// get the data from the file
							var data = e.target.result;
							var workbook = XLSX.read( data, { type: 'binary' } );

							for ( var key in workbook.Sheets ) {
								var sheet = XLSX.utils.sheet_to_json( workbook.Sheets[ key ] );

								// for some reason XSLX utils adds row num to object prototype which shows up as a row
								angular.forEach( sheet, function( sheetItem ) {
									delete sheetItem['__proto__']['__rowNum__'];
								});

								initSheet( key, sheet );

							}

							// force a digest here
							$timeout(function() {
								$rootScope.isDirtyEntity = true;
								scope.importing = false;
							});

						};

					}

				};


				/**
				 * Adds a new row to the active sheet
				 * TODO: need a way to know if the sheet can be added to or not
				 */
				scope.addEntityToSheet = function() {
					var sheet = scope.spread.getActiveSheet(),
						rowCount = sheet.getRowCount();

					sheet.addRows( rowCount, 1 );

					var row = sheet.getRow( rowCount + 1 );
					row.height( row.height() + 6 );

				};


				/**
				 * Goes to a certain sheet
				 * used to toggle between sheets with the custom sheet footer
				 * @param index
				 */
				scope.goToSheet = function( sheet ) {

					// if it's not a number it's probably the name passed in
					if ( sheet && isNaN( sheet ) ) {
						scope.spread.setActiveSheet( sheet );
					}

					// otherwise it's the index
					else if ( sheet || sheet === 0 ) {
						scope.spread.setActiveSheetIndex( sheet );
					}

				};


				/**
				 * Searches a sheet
				 * TODO: need to figure out how to return multiple results in search.. only returns first match
				 * TODO: also need to implement UI for this
				 * @param value: the param to search for
				 * @param onlyActiveSheet: only searches the active sheet, otherwise searches entire spreadsheet
				 */

				scope.searchSheet = function( value, index ) {

					if ( !index ) {
						index = scope.spread.getActiveSheetIndex();
					}

					// create the search params
					var searchCondition = new $.wijmo.wijspread.SearchCondition();
					searchCondition.searchString = value;
					searchCondition.startSheetIndex = index;
					searchCondition.endSheetIndex = index;
					searchCondition.sheetArea = 3;
					searchCondition.columnStart = 0;
					searchCondition.columnEnd = scope.spread.getSheet( index ).getColumnCount();
					searchCondition.rowStart = 0;
					searchCondition.rowEnd = scope.spread.getSheet( index ).getRowCount();
					searchCondition.searchOrder = $.wijmo.wijspread.SearchOrder.NOrder;
					searchCondition.searchTarget = $.wijmo.wijspread.SearchFoundFlags.CellText;
					searchCondition.searchFlags = $.wijmo.wijspread.SearchFlags.Ignorecase| $.wijmo.wijspread.SearchFlags.UseWildCards;

					return scope.spread.search( searchCondition );

				};


				/**
				 * The buttons that are defined on the page
				 */
				scope.mmButtons = [
					{
						name: 'Import',
						items: [
							{
								name: 'Import from Excel',
								func: function() {  $('#excel-file').click(); }
							}
						]
					},
					{
						name: 'Export',
						items: [
							{
								name: 'Export to Excel',
								func: exportSpreadsheet
							}
						]
					},
					{
						name: 'Add Row',
						func: scope.addEntityToSheet
					}
				];


			}
		}

	}
]);


/******************************************
 * Websanova.com
 *
 * Resources for web entrepreneurs
 *
 * @author          Websanova
 * @copyright       Copyright (c) 2012 Websanova.
 * @license         This mousestop jQuery plug-in is dual licensed under the MIT and GPL licenses.
 * @link            http://www.websanova.com
 * @github          http://github.com/websanova/mousestop
 * @version         Version 1.1.3
 *
 ******************************************/
	(function($)
	{
		$.fn.mousestop = function(func, settings)
		{
			settings = $.extend({}, $.fn.mousestop.defaultSettings, settings || {});

			return this.each(function()
			{
				var elem = $(this);

				var movement = false;

				var displayTimer = null
				var movementTimer = null;

				//only need this piece if there is a time limit on when the mouse stop can occur.
				if(settings.timeToStop != null)
				{
					var x = null;
					var y = null;

					var counter = 0;
					var counterMax = Math.ceil(settings.timeToStop / 100);

					elem
						.mouseover(function(e)
						{
							movement = true;

							//check if movement has stopped to a maximum time of 100*counterMax, after that event will not run at all unless you re-mouseover
							displayTimer = setInterval(function()
							{
								counter++;

								if(counter < counterMax)
								{
									if(!movement)
									{
										clearTimeout(displayTimer);//clear the timeout to avoid any funkiness

										//set the coordinates for the event to the ones from the document event
										e.pageX = x;
										e.pageY = y;

										if(func) func.apply(this, [e]);
									}
									//else do nothing, just iterate
								}else movement = false;//we can turn this off to avoid using the timeout in the mousemove
							}, 100)
						})
				}

				elem
					.mouseout(function(e)
					{
						//kill this timers incase it's still running
						clearTimeout(displayTimer);
						clearTimeout(movementTimer);

						counter = 0;//reset counter for when we mouseover again
						movement = false;//set movement back to false

						if(settings.onMouseout) settings.onMouseout.apply(this, [e]);//call our mouseout
					})
					.mousemove(function(e)
					{
						x = e.pageX;
						y = e.pageY;

						if(movement)//if we have moused over this will be on
						{
							//clear timer and set again, this will determine our "stop" which will occur if mouse is in same position for the delayToStop time or more milliseconds
							clearTimeout(movementTimer);
							movementTimer = setTimeout(function()
							{
								movement = false;
								if(settings.timeToStop == null && func) func.apply(this, [e]);
							}, settings.delayToStop);
						}
						else
						{
							if(settings.onStopMove) settings.onStopMove.apply(this, [e]);//call our mousemove - this is after the stop
							movement = true;
						}
					});
			});
		}

		$.fn.mousestop.defaultSettings =
		{
			timeToStop		: null,			// the amount of time the stop event has to run before it will not run at all anymore
			delayToStop		: '100', 		// the delay for what is considered a "stop"
			onMouseout		: null,			// function to run when we mouseout of our element
			onStopMove		: null			// function to run when we start moving again after the stop
		};
	})(jQuery);