package com.titan.mytitan.app.validator;

import java.util.Locale;

import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;

import com.titan.base.app.util.BundleUtil;
import com.titan.mytitan.login.bean.LocaleBean;


public class ValidationCodeValidator implements Validator{

	public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
		Locale locale = new LocaleBean().getLocale0();
		boolean isValid = true;
		String validationcode = (String)value;
		
		isValid = isAllCharsValid(validationcode);

		if(!isValid){
			FacesMessage message = new FacesMessage();
			message.setDetail(BundleUtil.getResource("","VALIDATIONCODE_VALIDATOR_DETAIL",locale));
			message.setSeverity(FacesMessage.SEVERITY_ERROR);
			message.setSummary(BundleUtil.getResource("","VALIDATIONCODE_VALIDATOR_SUMMARY",locale));
			throw new ValidatorException(message);
		}
	}
	
	public static boolean isAllCharsValid(String validationcode){
		boolean isValid = true;
		final String pattern = "[0-9]*";
		//allowed chars: 0123456789
		String validation_code = validationcode.trim();
		if(validation_code==null){
			isValid = false;
		}else{
			isValid = validation_code.matches(pattern);			
		}	
		return isValid;
	}	

}
