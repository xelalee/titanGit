package com.titan.updserver.firmware.bean;

import java.util.HashMap;

import com.titan.util.Util;

public class FirmwareBean {
	
	public static final String fileExtension = ".img";

	private String firmware_id = "";
	private String device = "";
	private String version = "";
	private String update_by = "";
	private String update_date = "";
	private String filesize = "0";
	private String checksum = "";
	private String status = "";
	
	public FirmwareBean(){
		
	}
	
	public FirmwareBean(HashMap hm){
	    if(hm != null){
		    this.firmware_id = Util.getString(hm.get("FIRMWARE_ID"));
		    this.device= Util.getString(hm.get("DEVICE"));
		    this.version = Util.getString(hm.get("VERSION"));
		    this.filesize = Util.getString(hm.get("FILESIZE"));
		    this.update_by = Util.getString(hm.get("UPDATE_BY"));
		    this.update_date = Util.getString(hm.get("UPDATE_DATE"));
		    this.checksum = Util.getString(hm.get("CHECKSUM"));
		    this.status = Util.getString(hm.get("STATUS"));
	    }
	}

	public String getFirmware_id() {
		return firmware_id;
	}

	public void setFirmware_id(String firmware_id) {
		this.firmware_id = firmware_id;
	}

	public String getDevice() {
		return device;
	}

	public void setDevice(String device) {
		this.device = device;
	}	

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getUpdate_by() {
		return update_by;
	}

	public void setUpdate_by(String update_by) {
		this.update_by = update_by;
	}

	public String getUpdate_date() {
		return update_date;
	}

	public void setUpdate_date(String update_date) {
		this.update_date = update_date;
	}

	public String getFilesize() {
		return filesize;
	}

	public void setFilesize(String filesize) {
		this.filesize = filesize;
	}

	public String getChecksum() {
		return checksum;
	}

	public void setChecksum(String checksum) {
		this.checksum = checksum;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getFilename(){
		return this.version + fileExtension;
	}

}
