package com.titan.updserver.firmware;

import javax.servlet.http.HttpServletRequest;

import com.titan.updserver.common.UpdateRequest;
import com.titan.updserver.common.codemessage.CodeMessage;
import com.titan.updserver.devicetype.dao.DeviceTypeDao;
import com.titan.util.Configure;
import com.titan.util.Util;

public class FirmwareUpdateRequest extends UpdateRequest {

	private String fwVer = "";
	
	public FirmwareUpdateRequest(HttpServletRequest request){
		super(request);
		this.fwVer = Util.getString(request.getParameter("fwVer"));	
	}
	public String getFwVer() {
		return fwVer;
	}
	public void setFwVer(String fwVer) {
		this.fwVer = fwVer;
	}
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(super.toString());
		buffer.append(",fwVer"+this.fwVer);
		return buffer.toString();
	}
	@Override
	public CodeMessage validate() {
		CodeMessage cm = null;
		
		if(!DeviceTypeDao.getInstance().existsDeviceType(this.getDevice())){
			return Configure.codeMessageMap.get("invalidModel");
		}
		
		if(!FirmwareVersion.validate(this.fwVer)){
			return Configure.codeMessageMap.get("invalidFwVer");
		}
		
		return cm;
	}

}
