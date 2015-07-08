/*
 console.log(enums.verticals.getId("Retail")); // 17
 console.log(enums.verticals.getName(20));    // Tech_Internet


 objects must be in the form of:
 {id: , name: }
 */
app.constant('infraEnums',
	{
		buttonRelationToRowType: {
			any: "any",
			single: "single",
			multiple: "multiple",
			none: "none"
		},
		controlTypes: {
			textbox : 'TextBox',
			checkbox : 'CheckBox',
			checklist : 'CheckList',
			radiobutton : 'RadioButton',
			dropdown: 'DropDown',
			selectlist: 'SelectList',
			toggle: 'Toggle',
			minisection: 'MiniSection'
		}
	});