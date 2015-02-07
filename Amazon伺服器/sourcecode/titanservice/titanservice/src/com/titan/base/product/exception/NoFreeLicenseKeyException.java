package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class NoFreeLicenseKeyException extends ModelException{
	public NoFreeLicenseKeyException(){
		super("NoFreeLicenseKeyException");
	}
}
