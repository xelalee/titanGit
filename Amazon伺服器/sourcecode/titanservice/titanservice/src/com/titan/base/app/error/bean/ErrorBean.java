package com.titan.base.app.error.bean;

import java.util.Locale;

import com.titan.base.app.util.BundleUtil;

public class ErrorBean {
	public final static String code_message_separator = "::";
	private String name;
	private String code;
	private String message;
	
	public ErrorBean(){
		
	}
	
	public ErrorBean(String content){
		String[] c_m = content.split(code_message_separator);
		if(c_m.length>1){
			this.code = c_m[0].trim();
			this.message = c_m[1].trim();			
		}
	}
	
	public static ErrorBean getInstance(String content){
		return new ErrorBean(content);
	}
	
	public static ErrorBean getInstanceByName(String name){
		String content = BundleUtil.getErrorResource(name,null);
		ErrorBean eb = new ErrorBean(content);
		eb.setName(name);
		return eb;
	}	
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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
	public String getMessage(Locale locale) {
		String content = BundleUtil.getErrorResource(this.name,locale);
		String[] c_m = content.split(code_message_separator);
		String msg = "";
		if(c_m.length>0){
			msg = c_m[1];			
		}
		return msg;
	}
	public void setMessage(String message) {
		this.message = message;
	}

}
