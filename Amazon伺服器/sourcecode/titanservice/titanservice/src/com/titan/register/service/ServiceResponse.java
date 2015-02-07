package com.titan.register.service;

import com.titan.register.controller.CommonResponse;

public class ServiceResponse extends CommonResponse {

	protected String sku = "N/A";
	
	public ServiceResponse(){
		super();
	}
	
	public ServiceResponse(String errorKey){
		super(errorKey);
	}
	
	public String getSku() {
		return sku;
	}
	public void setSku(String sku) {
		this.sku = sku;
	}
	@Override
	public String combineResponse() {
		StringBuffer buffer = new StringBuffer();
		buffer.append(RETURNS_START);
		buffer.append("<code>"+this.code+"</code>");
		buffer.append("<message>"+this.message+"</message>");
		buffer.append("<sku>"+this.sku+"</sku>");
		buffer.append(RETURNS_END);
		return buffer.toString();
	}
	@Override
	public String toString() {
		StringBuffer buffer = new StringBuffer();
		buffer.append("code:"+this.code);
		buffer.append(", message:"+this.message);
		buffer.append(", sku:"+this.sku);
		return buffer.toString();
	}
	
	

}
