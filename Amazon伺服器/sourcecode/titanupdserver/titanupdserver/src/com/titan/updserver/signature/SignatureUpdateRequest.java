package com.titan.updserver.signature;

import javax.servlet.http.HttpServletRequest;

import com.titan.updserver.common.UpdateRequest;
import com.titan.updserver.common.codemessage.CodeMessage;
import com.titan.updserver.devicetype.dao.DeviceTypeDao;
import com.titan.updserver.servicetype.dao.ServiceTypeDao;
import com.titan.util.Configure;
import com.titan.util.Util;

public class SignatureUpdateRequest extends UpdateRequest {

	private String service = "";
	private String engineVer = "";
	private String sigVer = "";
	
	public SignatureUpdateRequest(HttpServletRequest request){
		super(request);
		this.service = Util.getString(request.getParameter("serviceType"));
		this.engineVer = Util.getString(request.getParameter("engineVer"));
		this.sigVer = Util.getString(request.getParameter("sigVer"));
	}
	public String getService() {
		return service;
	}
	public void setService(String service) {
		this.service = service;
	}
	public String getEngineVer() {
		return engineVer;
	}
	public void setEngineVer(String engineVer) {
		this.engineVer = engineVer;
	}
	public String getSigVer() {
		return sigVer;
	}
	public void setSigVer(String sigVer) {
		this.sigVer = sigVer;
	}
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(super.toString());
		buffer.append(",service:"+this.service);
		buffer.append(",engineVer:"+this.engineVer);
		buffer.append(",sigVer:"+this.sigVer);
		return buffer.toString();
	}
	@Override
	public CodeMessage validate() {
		if(!DeviceTypeDao.getInstance().existsDeviceType(this.getDevice())){
			return Configure.codeMessageMap.get("invalidModel");
		}
		
		if(!ServiceTypeDao.getInstance().existsServiceType(this.service)){
			return Configure.codeMessageMap.get("invalidService");
		}
		
		boolean flag = true;
		try{
			Float.parseFloat(this.sigVer);
		}catch(Exception ex){
			flag = false;
		}
		if(!flag){
			return Configure.codeMessageMap.get("invalidSigVer");
		}
		
		return null;
	}

}
