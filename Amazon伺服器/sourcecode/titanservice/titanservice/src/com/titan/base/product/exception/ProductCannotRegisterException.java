package com.titan.base.product.exception;

import com.titan.base.app.exception.ModelException;


public class ProductCannotRegisterException extends ModelException{
	public ProductCannotRegisterException(){
		super("ProductCannotRegisterException");
	}
}
