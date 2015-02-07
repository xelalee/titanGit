package com.titan.updserver.common;

import javax.servlet.http.HttpServletRequest;

import com.titan.util.Util;

public class DownloadRequest {
	
	private String token = "";
	private String mac = "";
	private String ip = "";
	
	public DownloadRequest(HttpServletRequest request){
		this.token = Util.getString(request.getParameter("token"));
		this.mac = Util.getString(request.getParameter("mac"));
		this.ip = request.getRemoteAddr();		
	}
	
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public String getMac() {
		return mac;
	}
	public void setMac(String mac) {
		this.mac = mac;
	}
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(",token: "+this.token);
		buffer.append(",mac: "+this.mac);
		buffer.append(",ip: "+this.ip);
		return buffer.substring(1);
	}

}
