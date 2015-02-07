package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class InvalidUsernameException extends ModelException{
	public InvalidUsernameException(){
		super("InvalidUsernameException");
	}
}
