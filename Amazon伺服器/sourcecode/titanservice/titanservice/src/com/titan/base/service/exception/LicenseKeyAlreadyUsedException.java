package com.titan.base.service.exception;

import com.titan.base.app.exception.ModelException;


public class LicenseKeyAlreadyUsedException extends ModelException{
	public LicenseKeyAlreadyUsedException(){
		super("LicenseKeyAlreadyUsedException");
	}
}
