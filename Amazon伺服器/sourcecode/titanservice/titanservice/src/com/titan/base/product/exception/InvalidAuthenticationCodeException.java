package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class InvalidAuthenticationCodeException extends ModelException{
	public InvalidAuthenticationCodeException(){
		super("InvalidAuthenticationCodeException");
	}
}
