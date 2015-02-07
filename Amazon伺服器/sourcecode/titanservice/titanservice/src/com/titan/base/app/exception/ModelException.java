package com.titan.base.app.exception;

import java.util.Locale;

import com.titan.base.app.util.BundleUtil;



public class ModelException extends Exception {
	private String messageKey;
    public ModelException(String messageKey) {
    	this.messageKey = messageKey;
    }
    
    public String toString(){
    	return BundleUtil.getExceptionResource(messageKey, null);
    }
    
    public String toString(Locale locale){
    	return BundleUtil.getExceptionResource(messageKey, locale);
    }
}
