package com.titan.util;


public class CodeMessageJavaBean{
	private int IntCode=0;
	private String StrCode="";
	private String Message="";
	public CodeMessageJavaBean(){
		
	}
	
	public CodeMessageJavaBean(int IntCode,String Message){
		this.IntCode = IntCode;
		this.Message = Message;
	}

	public CodeMessageJavaBean(String StrCode,String Message){
		this.StrCode = StrCode;
		this.Message = Message;		
	}	
	
	public void setIntCode(int IntCode){
		this.IntCode=IntCode;
	}
	public void setStrCode(String StrCode){
		this.StrCode=StrCode;
	}
	public void setMessage(String Message){
		this.Message=Message;
	}

	public int getIntCode(){
		return this.IntCode;
	}
	public String getStrCode(){
		return this.StrCode;
	}
	public String getMessage(){
		return this.Message;
	}	
	
}