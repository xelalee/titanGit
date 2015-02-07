/*
 * Created on 2012-6-5
 *
 * COPYRIGHT (C) 2012, Titan Corporation   Co., Ltd                  
 * Protected as an unpublished work. All Rights Reserved.
 * Titan PROPRIETARY/CONFIDENTIAL.                                               
 *                                  
 * The computer program listings, specifications, and 
 * documentation herein are the property of Titan 
 * Corporation and shall not be reproduced, copied, 
 * disclosed, or used in whole or in part for any reason 
 * without the prior express written permission of     
 * Titan Corporation.  
 */
package com.titan.updserver.log.bean;

import java.util.HashMap;

import com.titan.util.Util;

public class SystemLogBean extends LogBean{
	
	public static final String CAT = "System";
	
	private String message;
	
	public SystemLogBean(){
		super();
	}
	
	public SystemLogBean(String msg, String region, String server){
		super(region, server);

		this.cat = CAT;
		this.message = msg;
	}
	
	public SystemLogBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.region = Util.getString(hm.get("REGION"));
			this.server = Util.getString(hm.get("SERVER"));
			this.cat = CAT;
			this.logtime = Util.getLong(hm.get("LOGTIME"));
			this.message = Util.getString(hm.get("MESSAGE"));
		}
	}

	/**
	 * @return the message
	 */
	@Override
	public String getMessage() {
		return message;
	}
	
	public String getMessageLimit100(){
		String rst = this.message;
		if(this.message.length()>100){
			rst = this.message.substring(0, 95) + "...";
		}
		return rst;
	}

	/**
	 * @param message the message to set
	 */
	public void setMessage(String message) {
		this.message = message;
	}	

}
