package com.titan.mytitan.app.validator;

import java.util.Locale;
import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;

import com.titan.base.app.util.BundleUtil;
import com.titan.mytitan.login.bean.LocaleBean;


public class CharValidator implements Validator{

	public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
		Locale locale = new LocaleBean().getLocale0();
		boolean isValid = false;
		String str = (String)value;
		
		isValid = isAllCharsValid(str);

		if(!isValid){
			FacesMessage message = new FacesMessage();
			message.setDetail(BundleUtil.getResource("","INVALID_INPUT",locale));
			message.setSeverity(FacesMessage.SEVERITY_ERROR);
			message.setSummary(BundleUtil.getResource("","INVALID_INPUT",locale));
			throw new ValidatorException(message);
		}
	}
	
	private boolean isAllCharsValid(String str0){
		boolean isValid = true;
		final String pattern = "[^\']*";
		//not allowed chars: '
		String str = str0.trim();
		if(str==null){
			isValid = true;
		}else{
			isValid = str.matches(pattern);			
		}	
		return isValid;		
	}
}
