package com.titan.updserver.common.token;

public class Token {
	
	public static final String ContentType_SIG = "sg";
	public static final String ContentType_FW = "fw";

	private String contentType;
	private String path;
	private long createTime;
	
	public Token(){
		this.createTime = System.currentTimeMillis();
	}
	
	public Token(String contentType, String path){
		this.contentType = contentType;
		this.createTime = System.currentTimeMillis();
		this.path = path;
	}

	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public long getCreateTime() {
		return createTime;
	}
	public void setCreateTime(long createTime) {
		this.createTime = createTime;
	}

}
