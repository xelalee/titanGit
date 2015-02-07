package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class InvalidAuthCodeOrSerialNumException extends ModelException{
	public InvalidAuthCodeOrSerialNumException(){
		super("InvalidAuthCodeOrSerialNumException");
	}
}
