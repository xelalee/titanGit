package com.titan.register.controller;

import com.titan.base.app.error.bean.ErrorBean;
import com.titan.register.controller.ResponseBase;

public class CommonResponse extends ResponseBase {
	
	protected String code = "0";
	protected String message = "N/A";
	
	public CommonResponse(){
		
	}
	
	public CommonResponse(String errorKey){
		ErrorBean error = ErrorBean.getInstanceByName(errorKey);
		this.code = error.getCode();
		this.message = error.getMessage();
	}

	
	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	@Override
	public String combineResponse() {
		StringBuffer buffer = new StringBuffer();
		buffer.append(RETURNS_START);
		buffer.append("<code>"+this.code+"</code>");
		buffer.append("<message>"+this.message+"</message>");
		buffer.append(RETURNS_END);
		return buffer.toString();
	}
	@Override
	public String toString() {
		StringBuffer buffer = new StringBuffer();
		buffer.append("code:"+this.code);
		buffer.append(", message:"+this.message);
		return buffer.toString();
	}

}
