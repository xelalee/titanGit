package com.titan.common.bean;

public class MessageBean {
	public final static String DefaultSuccHint = "You operation is done successfully!";
	private boolean succ = true;
	private String message = "";
	private String menu = "";
	private String function = "";
	//the target page after operation, the default is confirm page, if set another page, other attributes are useless
	private String targetURL = "/jsp/common/confirm_page.jsp";
	private String backURL = "";
	
	public String getBackURL() {
		if(!this.backURL.startsWith("/")){
			this.backURL = "/" + this.backURL;
		}
		return backURL;
	}
	public void setBackURL(String backURL) {
		this.backURL = backURL;
	}
	public String getFunction() {
		return function;
	}
	public void setFunction(String function) {
		this.function = function;
	}
	public String getMenu() {
		return menu;
	}
	public void setMenu(String menu) {
		this.menu = menu;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public boolean isSucc() {
		return succ;
	}
	public void setSucc(boolean succ) {
		this.succ = succ;
	}
	public String getTargetURL() {
		return targetURL;
	}
	public void setTargetURL(String targetURL) {
		this.targetURL = targetURL;
	}
	
}
