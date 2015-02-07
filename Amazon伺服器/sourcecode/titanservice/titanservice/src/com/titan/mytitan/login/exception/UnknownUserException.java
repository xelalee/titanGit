package com.titan.mytitan.login.exception;

import com.titan.base.app.exception.ModelException;

public class UnknownUserException extends ModelException{
	public UnknownUserException(){
		super("UnknownUserException");
	}
}
