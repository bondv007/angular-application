/**
 * Created by Liron.Tagger on 8/24/14.
 */
app.directive('mmAutoComplete', [function () {

    // string constants
    var TEXT_SEARCHING = 'Searching...';
    var TEXT_NORESULTS = 'No results found';

    return {
        restrict: 'E',
        scope: {
            selectedObject: '=',
            disableInput: '=',
            initialValue: '@',
            localData: '=',
            remoteUrlRequestFormatter: '=',
            remoteUrlResponseFormatter: '=',
            remoteUrlErrorCallback: '=',
            id: '@',
            placeholder: '@',
            remoteUrl: '@',
            remoteUrlDataField: '@',
            titleField: '@',
            descriptionField: '@',
            typeField: '@',
            idField: '@',
            groupTitle: '@',
            groupField: '@',
            imageField: '@',
            pause: '@',
            searchFields: '@',
            minlength: '@',
            matchClass: '@',
            clearSelected: '@',
            overrideSuggestions: '@',
            fieldRequired: '@',
            fieldRequiredClass: '@',
            inputChanged: '=',
            autoMatch: '@',
            showTip: '@',
            focusOut: '&',
            focusIn: '&',
            titleManipulator: '&'
        },
        template: '<div class="mm-auto-complete" ng-style="{\'width\': wrapperWidth, \'max-height\': wrapperHeight}"><angucomplete-alt /></div>',
        controller: ['$scope', function ($scope) {
        }],
        link: function (scope, elem, attrs) {
            // set strings for "Searching..." and "No results"
            scope.searchBoxClass = attrs.searchBoxClass ?  attrs.searchBoxClass + ' geo-search' : 'geo-search';
            scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
            scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
            scope.wrapperWidth = attrs.mmWidth ? attrs.mmWidth + 'px' : '272px';
            scope.wrapperHeight = attrs.mmHeight ? attrs.mmHeight + 'px' : '300px';
            scope.resultsWidth = attrs.mmResultsWidth ? attrs.mmResultsWidth + 'px' : scope.wrapperWidth;
            scope.tipWidth = attrs.mmResultsWidth ? attrs.mmResultsWidth - 2 + 'px' : '270px';
            scope.maxResults = attrs.maxResults ? attrs.maxResults : 9;
            scope.maxEntityResults = attrs.maxEntityResults ? attrs.maxEntityResults : 3;
            scope.showGroupBy = attrs.showGroupBy !== undefined;
            scope.showGeoGrouping = attrs.showGeoGrouping !== undefined;
            scope.parseSearchTerm = attrs.parseSearchTerm !== undefined;
            scope.groupField = (attrs.groupField !== undefined) ? attrs.groupField : 'type';
            scope.idField = (attrs.idField !== undefined) ? attrs.groupField : 'id';
            scope.groupTitle = (attrs.groupTitle !== undefined) ? attrs.groupTitle : 'groupTitle';
            scope.useMockData = attrs.useMockData !== undefined;
            scope.useTitleManipulator = attrs.useTitleManipulator !== undefined;
            scope.clearSelected = (attrs.clearSelected !== undefined) ? scope.clearSelected : true;
            scope.showTip = scope.showTip == 'true';
            scope.tipFocus = false;

            if(scope.showGroupBy){
              scope.maxResults = 25;
              scope.searchBoxClass = 'global-search';
            }
            scope.mock = {
              ad: [
                {id: 1, name: "ad1"},
                {id: 2, name: "ad2"},
                {id: 3, name: "ad3"}
              ],
              campaign: [
                {id: 1, name: "campaign1"},
                {id: 2, name: "campaign2"}
              ],
              account: [
                {id: 'HRA1HF', name: "account1"},
                {id: 'HRA1HF', name: "account2"},
                {id: 'HRA1HF', name: "account3"},
                {id: 'HRA1HF', name: "account4"},
                {id: 'HRA1HF', name: "account5"}
              ]
            }
        }
    }
}]
);