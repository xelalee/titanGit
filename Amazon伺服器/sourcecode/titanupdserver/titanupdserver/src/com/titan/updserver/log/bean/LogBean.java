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

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import com.titan.util.DateUtil;

public abstract class LogBean {
	
	private static final DateFormat logtimeFormat = new SimpleDateFormat("MM-dd hh:mm:ss");
	
	public static final String LOG_TYPE_SIGNATURE = "sg";
	public static final String LOG_TYPE_FIRMWARE = "fw";
	
	protected String cat;
	protected long logtime;
	protected String region;
	protected String server;
	
	public LogBean(){
		this.logtime = System.currentTimeMillis();
	}
	
	public LogBean(String region, String server){
		this();
		this.region = region;
		this.server = server;
	}

	/**
	 * @return the cat
	 */
	public String getCat() {
		return cat;
	}

	/**
	 * @param cat the cat to set
	 */
	public void setCat(String cat) {
		this.cat = cat;
	}

	/**
	 * @return the logtime
	 */
	public long getLogtime() {
		return logtime;
	}

	/**
	 * @param logtime the logtime to set
	 */
	public void setLogtime(long logtime) {
		this.logtime = logtime;
	}

	/**
	 * @return the region
	 */
	public String getRegion() {
		return region;
	}

	/**
	 * @param region the region to set
	 */
	public void setRegion(String region) {
		this.region = region;
	}

	/**
	 * @return the server
	 */
	public String getServer() {
		return server;
	}

	/**
	 * @param server the server to set
	 */
	public void setServer(String server) {
		this.server = server;
	}
	
	protected HashMap<String, String> parseLog(String line){
		HashMap<String, String> hm = new HashMap<String, String>();
		String[] strs = line.split("\" ");
		String key;
		String value;
		for(String str:strs){
			String[] key_value = str.split("=\"");
			if(key_value.length==2){
				key = key_value[0].trim();
				value = key_value[1].trim();
				if(value.endsWith("\"")){
					value = value.substring(0, value.length()-1);
				}
				hm.put(key, value);
			}
		}
		return hm;
	}
	
	public static String parseCategory(String line){
		return line.substring(5, line.indexOf("\" "));
	}
	
	public boolean isSystemLog(){
		return this.cat.equalsIgnoreCase(SystemLogBean.CAT);
	}
	
	public boolean isRequestLog(){
		return this.cat.equalsIgnoreCase(RequestLogBean.CAT);
	}
	
	public boolean isDownloadLog(){
		return this.cat.equalsIgnoreCase(DownloadLogBean.CAT);
	}
	
	public abstract String getMessage();
	
	public String getLogtimestr(){
		return DateUtil.longToStr(this.logtime, logtimeFormat);
	}

}
