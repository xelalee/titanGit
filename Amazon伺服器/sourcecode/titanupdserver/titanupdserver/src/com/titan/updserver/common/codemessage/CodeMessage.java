package com.titan.updserver.common.codemessage;

import com.titan.util.Configure;

public class CodeMessage {
	
	private String key;
	private String code;
	private String message;
	
	public CodeMessage(String key, String codeMessage){
		this.key = key;
		String[] strs = codeMessage.split("::");
		if(strs.length==2){
			this.code = strs[0];
			this.message = strs[1];
		}
	}
	
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
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
	
	public static CodeMessage getCodeMessage(String key){
		return Configure.codeMessageMap.get(key);
	}

}
