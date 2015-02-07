package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class UsernameEmailNotMatchException extends ModelException{
	public UsernameEmailNotMatchException(){
		super("UsernameEmailNotMatchException");
	}
}
