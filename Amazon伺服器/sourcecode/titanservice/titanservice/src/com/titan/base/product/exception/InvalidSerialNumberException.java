package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class InvalidSerialNumberException extends ModelException{
	public InvalidSerialNumberException(){
		super("InvalidSerialNumberException");
	}
}
