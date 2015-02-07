package com.titan.mytitan.login.exception;

import com.titan.base.app.exception.ModelException;


public class IncorrectPasswordException extends ModelException{
	public IncorrectPasswordException(){
		super("IncorrectPasswordException");
	}
}
