Central
--------

	receives a centralDataObject array of dataObjects
 	each dataObject is of a type:

	{
		type: '',  																	//entity Name like placement
	 	centralActions: [														//all actions to be rendered when the list is selected
			action: {																	//(the actions will work on the selected items and the list)
				name: '', 															//the function form will be like -> function(list, selectedItems)
				func: funcRef 													//
			}], 																			//
			isEditable: true,													//will create an editable screen with the column
			editButtons: [{ 													//the editable screen buttons
				name: '', actions: [										//
        	{name: '', func: funcRef, nodes: []}	//
        ], views: [															//
					{name: '',  ref: '.', nodes: []}			//
      	] 																			//
      }], 																			//
      hideAddButton: true,											//hide the add button in the central
      useMock: true,  													//or false - will use to set mock data to the central with
      mockList: centralMockList, 								//the mocked list
      isDraggable,															//can be dragged
      isDropable,																//can be dropped to
      searchColumns,                            //From the entityMetaData file, enables deciding which fields to filter by
      dataManipulator,													//A function to be called after the data returned from the server
      																					//used to manipulate and change the list
      addSubEntity: {														//used to add a new related entity
      	index: 1,																//sets the index of the new entity in the central objects array
      	text: ''																//sets the button text
      },																				//
      filters:[{																//filters to be passed in the rest request
      	key: '',																//the filter key
				value: ''																//the filter value
      }],																				//
      visibleColumns: [],                       //array as user settings for visible columns
      hideRowCheckbox: true,										//hides all row checkboxes in central
      disableEditButton: false,									//disable EDIT btn
      isEditMultiple: true,											//is edit multiple entities supported
	}

	one row example:

	{
		type: 'Placement',
		centralActions: [
			{ name: 'Add', func: addPlacement },
			{ name: 'Delete', func: deletePlacements },
			{ name: 'Update', func: updatePlacement }
		],
		isEditable: true,
		editButtons: [],
		useMock: true,
		mockList: placements,
		isDraggable: true,
		dataManipulator: placementManipulator
	}