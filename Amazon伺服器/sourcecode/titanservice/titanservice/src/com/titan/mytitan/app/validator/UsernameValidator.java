package com.titan.mytitan.app.validator;

import java.util.Locale;

import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.app.util.BundleUtil;
import com.titan.mytitan.login.bean.LocaleBean;


public class UsernameValidator implements Validator{

	public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
		Locale locale = new LocaleBean().getLocale0();
		boolean isValid = true;
		String username = (String)value;
		
		isValid = AccountBean.isAllCharsValid(username);

		if(!isValid){
			FacesMessage message = new FacesMessage();
			message.setDetail(BundleUtil.getResource("","USERNAME_VALIDATOR_DETAIL",locale));
			message.setSeverity(FacesMessage.SEVERITY_ERROR);
			message.setSummary(BundleUtil.getResource("","USERNAME_VALIDATOR_SUMMARY",locale));
			throw new ValidatorException(message);
		}
	}	

}
