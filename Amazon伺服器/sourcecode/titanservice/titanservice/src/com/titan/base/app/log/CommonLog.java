
package com.titan.base.app.log;


public class CommonLog {
	public static final String LOG_USER_SITE = "user_site";
	public static final String LOG_REGISTER = "register";
	
	private String title;

	private String errorCode;

	private String errorMessage;
	
	private StringBuffer msg = new StringBuffer();
	
	private String sourceIp;

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}	

	public String getSourceIp() {
		return sourceIp;
	}

	public void setSourceIp(String sourceIp) {
		this.sourceIp = sourceIp;
	}	

	public StringBuffer getMsg() {
		return msg;
	}
	
	public void appendMsg(String msg) {
		this.msg.append(msg);
	}

	public String toString() {
		StringBuffer buffer = new StringBuffer();
		if(this.title!=null){
			buffer.append(this.title);
		}
		if(this.sourceIp!=null){
			buffer.append(" [Source IP]: ").append(this.sourceIp);
		}		
		if(this.errorCode!=null){
			buffer.append(" [Error Code]: ").append(this.errorCode);
		}
		if(this.errorMessage!=null){
			buffer.append(" [Error Message]: ").append(this.errorMessage);
		}
		if(this.msg.length()>0){
			buffer.append(" [Msg]: ").append(this.msg);
		}

		return buffer.toString();
	}

}
