package com.titan.mytitan.app.validator;

import java.util.Locale;
import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;

import com.titan.base.app.util.BundleUtil;
import com.titan.mytitan.login.bean.LocaleBean;


public class PhoneValidator implements Validator{

	public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
		Locale locale = new LocaleBean().getLocale0();
		boolean isValid = true;
		String phone = (String)value;
		
		isValid = isAllCharsValid(phone);

		if(!isValid){
			FacesMessage message = new FacesMessage();
			message.setDetail(BundleUtil.getResource("","INVALID_INPUT",locale));
			message.setSeverity(FacesMessage.SEVERITY_ERROR);
			message.setSummary(BundleUtil.getResource("","INVALID_INPUT",locale));
			throw new ValidatorException(message);
		}
	}
	
	private boolean isAllCharsValid(String phone0){
		boolean isValid = true;
		final String pattern = "[0-9\\-]*";
		//allowed chars: 0123456789-
		String phone = phone0.trim();
		if(phone==null){
			isValid = true;
		}else{
			isValid = phone.matches(pattern);			
		}	
		return isValid;		
	}

}
