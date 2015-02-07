package com.titan.register.service;

public class ServiceRefreshResponse extends ServiceResponse {
	
	protected String username = "N/A";

	public ServiceRefreshResponse() {
		super();
	}
	
	public ServiceRefreshResponse(String errorKey) {
		super(errorKey);
	}
	
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	@Override
	public String combineResponse() {
		StringBuffer buffer = new StringBuffer();
		buffer.append(RETURNS_START);
		buffer.append("<code>"+this.code+"</code>");
		buffer.append("<message>"+this.message+"</message>");
		buffer.append("<sku>"+this.sku+"</sku>");
		buffer.append("<username>"+this.username+"</username>");
		buffer.append(RETURNS_END);
		return buffer.toString();
	}
	@Override
	public String toString() {
		StringBuffer buffer = new StringBuffer();
		buffer.append("code:"+this.code);
		buffer.append(", message:"+this.message);
		buffer.append(", sku:"+this.sku);
		buffer.append(", username:"+this.username);
		return buffer.toString();
	}

}
