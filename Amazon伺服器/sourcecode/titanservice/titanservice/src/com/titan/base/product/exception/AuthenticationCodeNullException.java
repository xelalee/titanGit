package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class AuthenticationCodeNullException extends ModelException{
	public AuthenticationCodeNullException(){
		super("AuthenticationCodeNullException");
	}
}
