package com.titan.updserver.common;

import javax.servlet.http.HttpServletRequest;

import com.titan.updserver.common.codemessage.CodeMessage;
import com.titan.util.Util;

public abstract class UpdateRequest {
	
	private String action = "";
	private String device = "";
	private String mac = "";
	private String ip = "";
	
	public UpdateRequest(HttpServletRequest request){
		this.action = Util.getString(request.getParameter("action"));
		this.device = Util.getString(request.getParameter("deviceType"));
		this.mac = Util.getString(request.getParameter("mac"));
		this.ip = request.getRemoteAddr();		
	}
	
	public String getAction() {
		return action;
	}
	public void setAction(String action) {
		this.action = action;
	}
	public String getDevice() {
		return device;
	}
	public void setDevice(String device) {
		this.device = device;
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
		buffer.append(",action: "+this.action);
		buffer.append(",device: "+this.device);
		buffer.append(",mac: "+this.mac);
		buffer.append(",ip: "+this.ip);
		return buffer.substring(1);
	}
	
	public abstract CodeMessage validate();

}
