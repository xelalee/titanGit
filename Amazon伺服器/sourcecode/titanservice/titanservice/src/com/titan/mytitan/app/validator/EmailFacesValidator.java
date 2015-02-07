package com.titan.mytitan.app.validator;

import java.util.Locale;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;
import javax.faces.application.FacesMessage;

import org.apache.commons.validator.EmailValidator;

import com.titan.base.app.util.BundleUtil;
import com.titan.mytitan.login.bean.LocaleBean;


public class EmailFacesValidator implements Validator{

	public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
		Locale locale = new LocaleBean().getLocale0();
		String email = (String)value;
		EmailValidator validator = EmailValidator.getInstance();
		if(!validator.isValid(email)){
			FacesMessage message = new FacesMessage();
			message.setDetail(BundleUtil.getResource("","EMAIL_FACES_VALIDATOR_DETAIL",locale));
			message.setSeverity(FacesMessage.SEVERITY_ERROR);
			message.setSummary(BundleUtil.getResource("","EMAIL_FACES_VALIDATOR_SUMMARY",locale));
			throw new ValidatorException(message);
		}
	}

}
