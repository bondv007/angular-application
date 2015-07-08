/**
 * Created by Ofir.Fridman on 8/12/14.
 */
function dgUnitTestHelper(dgConstants){
	function isAllChildAndSubChildSelected(selectedSubGroup){
		var isAllSelected = true;
		for (var i = 0; i < selectedSubGroup.subContainers.length; i++) {
			if(selectedSubGroup.subContainers[i].selected){
				if(selectedSubGroup.subContainers[i].type == dgConstants.strAdContainer){
					isAllSelected = isAllChildAndSubChildSelected(selectedSubGroup.subContainers[i]);
					if(!isAllSelected){
						return;
					}
				}
			}else
			{
				return false;
			}
		}
		return isAllSelected;
	}

	function isAllChildAndSubChildUnSelected(unSelectedSubGroup){
		var isAllUnSelected = true;
		for (var i = 0; i < unSelectedSubGroup.subContainers.length; i++) {
			if(!unSelectedSubGroup.subContainers[i].selected){
				if(unSelectedSubGroup.subContainers[i].type == dgConstants.strAdContainer){
					isAllUnSelected = isAllChildAndSubChildUnSelected(unSelectedSubGroup.subContainers[i]);
					if(!isAllUnSelected){
						return;
					}
				}
			}else
			{
				return false;
			}
		}
		return isAllUnSelected;
	}
	return {
		isAllChildAndSubChildSelected:isAllChildAndSubChildSelected,
		isAllChildAndSubChildUnSelected:isAllChildAndSubChildUnSelected
	}

}


