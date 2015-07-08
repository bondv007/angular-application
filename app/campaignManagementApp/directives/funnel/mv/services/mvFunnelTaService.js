/**
 * Created by Ofir.Fridman on 3/17/2015.
 */
'use strict';

app.service('mvFunnelTaService', [
  function () {
    var structure = [["A", "B"], ["C"]];
    var listView = [
      {
        decisionId: "A",
        optionName: "From UK",
        distinctNumOfAudiences: 153,
        items: [
          {id: 0, name: "Ayr"},
          {id: 1, name: "Aberdeen"},
          {id: 2, name: "2"},
          {id: 3, name: "3"},
          {id: 4, name: "4"},
          {id: 5, name: "5"},
          {id: 6, name: "6"},
          {id: 7, name: "7"},
          {id: 8, name: "8"},
          {id: 9, name: "9"},
          {id: 11, name: "10"},
          {id: 12, name: "10"},
          {id: 13, name: "10"},
          {id: 14, name: "10"},
          {id: 15, name: "10"},
          {id: 16, name: "10"},
          {id: 17, name: "10"},
          {id: 18, name: "10"},
          {id: 19, name: "10"},
          {id: 20, name: "10"},
          {id: 21, name: "10"},
          {id: 22, name: "10"},
          {id: 23, name: "10"},
          {id: 24, name: "10"}
        ]
      },
      {
        decisionId: "B",
        optionName: "Printer Model",
        distinctNumOfAudiences: 7,
        items: [
          {id: 0, name: "iPrinter24"},
          {id: 1, name: "iPrinter12"}
        ]
      },
      {
        decisionId: "C",
        optionName: "Gender",
        distinctNumOfAudiences: 2,
        items: [
          {id: 0, name: "Male"},
          {id: 1, name: "Female"}
        ]
      }
    ];
    var flatView = {
      decisionId: "B",
      optionName: "Printer Model",
      distinctNumOfAudiences: 7,
      items: [
        {id: 0, name: "iPrinter24"},
        {id: 1, name: "iPrinter12"}
      ]
    };
    var mapOfDropDownIDToOptionName = {};
    var lastSelectedId;

    function getListView(targetAudienceId) {
      setIdToDropDown(listView, null, targetAudienceId);
      return listView;
    }

    function getFlatView(targetAudienceId) {
      setIdToDropDown(null, flatView, targetAudienceId);
      return flatView;
    }

    function setIdToDropDown(listView, flatView, targetAudienceId) {
      if (listView) {
        listView.forEach(function (dropDown, index) {
          dropDown.mmId = targetAudienceId + '_mv_dropDown_list_' + index;
          mapOfDropDownIDToOptionName[dropDown.mmId] = "<span class='dropDownDecisionName'>" + dropDown.optionName + " (" + dropDown.distinctNumOfAudiences + ")" + "</span>";
        });
      }
      else {
        flatView.mmId = targetAudienceId + '_mv_dropDown_flat_';
        mapOfDropDownIDToOptionName[flatView.mmId] = "<span class='dropDownDecisionName'>" + flatView.optionName + " (" + flatView.distinctNumOfAudiences + ")" + "</span>";
      }
    }

    function updateDropDownLabel(dropDownLabel) {
      dropDownLabel.value = mapOfDropDownIDToOptionName[dropDownLabel.dropDownId];
      dropDownLabel.value += "<span class='dropDownSelectedItem'>" + " " + dropDownLabel.modelText + "</span>";
    }

    function disableEnableDropDownDecision(listView) {
      if (listView) {
        disableAllDropDowns(listView);
        if (isOneOfTheDropDownSelected(listView)) {
          enableAllSelectedDropDown(listView);
        }
        else {
          enableAllParentDropDown(listView);
        }
      }
    }

    function disableAllDropDowns(listView) {
      listView.forEach(function (dropDown) {
        dropDown.disable = true;
      });
    }

    function isOneOfTheDropDownSelected(listView) {
      var isOneDropDownSelected = false;
      for (var i = 0; i < listView.length; i++) {
        if (isDropDownSelected(listView[i])) {
          isOneDropDownSelected = true;
          break;
        }
      }
      return isOneDropDownSelected;
    }

    function enableAllParentDropDown(listView) {
      listView.forEach(function (dropDown) {
        structure.forEach(function (item) {
          if (dropDown.decisionId == item[0]) {
            dropDown.disable = false;
          }
        });
      });
    }

    function isDropDownSelected(dropDown) {
      return dropDown.selected != undefined && dropDown.selected != null;
    }

    function enableAllSelectedDropDown(listView) {
      listView.forEach(function (dropDown, index) {
        if (isDropDownSelected(dropDown)) {
          dropDown.disable = false;
          var nextDropDown = listView[index + 1];
          if (nextDropDown && !isDropDownSelected(nextDropDown) && isFromTheSameGroup(dropDown, nextDropDown)) {
            nextDropDown.disable = false;
          }
        }
      });
    }

    function isFromTheSameGroup(currentDropDown, nextDropDown) {
      var isFromSameGroup = false;
      if (currentDropDown && nextDropDown) {
        structure.forEach(function (arr) {
          arr.forEach(function (id, index) {
            if (id == currentDropDown.decisionId && arr[index + 1] == nextDropDown.decisionId) {
              isFromSameGroup = true;
            }
          });
        });

      }
      return isFromSameGroup;
    }

    function isListView(mvFlatOrDropDownView) {
      return mvFlatOrDropDownView.selected;
    }

    function getDecisionIds(targetAudience){
      return _.flatten(targetAudience);
    }

    return {
      getListView: getListView,
      updateDropDownLabel: updateDropDownLabel,
      disableEnableDropDownDecision: disableEnableDropDownDecision,
      isListView: isListView,
      getFlatView: getFlatView,
      getDecisionIds:getDecisionIds
    };
  }]);
