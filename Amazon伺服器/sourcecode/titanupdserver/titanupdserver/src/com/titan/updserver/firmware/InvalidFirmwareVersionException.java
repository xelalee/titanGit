package com.titan.updserver.firmware;

public class InvalidFirmwareVersionException extends Exception {
	public InvalidFirmwareVersionException(){
		super();
	}
	
	public InvalidFirmwareVersionException(String error){
		super(error);
	}
}
