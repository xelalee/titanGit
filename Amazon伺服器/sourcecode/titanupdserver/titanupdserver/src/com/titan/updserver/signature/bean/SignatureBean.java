package com.titan.updserver.signature.bean;

import java.util.*;

import com.titan.util.Keys;
import com.titan.util.DateUtil;
import com.titan.util.Util;

public class SignatureBean{
	
	public static final String fileExtension = ".sig";
	
	private String signature_id = "";
	private String device = "";
	private String service = "";
	private String engine_ver = "0";
	private String sig_ver = "0";
	private String fullset = "";
	private String update_by = "";
	private String update_date = "";
	private String filesize = "0";
	private String checksum = "";
	private String status = Keys.STATUS_ACTIVE;	
	
	public SignatureBean(){

	}
	
	public SignatureBean(HashMap hm){
	    if(hm != null){
		    this.signature_id = Util.getString(hm.get("SIGNATURE_ID"));
		    this.device= Util.getString(hm.get("DEVICE"));
		    this.service = Util.getString(hm.get("SERVICE"));
		    this.engine_ver = Util.getString(hm.get("ENGINE_VER"));
		    this.sig_ver = Util.getString(hm.get("SIG_VER"));
		    this.fullset = Util.getString(hm.get("FULLSET"));
		    this.filesize = Util.getString(hm.get("FILESIZE"));
		    this.update_by = Util.getString(hm.get("UPDATE_BY"));
		    this.update_date = Util.getString(hm.get("UPDATE_DATE"));
		    this.checksum = Util.getString(hm.get("CHECKSUM"));
		    this.status = Util.getString(hm.get("STATUS"));
	    }
	}

	public void setSignature_id(String SIGNATURE_ID){
		this.signature_id=SIGNATURE_ID.trim();
	}
	
	public void setDevice(String DEVICE){
		this.device=DEVICE.trim().toUpperCase(Keys.DEFAULT_LOCALE);
	}
	
	public void setService(String SERVICE){
		this.service=SERVICE.trim().toUpperCase(Keys.DEFAULT_LOCALE);
	}
	
	public void setEngine_ver(String ENGINE_VER){
		String mid=Util.getVersion(ENGINE_VER);
		if(!mid.equals("")){
			this.engine_ver=Util.getVersion(ENGINE_VER);
		}
	}
	
	public void setSig_ver(String SIG_VER){
		String mid=Util.getVersion(SIG_VER);
		if(!mid.equals("")){
			this.sig_ver=handleVersion(Util.getVersion(mid),3);
		}
	}	
	
	public void setFullset(String FULLSET){
		this.fullset=FULLSET.trim().toUpperCase(Keys.DEFAULT_LOCALE);
	}
	
	public void setUpdate_by(String UPDATE_BY){
		this.update_by=UPDATE_BY.trim();
	}
	
	public void setUpdate_date(String UPDATE_DATE){
		this.update_date = DateUtil.formatDate(UPDATE_DATE);
	}	
	
	public void setFilesize(String FILESIZE){
		this.filesize=FILESIZE.trim();
	}	
	
	public void setChecksum(String CHECKSUM){
		this.checksum=CHECKSUM.trim();
	}
	
	public void setStatus(String STATUS){
		if(STATUS.equalsIgnoreCase(Keys.STATUS_ACTIVE) 
		|| STATUS.equalsIgnoreCase(Keys.STATUS_INACTIVE)){
			this.status = STATUS.trim();
		}
	}	
	
	public String getSignature_id(){
		return this.signature_id;
	}
	
	public String getDevice(){
		return this.device.trim().toUpperCase(Keys.DEFAULT_LOCALE);
	}
	
	public String getService(){
		return this.service.trim().toUpperCase(Keys.DEFAULT_LOCALE);
	}
	
	public String getEngine_ver(){
		return this.engine_ver.trim();
	}
	
	public String getSig_ver(){
		return handleVersion(this.sig_ver.trim(),3);
	}
	
	public String getFullset(){
		return this.fullset;
	}
	
	public String getUpdate_by(){
		return this.update_by;
	}
	
	public String getUpdate_date(){
		return DateUtil.formatDate(this.update_date);
	}

	public String getFilesize(){
		return this.filesize;
	}
	
	public String getChecksum(){
		return this.checksum;
	}
	
	public String getStatus(){
		return this.status;
	}	
	
	public boolean isFullSet(){
		return this.fullset.equalsIgnoreCase("true");
	}
	
	public String getFilename(){
		return this.getSig_ver()+fileExtension;
	}
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" ID: ").append(this.getSignature_id());
		buffer.append(" Device: ").append(this.getDevice());
		buffer.append(" Service: ").append(this.getService());
		buffer.append(" Version: ").append(this.getSig_ver());
		buffer.append(" Fullset: ").append(this.getFullset());
		
		return buffer.toString();
	}
	
	public String getDeviceService(){
		return this.device+"||"+this.service;
	}
	
	/**
	 * validate signature
	 * @param sjb
	 * @return
	 */
	public boolean ValidateSignature(SignatureBean sjb){
		String msg="";
		if(sjb.getDevice().equals("")
		 ||sjb.getService().equals("")
		 ||sjb.getEngine_ver().equals("")
		 ||sjb.getSig_ver().equals("")
		 ||sjb.getFullset().equals("")
		 ||sjb.getFilename().equals("")){
				return false;
		}		
		return true;
	}
	
	/**
	 * handle version,append zero
	 * @param ver0
	 * @param dotlen
	 * @return
	 */
	public static String handleVersion(String ver0,int dotlen){
		String ver=ver0;
		if(ver.startsWith(".")){
			ver="0"+ver;
		}

		int dot_index=ver.indexOf(".");

		int append_count=0;
		if(dot_index == -1){
			ver=ver+".";
			dot_index=ver.indexOf(".");
		}
		String subver=ver.substring(dot_index+1);

		if(subver.length() < dotlen){
			append_count=dotlen-subver.length();
			for(int i=0;i<append_count;i++){
				ver=ver+"0";
			}
		}else if(subver.length() > dotlen){
			if(ver.endsWith("0")){
				ver = ver.substring(0, ver.length()-1);
			}
		}
		
		return ver;
	}
	
	public static void main(String[] args){
		System.out.println(handleVersion("3",3));
		System.out.println(handleVersion("3.0",3));
		System.out.println(handleVersion(".3",3));
		System.out.println(handleVersion("0.33",3));
		System.out.println(handleVersion("0.33",3));
	}
}