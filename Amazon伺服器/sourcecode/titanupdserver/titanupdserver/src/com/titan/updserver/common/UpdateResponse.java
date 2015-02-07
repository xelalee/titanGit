package com.titan.updserver.common;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import com.titan.updserver.common.codemessage.CodeMessage;

public class UpdateResponse {
	
	private String code = "0";
	private String message = "N/A";
	private String filelist = "N/A";
	private String version = "N/A";
	
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
	public String getFilelist() {
		return filelist;
	}
	public void setFilelist(String filelist) {
		this.filelist = filelist;
	}
	public String getVersion() {
		return version;
	}
	public void setVersion(String version) {
		this.version = version;
	}
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		buffer.append("<returns>");
		buffer.append("<code>"+this.code+"</code>");
		buffer.append("<message>"+this.message+"</message>");
		buffer.append("<filelist>"+this.filelist+"</filelist>");
		buffer.append("<version>"+this.version+"</version>");
		buffer.append("</returns>");
		return buffer.toString();
	}
	
	public String toSummary(){
		StringBuffer buffer = new StringBuffer();
		buffer.append("code: "+this.code);
		buffer.append(", message: "+this.message);
		buffer.append(", filelist: "+this.filelist);
		buffer.append(", version: "+this.version);
		return buffer.toString();
	}
	
	public void reportError(CodeMessage cm){
		this.code = cm.getCode();
		this.message = cm.getMessage();
	}
	
	public void sendResponse(HttpServletResponse response) throws IOException{
    	response.setContentType("text/plain");
    	response.getWriter().println(this.toString());
	}

}
