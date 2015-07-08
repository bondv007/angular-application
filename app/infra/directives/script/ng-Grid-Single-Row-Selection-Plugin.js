function ngGridSingleSelectionPlugin() {
	var self = this;
	self.lastSelectedRow = null;
	self.selectedRowItems = [];
	self.allRowItems = [];
	self.isAllRowSelected = false;
	self.grid = null;
	self.scope=null;
	self.init = function (scope, grid, services) {
		self.services = services;
		self.grid = grid;
		self.scope=scope;
		self.initNeddedProprties();
		grid.$viewport.on('mousedown', self.onRowMouseDown);
		grid.$headerContainer.on('mousedown', self.onHeaderMouseDown);
	};
	//init properties
	self.initNeddedProprties = function () {
		self.grid.config.multiSelect = true;
		self.grid.config.showSelectionCheckbox = true;
		self.grid.config.selectWithCheckboxOnly = true;
	}
	self.onRowMouseDown = function (event) {
		var targetRow = $(event.target).closest('.ngRow');
		var rowScope = angular.element(targetRow).scope();
		if (rowScope) {
			var row = rowScope.row;
			if (event.target.type !== 'checkbox') {
				if (self.isAllRowSelected) {
					self.selectedRowItems = self.grid.rowCache;
				}
				angular.forEach(self.selectedRowItems,function (rowItem) {
				});
				if (!row.selected) {
					self.scope.$emit('ngGridEventRowSeleted',row);
				}
			}
			else {
				if (!row.selected) {
					self.selectedRowItems.push(row);
					self.scope.$emit('ngGridEventRowSeleted',row);

				}
			}
		}
	};

	self.onHeaderMouseDown = function(event) {
		if (event.target.type === 'checkbox') {
			if (!event.target.checked) {
				self.isAllRowSelected = true;
			} else {
				self.isAllRowSelected = false;
			}
		}
	}

}