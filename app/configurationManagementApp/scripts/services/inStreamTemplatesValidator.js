/**
 * Created by roi.levy on 1/7/15.
 */
app.service('inStreamTemplatesValidator', [function(){

	var validateBeforeSave = function(template, errorObj){
		var isValid = true;
		if(!validateName(template.name, errorObj)){
			isValid = false;
		}
		if(!validateDescription(template.description, errorObj)){
			isValid = false;
		}
		if(!validateApplicableAdFormat(template.applicableAdFormats, errorObj)){
			isValid = false;
		}
		if(!template.customXsltFileId && !template.baseTemplateId){
			isValid = false;
			errorObj.noCustomOrBase = "Choose base or custom XSLT";
		}
		return isValid;
	}

	function validateName(name, errorObj){
		errorObj.nameMsg = '';
		if(!name){
			errorObj.nameMsg = 'inStreamTemplateEmptyNameError';
			return false;
		}
		if(name.length > 100){
			errorObj.nameMsg = 'inStreamTemplateLongNameError';
			return false;
		}
		return true;
	}

	function validateDescription(text, errorObj){
		errorObj.descMsg = '';
		if(!text || text.length < 5){
			errorObj.descMsg = 'inStreamTemplateDescriptionError';
			return false;
		}
		return true;
	}

	function validateApplicableAdFormat(adFormats, errorObj){
		errorObj.adFormatMsg = '';
		if(!adFormats || adFormats.length === 0){
			errorObj.adFormatMsg = "inStreamTemplateAdFormatError";
			return false;
		}
		return true;
	}

	function validateInStreamRule(rule, errorObj){
		var isValid = true;

		if(!rule.sectionId){
			errorObj.sectionMsg = 'Please choose value';
			isValid = false;
		}
		if(!rule.templateId){
			errorObj.templateMsg = 'Please choose value';
			isValid = false
		}
		return isValid;
	}

	return {
		validateBeforeSave: validateBeforeSave,
		validateInStreamRule: validateInStreamRule
	}
}

]);
