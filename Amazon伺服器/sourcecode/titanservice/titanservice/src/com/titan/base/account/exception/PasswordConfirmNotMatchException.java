package com.titan.base.account.exception;

import com.titan.base.app.exception.ModelException;

public class PasswordConfirmNotMatchException extends ModelException {
	public PasswordConfirmNotMatchException(){
		super("PasswordConfirmNotMatchException");
	}
	
}
