package com.titan.mytitan.login.exception;

import com.titan.base.app.exception.ModelException;

public class UserInactivatedException extends ModelException{
	public UserInactivatedException(){
		super("UserInactivatedException");
	}
}
