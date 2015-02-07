package com.titan.base.app.error.exception;

public class ErrorParseException extends Exception{
	public ErrorParseException(){
		super();
	}
	
	public ErrorParseException(String err){
		super(err);
	}
}
