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

import com.titan.updserver.common.DownloadRequest;
import com.titan.updserver.common.DownloadResponse;
import com.titan.util.Util;

public class DownloadLogBean extends LogBean {
	public static final String CAT = "Download";
	
	private String token;
	private long filesize;
	private long download_time;
	private String success;
	private String mac;
	private String srcip;
	private String type; //sg:signature;fw:firmware
	
	public DownloadLogBean(){
		super();
		this.cat = CAT;
	}
	
	public DownloadLogBean(String type, 
			DownloadRequest req, DownloadResponse resp){
		super("", "");
		this.cat = CAT;
		this.type = type;

		this.token = req.getToken();
		this.filesize = resp.getBytesum();
		this.download_time = resp.getTimeCost();
		this.success = Util.getString(resp.isSucc());
		this.mac = req.getMac();
		this.srcip = req.getIp();
	} 
	
	public DownloadLogBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.region = Util.getString(hm.get("REGION"));
			this.server = Util.getString(hm.get("SERVER"));
			this.cat = CAT;
			this.logtime = Util.getLong(hm.get("LOGTIME"));
			this.token = Util.getString(hm.get("TOKEN"));
			this.filesize = Util.getLong(hm.get("FILESIZE"));
			this.download_time = Util.getInteger(hm.get("DOWNLOAD_TIME"));
			this.success = Util.getString(hm.get("SUCCESS"));
			this.mac = Util.getString(hm.get("MAC"));
			this.srcip = Util.getString(hm.get("SRCIP"));
			this.type = Util.getString(hm.get("TYPE"));
		}		
	}

	/**
	 * @return the token
	 */
	public String getToken() {
		return token;
	}

	/**
	 * @param token the token to set
	 */
	public void setToken(String token) {
		this.token = token;
	}

	/**
	 * @return the filesize
	 */
	public long getFilesize() {
		return filesize;
	}

	/**
	 * @param filesize the filesize to set
	 */
	public void setFilesize(long filesize) {
		this.filesize = filesize;
	}

	/**
	 * @return the download_time
	 */
	public long getDownload_time() {
		return download_time;
	}

	/**
	 * @param download_time the download_time to set
	 */
	public void setDownload_time(long download_time) {
		this.download_time = download_time;
	}

	/**
	 * @return the success
	 */
	public String getSuccess() {
		return success;
	}

	/**
	 * @param success the success to set
	 */
	public void setSuccess(String success) {
		this.success = success;
	}

	/**
	 * @return the mac
	 */
	public String getMac() {
		return mac;
	}

	/**
	 * @param mac the mac to set
	 */
	public void setMac(String mac) {
		this.mac = mac;
	}

	/**
	 * @return the srcip
	 */
	public String getSrcip() {
		return srcip;
	}

	/**
	 * @param srcip the srcip to set
	 */
	public void setSrcip(String srcip) {
		this.srcip = srcip;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Override
	public String getMessage() {
		StringBuffer buffer = new StringBuffer();
		buffer.append(" token=").append(this.token);
		buffer.append(" filesize=").append(this.filesize);
		buffer.append(" download_time=").append(this.download_time);
		buffer.append(" success=").append(this.success);
		buffer.append(" mac=").append(this.mac);
		buffer.append(" srcip=").append(this.srcip);
		return buffer.toString();
	}

}
