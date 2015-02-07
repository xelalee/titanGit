package com.titan.base.service.exception;

import com.titan.base.app.exception.ModelException;


public class InvalidLicenseKeyException extends ModelException{
	public InvalidLicenseKeyException(){
		super("InvalidLicenseKeyException");
	}
}
