'use strict';

var Models = Models || {};

var Placement = function Placement(id, name, siteName, startDate, endDate) {
	this.id = id;
	this.name = name;
	this.siteName = siteName;
	this.startDate = startDate;
	this.endDate = endDate;
};