package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class AuthenticationCodeUsedException extends ModelException{
	public AuthenticationCodeUsedException(){
		super("AuthenticationCodeUsedException");
	}
}
