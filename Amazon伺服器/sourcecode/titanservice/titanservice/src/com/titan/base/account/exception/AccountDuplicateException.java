package com.titan.base.account.exception;

import com.titan.base.app.exception.ModelException;


public class AccountDuplicateException extends ModelException{
	public AccountDuplicateException(){
		super("AccountDuplicateException");
	}
	
}
