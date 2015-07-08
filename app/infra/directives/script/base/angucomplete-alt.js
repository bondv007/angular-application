/* Modified By: Rotem Perets
 * Date: 11/11/2014
 * Comment: This control originated from - https://github.com/ghiden/angucomplete-alt
 *          We decided to use it as an in-solution module rather than bower component
 *          since we needed to overwrite some of the behavior and wrap it in our
 *          owen directive.
 *
 * angucomplete-alt
 * Autocomplete directive for AngularJS
 * This is a fork of Daryl Rowland's angucomplete with some extra features.
 * By Hidenari Nozaki
 */

/*! Copyright (c) 2014 Hidenari Nozaki and contributors | Licensed under the MIT license */

'use strict';

angular.module('angucomplete-alt', [])
    .directive('angucompleteAlt', ['$q', '$parse', '$sce', '$timeout', 'searchHelper', 'mmRest', 'entityMetaData', '$state', 'searchParser',
      function ($q, $parse, $sce, $timeout, searchHelper, mmRest, entityMetaData, $state, searchParser) {
        // keyboard events
        var KEY_DW = 40;
        var KEY_RT = 39;
        var KEY_UP = 38;
        var KEY_LF = 37;
        var KEY_ES = 27;
        var KEY_EN = 13;
        var KEY_BS = 8;
        var KEY_DEL = 46;
        var KEY_TAB = 9;

        var MIN_LENGTH = 3;
        var PAUSE = 500;
        var BLUR_TIMEOUT = 200;
        var MAX_ITEMS_IN_DROPDOWN = 14;

        // string constants
        var REQUIRED_CLASS = 'autocomplete-required';

        var supportedEntities = [
          {type: 'asset', title: 'Assets'},
          {type: 'ad', title: 'Ads'},
          {type: 'placement', title: 'Placements'},
          {type: 'campaign', title: 'Campaigns'},
          {type: 'site', title: 'Sites'},
          {type: 'advertiser', title: 'Advertisers'},
          {type: 'account', title: 'Accounts'},
          {type: 'user', title: 'Users'}
        ];

        return {
          restrict: 'EA',
          require: '^?form',
          templateUrl: 'infra/directives/views/mmAutoComplete.html',
          link: function (scope, elem, attrs, ctrl) {
            var inputField = elem.find('input');
            var minlength = MIN_LENGTH;
            var searchTimer = null;
            var hideTimer;
            var requiredClassName = REQUIRED_CLASS;
            var responseFormatter;
            var validState = null;
            var httpCanceller = null;
            var dd = elem[0].querySelector('.angucomplete-dropdown');
            var isScrollOn = false;
            var mousedownOn = null;
            var unbindInitialValue;

            var mousedownHandler = function (event) {
              mousedownOn = event.target.id;
            };

            elem.on('mousedown', mousedownHandler);

            scope.inputClass = 'autocomplete-box';
            scope.currentIndex = null;
            scope.searching = false;
            scope.searchStr = scope.initialValue;
            unbindInitialValue = scope.$watch('initialValue', function (newval, oldval) {
              if (newval && newval.length > 0) {
                scope.searchStr = scope.initialValue;
                handleRequired(true);
                unbindInitialValue();
              }
            });

            scope.$on('angucomplete-alt:clearInput', function (event, elementId) {
              if (!elementId) {
                scope.searchStr = null;
                clearResults();
              }
              else { // id is given
                if (scope.id === elementId) {
                  scope.searchStr = null;
                  clearResults();
                }
              }
            });

            // for IE8 quirkiness about event.which
            function ie8EventNormalizer(event) {
              return event.which ? event.which : event.keyCode;
            }

            function callOrAssign(value) {
              if (typeof scope.selectedObject === 'function') {
                scope.selectedObject(value);
              }
              else {
                scope.selectedObject = value;
              }

              if (value) {
                handleRequired(true);
              }
              else {
                handleRequired(false);
              }
            }

            function callFunctionOrIdentity(fn) {
              return function (data) {
                return scope[fn] ? scope[fn](data) : data;
              };
            }

            function setInputString(str) {
              callOrAssign({originalObject: str});

              if (scope.clearSelected) {
                scope.searchStr = null;
              }
              clearResults();
            }

            function extractTitle(data) {
              // split title fields and run extractValue for each and join with ' '
              return scope.titleField.split(',')
                  .map(function (field) {
                    return extractValue(data, field);
                  })
                  .join(' ');
            }

            function extractValue(obj, key) {
              var keys, result;
              if (key) {
                keys = key.split('.');
                result = obj;
                keys.forEach(function (k) {
                  result = result[k];
                });
              }
              else {
                result = obj;
              }
              return result;
            }

            function findMatchString(target, str) {
              var result, matches, re = new RegExp(str, 'i');
              if (!target) {
                return;
              }
              matches = target.match(re);
              if (matches) {
                result = target.replace(re,
                    '<span class="' + scope.matchClass + '">' + matches[0] + '</span>');
              }
              else {
                result = target;
              }
              return $sce.trustAsHtml(result);
            }

            function handleRequired(valid) {
              validState = scope.searchStr;
              if (scope.fieldRequired && ctrl) {
                ctrl.$setValidity(requiredClassName, valid);
              }
            }

            function keyupHandler(event) {
              var which = ie8EventNormalizer(event);
              if (which === KEY_LF || which === KEY_RT) {
                // do nothing
                return;
              }

              if (which === KEY_UP || which === KEY_EN) {
                event.preventDefault();
              }
              else if (which === KEY_DW) {
                event.preventDefault();
                if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
                  initResults();
                  scope.searching = true;
                  searchTimerComplete(scope.searchStr);
                }
              }
              else if (which === KEY_ES) {
                scope.searchStr = null;
                clearResults();
                scope.$apply(function () {
                  inputField.val(scope.searchStr);
                });
              }
              else {
                if (!scope.searchStr || scope.searchStr === '') {
                  scope.showDropdown = false;
                  scope.inputClass = 'autocomplete-box';
                } else if (scope.searchStr.length >= minlength) {
                  initResults();

                  if (searchTimer) {
                    $timeout.cancel(searchTimer);
                  }

                  scope.searching = true;

                  searchTimer = $timeout(function () {
                    searchTimerComplete(scope.searchStr);
                  }, scope.pause);
                }

                if (validState && validState !== scope.searchStr) {
                  callOrAssign(undefined);
                }
              }
            }

            function handleOverrideSuggestions(event) {
              if (scope.overrideSuggestions) {
                if (!(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
                  event.preventDefault();
                  setInputString(scope.searchStr);
                }
              }
            }

            function dropdownRowOffsetHeight(row) {
              var css = getComputedStyle(row);
              return row.offsetHeight +
                  parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
            }

            function dropdownHeight() {
              return dd.getBoundingClientRect().top +
                  parseInt(getComputedStyle(dd).maxHeight, 10);
            }

            function dropdownRow() {
              return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
            }

            function dropdownRowTop() {
              return dropdownRow().getBoundingClientRect().top -
                  (dd.getBoundingClientRect().top +
                      parseInt(getComputedStyle(dd).paddingTop, 10));
            }

            function dropdownScrollTopTo(offset) {
              dd.scrollTop = dd.scrollTop + offset;
            }

            function updateInputField() {
              var current = scope.results[scope.currentIndex];
              if (scope.matchClass) {
                inputField.val(extractTitle(current.originalObject));
              }
              else {
                inputField.val(current.title);
              }
            }

            function keydownHandler(event) {
              var which = ie8EventNormalizer(event);
              var row = null;
              var rowTop = null;

              if (which === KEY_EN && scope.results) {
                if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
                  event.preventDefault();
                  scope.selectResult(scope.results[scope.currentIndex]);
                } else {
                  handleOverrideSuggestions(event);
                  clearResults();
                }
                scope.$apply();
              } else if (which === KEY_DW && scope.results) {
                event.preventDefault();
                if ((scope.currentIndex + 1) < scope.results.length && scope.showDropdown) {
                  scope.$apply(function () {
                    scope.currentIndex++;
                    updateInputField();
                  });

                  if (isScrollOn) {
                    row = dropdownRow();
                    if (dropdownHeight() < row.getBoundingClientRect().bottom) {
                      dropdownScrollTopTo(dropdownRowOffsetHeight(row));
                    }
                  }
                }
              } else if (which === KEY_UP && scope.results) {
                event.preventDefault();
                if (scope.currentIndex >= 1) {
                  scope.$apply(function () {
                    scope.currentIndex--;
                    updateInputField();
                  });

                  if (isScrollOn) {
                    rowTop = dropdownRowTop();
                    if (rowTop < 0) {
                      dropdownScrollTopTo(rowTop - 1);
                    }
                  }
                }
                else if (scope.currentIndex === 0) {
                  scope.$apply(function () {
                    scope.currentIndex = -1;
                    inputField.val(scope.searchStr);
                  });
                }
              } else if (which === KEY_TAB && scope.results && scope.results.length > 0 && scope.showDropdown) {
                // selecting the first result
                if (scope.currentIndex === -1) {
                  scope.selectResult(scope.results[0]);
                }
                else {
                  // scope.currentIndex >= 0
                  scope.selectResult(scope.results[scope.currentIndex]);
                }
                scope.$apply();
              }
            }

            function httpSuccessCallbackGen(data, str, originalSearchTerm) {
              scope.searching = false;
              processResults(data, str, originalSearchTerm);
            }

            function httpErrorCallback(errorRes, status, headers, config) {
              if (status !== 0) {
                if (scope.remoteUrlErrorCallback) {
                  scope.remoteUrlErrorCallback(errorRes, status, headers, config);
                }
                else {
                  if (console && console.error) {
                    console.error('http error');
                  }
                }
              }
            }

            function cancelHttpRequest() {
              if (httpCanceller) {
                httpCanceller.resolve();
              }
            }

            function getRemoteResults(originalSearchTerm) {
              var str = searchParser.parseSearchTerm(originalSearchTerm);

              if (scope.useMockData) {
                httpSuccessCallbackGen(scope.mock, str);
              } else {
                cancelHttpRequest();
                httpCanceller = $q.defer();
                var params = {timeout: httpCanceller.promise};
                mmRest.EC2Restangular.all('search')
                    .withHttpConfig({timeout: httpCanceller.promise, cache: false})
                    .customGET(scope.remoteUrl + '?' + str )
                    .then(function (data) {
                      httpSuccessCallbackGen(data, str, originalSearchTerm);
                    }, function (err) {
                      httpErrorCallback(err);
                    });
              }
            }

            function prepareData(data) {
              var finalData = [];
              finalData.metadata = { entityTypes: [], entitiesMetadata: {}};
              supportedEntities.forEach(function (entity) {
                var entityData = data[entity.type];
                if (entityData && entityData.entities && entityData.entities.length > 0) {
                  finalData.metadata.entityTypes.push(entity.type);
                  finalData.metadata.entitiesMetadata[entity.type] = entityData.total;
                }
              });

              setEntityCounter(finalData);

              supportedEntities.forEach(function (entity) {
                var entityData = data[entity.type];
                if (entityData && entityData.entities && entityData.entities.length > 0) {
                  var totalItems = entityData.total;
                  for (var i = 0; i < entityData.entities.length && i < finalData.metadata.entitiesMetadata[entity.type]; i++) {
                    var item = entityData.entities[i];
                    if(item){
                      item.title = entity.title;
                      item.groupTitle = entity.type;
                      item.total = totalItems;
                      item.additionalIdData = getAdditionalId(item, entity.type);
                      finalData.push(item);
                    }
                  }
                }
              });

              return finalData;
            }

            function prepareGeoData(data){
              var finalData = [];
              var typeCounter = 0;
              var types = {}

              data.forEach(function(item){
                if(!types[item.type]){
                  typeCounter++;
                  types[item.type] = [];
                }
                types[item.type].push(item);
              });

              var itemsPerType = 10 / typeCounter;

              for (var key in types){
                for(var i = 0; i <= itemsPerType && types[key].length > i; i++){
                  var itemToAdd = types[key][i];
                  switch(itemToAdd.type){
                    case 'areacode':
                      itemToAdd.type = 'areaCode';
                      itemToAdd.name = itemToAdd.id.toString();
                      break;
                    case 'dma':
                      itemToAdd.type = 'nielsen';
                      break;
                  }

                  finalData.push(itemToAdd);
                }
              }

              return finalData;
            }

            function getAdditionalId(entity, type){
              var additionalId = null;
              switch (type){
                case "placement":
                    additionalId = {name: "campaignId", id: entity.campaignId};
                  break;
              }
              return additionalId;
            }

            function setEntityCounter(finalData){
              var numberOfTypes = finalData.metadata.entityTypes.length;
              var itemsPerType = parseInt(MAX_ITEMS_IN_DROPDOWN/finalData.metadata.entityTypes.length);

              for (var i = 0; i < finalData.metadata.entityTypes.length; i++) {
                var type = finalData.metadata.entityTypes[i];
                if(finalData.metadata.entitiesMetadata[type] > itemsPerType){
                  finalData.metadata.entitiesMetadata[type] = itemsPerType;
                } else {
                  itemsPerType += parseInt((itemsPerType - finalData.metadata.entitiesMetadata[type])/(numberOfTypes));
                }
                numberOfTypes--;
              }
            }

            function clearResults() {
              scope.clear = true;
              scope.showDropdown = false;
              scope.results = [];
              if (dd) {
                dd.scrollTop = 0;
              }
              scope.inputClass = 'autocomplete-box';
            }

            function initResults() {
              scope.showDropdown = true;
              scope.currentIndex = -1;
              scope.results = [];
              scope.inputClass = 'autocomplete-box-open';
            }

            function getLocalResults(str) {
              var i, match, s, value,
                  searchFields = scope.searchFields.split(','),
                  matches = [];

              for (i = 0; i < scope.localData.length; i++) {
                match = false;

                for (s = 0; s < searchFields.length; s++) {
                  value = extractValue(scope.localData[i], searchFields[s]) || '';
                  match = match || (value.toLowerCase().indexOf(str.toLowerCase()) >= 0);
                }

                if (match) {
                  matches[matches.length] = scope.localData[i];
                }
              }

              scope.searching = false;
              processResults(matches, str);
            }

            function checkExactMatch(result, obj, str) {
              for (var key in obj) {
                if (obj[key].toLowerCase() === str.toLowerCase()) {
                  scope.selectResult(result);
                  return;
                }
              }
            }

            function searchTimerComplete(str) {
              // Begin the search
              if (str.length < minlength) {
                return;
              }
              if (scope.localData) {
                scope.$apply(function () {
                  getLocalResults(str);
                });
              }
              else {
                getRemoteResults(str);
              }
            }

            function processResults(responseData, str, originalSearchTerm) {
              var i, description, id, image, text, total, additionalId, additionalIdName,
                  toolTip, formattedText, formattedDesc, type, groupTitle, tempArray;

              if (scope.showGroupBy) {
                responseData = prepareData(responseData);
              } else if (scope.showGeoGrouping){
                responseData = prepareGeoData(responseData);
              }

              if (responseData && responseData.length > 0) {
                tempArray = [];

                for (i = 0; i < responseData.length && i < scope.maxResults; i++) {
                  if (scope.titleField && scope.titleField !== '') {
                    if (scope.useTitleManipulator) {
                      text = formattedText = scope.titleManipulator({data: responseData[i]});
                    } else {
                      text = formattedText = extractTitle(responseData[i]);
                    }
                  }
                  toolTip = text;

                  if (scope.typeField && scope.typeField !== '') {
                    type = responseData[i][scope.typeField];
                  }

                  id = responseData[i][scope.idField];
                  groupTitle = responseData[i][scope.groupTitle];
                  total = responseData[i]['total'];
                  if(responseData[i]['additionalIdData'] != null){
                    additionalId = responseData[i]['additionalIdData'].id;
                    additionalIdName = responseData[i]['additionalIdData'].name;
                  } else {
                    additionalId = null;
                    additionalIdName = null;
                  }

                  description = '';
                  if (scope.descriptionField) {
                    description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
                  }

                  image = '';
                  if (scope.imageField) {
                    image = extractValue(responseData[i], scope.imageField);
                  }

                  if (scope.matchClass) {
                    var matchString = (originalSearchTerm) ? originalSearchTerm : str;
                    formattedText = findMatchString(text, matchString);
                    formattedDesc = findMatchString(description, matchString);
                  }

                  tempArray[tempArray.length] = {
                    title: formattedText,
                    toolTip: toolTip,
                    description: formattedDesc,
                    image: image,
                    type: type,
                    id: id,
                    total: total,
                    additionalId: additionalId,
                    additionalIdName: additionalIdName,
                    groupTitle: groupTitle,
                    originalObject: responseData[i]
                  };

                  if (scope.autoMatch) {
                    checkExactMatch(tempArray[tempArray.length - 1],
                        {title: text, desc: description || ''}, scope.searchStr);
                  }
                }
                scope.currentIndex = 0;
                scope.results = [];
                if (scope.showGroupBy) {
                  generateGroupDataSource(tempArray);
                } else {
                  scope.results = tempArray;
                }
              } else {
                scope.results = [];
              }
            }

            function generateGroupDataSource(tempArray) {
              if (tempArray) {
                var groups = {};
                for (var i = 0; i < tempArray.length; i++) {
                  var name = tempArray[i][scope.groupField];
                  if (!groups[name]) {
                    groups[name] = [];
                  }
                  groups[name].push(tempArray[[i]]);
                }
                scope.results = groups;
              }
            }

            scope.onFocusHandler = function () {
              scope.searchStr = null;
              if (scope.focusIn) {
                scope.focusIn();
              }
            };

            scope.hideResults = function (event) {
              if (mousedownOn === scope.id + '_dropdown') {
                mousedownOn = null;
              }
              else {
                hideTimer = $timeout(function () {
                  clearResults();
                  scope.searchStr = scope.initialValue;
                  scope.$apply(function () {
                    inputField.val(scope.searchStr);
                  });
                }, BLUR_TIMEOUT);
                cancelHttpRequest();

                if (scope.focusOut) {
                  scope.focusOut();
                }
              }
            };

            scope.resetHideResults = function () {
              if (hideTimer) {
                $timeout.cancel(hideTimer);
              }
            };

            scope.hoverRow = function (index) {
              scope.currentIndex = index;
            };

            scope.selectResult = function (result) {
              // Restore original values
              if (result && scope.matchClass) {
                result.title = extractTitle(result.originalObject);
                result.description = extractValue(result.originalObject, scope.descriptionField);
              }

              if (scope.clearSelected) {
                scope.searchStr = scope.initialValue;
              }
              else {
                scope.searchStr = result.title;
              }
              callOrAssign(result);
              clearResults();
            };

            scope.inputChangeHandler = function (str) {
              if (str.length < minlength) {
                clearResults();
              } else {
                scope.tipFocus = false;
              }
              if (scope.inputChanged) {
                str = scope.inputChanged(str);
              }
              return str;
            };

            scope.goToCentral = function (type, searchTerm){
              searchTerm = (searchTerm.indexOf(':') > -1) ? searchTerm.split(':')[1] : searchTerm;
              scope.$root.centralSearchTerm = searchTerm.trim();
              $state.go(entityMetaData[type].listPageURL);
            }

            scope.goToEntity = function (id, type, additionalId, additionalIdName) {
              var params = {};
              params[entityMetaData[type].foreignKey] = id;
              if(additionalId != null && additionalIdName != null){
                params[additionalIdName] = additionalId;
              }
              $state.go(entityMetaData[type].editPageURL, params);
            }

            // check required
            if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
              requiredClassName = scope.fieldRequiredClass;
            }

            // check min length
            if (scope.minlength && scope.minlength !== '') {
              minlength = scope.minlength;
            }

            // check pause time
            if (!scope.pause) {
              scope.pause = PAUSE;
            }

            // check clearSelected
            if (!scope.clearSelected) {
              scope.clearSelected = false;
            }

            // check override suggestions
            if (!scope.overrideSuggestions) {
              scope.overrideSuggestions = false;
            }

            // check required field
            if (scope.fieldRequired && ctrl) {
              // check initial value, if given, set validitity to true
              if (scope.initialValue) {
                handleRequired(true);
              }
              else {
                handleRequired(false);
              }
            }


            // register events
            inputField.on('keydown', keydownHandler);
            inputField.on('keyup', keyupHandler);

            // set response formatter
            responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

            scope.$on('$destroy', function () {
              // take care of required validity when it gets destroyed
              handleRequired(true);

              // Clear event handlers
              inputField.off('keydown', keydownHandler);
              inputField.off('keyup', keyupHandler);
              elem.on('mousedown', mousedownHandler);
            });

            // set isScrollOn
            $timeout(function () {
              var css = getComputedStyle(dd);
              isScrollOn = css.maxHeight && css.overflowY === 'auto';
            });
          }
        };
      }])
    .service('searchParser', function(){

      var COMMA = ',';
      var QUOTES = '"';
      var ASTERISK = '*';
      var COLON = ':';
      var AND = 'AND';

      var supportedEntityTypes = [
        'asset', 'assets',
        'ad', 'ads',
        'placement', 'placements',
        'campaign', 'campaigns',
        'site', 'sites',
        'advertiser', 'advertisers',
        'account', 'accounts',
        'user', 'users'
      ];

      var supportedEntitiesMap = {
         asset: 'Asset' ,
         assets: 'Asset' ,
         ad: 'Ad' ,
         ads: 'Ad' ,
         placement: 'Placement' ,
         placements: 'Placement' ,
         campaign: 'Campaign' ,
         campaigns: 'Campaign' ,
         site: 'Site' ,
         sites: 'Site' ,
         advertiser: 'Advertiser' ,
         advertisers: 'Advertiser' ,
         account: 'Account' ,
         accounts: 'Account' ,
         user: 'User' ,
         users: 'User'
    };

      function parseSearchTerm(searchTerm){
        var typeData = null, parts = null;
        if(searchTerm.indexOf(COLON) > -1){
          parts = searchTerm.split(COLON);
          var suspectedEntity = parts.shift().toLowerCase();
          if(supportedEntityTypes.indexOf(suspectedEntity) > -1){
            typeData = 'type=' + supportedEntitiesMap[suspectedEntity];
            searchTerm = parts.toString().trim();
            parts.length = 0;
          }
        }

        var asterisk = ASTERISK;
        if(searchTerm.indexOf(QUOTES) > -1 && searchTerm.split(QUOTES).length > 2){
          asterisk = '';
        } else {
          if(searchTerm.indexOf(COMMA) > -1){
            parts = searchTerm.split(COMMA);
            searchTerm = '';
            parts.forEach(function(part){
              searchTerm += AND + ' ' + part.trim() + ' ';
            });
            searchTerm = searchTerm.substring(4, searchTerm.length + 1).trim();
          }
        }

        var finalSearchTerm = (typeData !== null) ? typeData + '&q=' + searchTerm + asterisk : '&q=' + searchTerm + asterisk;
        return encodeURI(finalSearchTerm);
      }

      return {
        parseSearchTerm: parseSearchTerm
      }
    });
