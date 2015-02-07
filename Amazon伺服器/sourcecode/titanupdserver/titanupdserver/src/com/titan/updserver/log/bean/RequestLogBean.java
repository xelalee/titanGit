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

import com.titan.updserver.common.UpdateRequest;
import com.titan.updserver.common.UpdateResponse;
import com.titan.updserver.firmware.FirmwareUpdateRequest;
import com.titan.updserver.signature.SignatureUpdateRequest;
import com.titan.util.Util;

public class RequestLogBean extends LogBean {
	
	public static final String CAT = "Request";
	
	private String device_type = "";
	private String service_type = "";
	private String engine_ver = "";
	private String version = "";
	private String return_msg = "";
	private String mac = "";
	private String srcip = "";
	private String type = ""; //sg:signature;fw:firmware
	
	public RequestLogBean(){
		super();
		this.cat = CAT;
	}
	
	public RequestLogBean(String type, UpdateResponse resp){
		super("", "");
		this.cat = CAT;
		this.type = type;
		this.return_msg = resp.toSummary();
	}
	
	public RequestLogBean(String type, SignatureUpdateRequest req, UpdateResponse resp){
		this(type, resp);

		this.device_type = req.getDevice();
		this.service_type = req.getService();
		this.engine_ver = req.getEngineVer();
		this.version = req.getSigVer();
		this.mac = req.getMac();
		this.srcip = req.getIp();
	}
	
	public RequestLogBean(String type, FirmwareUpdateRequest req, UpdateResponse resp){
		this(type, resp);

		this.device_type = req.getDevice();
		this.version = req.getFwVer();
		this.mac = req.getMac();
		this.srcip = req.getIp();
	}
	
	public RequestLogBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.region = Util.getString(hm.get("REGION"));
			this.server = Util.getString(hm.get("SERVER"));
			this.cat = CAT;
			this.logtime = Util.getLong(hm.get("LOGTIME"));
			this.device_type = Util.getString(hm.get("DEVICE_TYPE"));
			this.service_type = Util.getString(hm.get("SERVICE_TYPE"));
			this.engine_ver = Util.getString(hm.get("ENGINE_VER"));
			this.version = Util.getString(hm.get("VERSION"));
			this.return_msg = Util.getString(hm.get("RETURN_MSG"));
			this.mac = Util.getString(hm.get("MAC"));
			this.srcip = Util.getString(hm.get("SRCIP"));
			this.type = Util.getString(hm.get("TYPE"));
		}
	}

	/**
	 * @return the device_type
	 */
	public String getDevice_type() {
		return device_type;
	}

	/**
	 * @param device_type the device_type to set
	 */
	public void setDevice_type(String device_type) {
		this.device_type = device_type;
	}

	/**
	 * @return the service_type
	 */
	public String getService_type() {
		return service_type;
	}

	/**
	 * @param service_type the service_type to set
	 */
	public void setService_type(String service_type) {
		this.service_type = service_type;
	}

	/**
	 * @return the engine_ver
	 */
	public String getEngine_ver() {
		return engine_ver;
	}

	/**
	 * @param engine_ver the engine_ver to set
	 */
	public void setEngine_ver(String engine_ver) {
		this.engine_ver = engine_ver;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	/**
	 * @return the return_msg
	 */
	public String getReturn_msg() {
		return return_msg;
	}

	/**
	 * @param return_msg the return_msg to set
	 */
	public void setReturn_msg(String return_msg) {
		this.return_msg = return_msg;
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
	public String getMessage(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" device_type=").append(this.device_type);
		buffer.append(" service_type=").append(this.service_type);
		buffer.append(" version=").append(this.version);
		buffer.append(" return=").append(this.return_msg);
		buffer.append(" mac=").append(this.mac);
		buffer.append(" srcip=").append(this.srcip);
		return buffer.toString();
	}

}
