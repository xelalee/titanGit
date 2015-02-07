package com.titan.updserver.firmware;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.updserver.common.ContentBase;
import com.titan.updserver.common.UpdateProcessor;
import com.titan.updserver.common.UpdateResponse;
import com.titan.updserver.common.codemessage.CodeMessage;
import com.titan.updserver.common.token.TokenPool;
import com.titan.updserver.firmware.bean.FirmwareBean;
import com.titan.updserver.firmware.dao.FirmwareDao;
import com.titan.updserver.log.LogBuffer;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.RequestLogBean;
import com.titan.updserver.signature.SignatureUpdateProcessor;
import com.titan.updserver.signature.bean.SignatureBean;
import com.titan.util.Configure;

public class FirmwareUpdateProcessor implements UpdateProcessor {
	
	static Logger logger = Logger.getLogger(FirmwareUpdateProcessor.class);
	
	private static FirmwareUpdateProcessor instance = new FirmwareUpdateProcessor();
	
	public static FirmwareUpdateProcessor getInstance(){
		return instance;
	}

	@Override
	public void process(HttpServletRequest request, HttpServletResponse response) {
		FirmwareUpdateRequest updateReq = new FirmwareUpdateRequest(request);
		
		UpdateResponse updateResp = new UpdateResponse();
		
    	CodeMessage cm = updateReq.validate();
    	
    	if(cm!=null){
    		updateResp.reportError(cm);
    		try {
				updateResp.sendResponse(response);
			} catch (IOException e) {
				logger.error("send response error", e);
			}
    		return;
    	}
    	
    	FirmwareBean bean = FirmwareDao.getInstance().getLatestVersion(updateReq.getDevice(), updateReq.getFwVer());
    	
    	if(bean==null){
    		cm = Configure.codeMessageMap.get("noUpdate");
    		cm.setMessage(cm.getMessage().replaceAll("#version#", updateReq.getFwVer()));
    		updateResp.reportError(cm);
    	}else{
    		updateResp.setFilelist(this.getDownloadLink(updateReq.getMac(), bean));
    		updateResp.setVersion(bean.getVersion());
    	}
    	
		try {
			updateResp.sendResponse(response);
			logger.debug("[Request]: "+updateReq.toString()+"; [Response]: "+updateResp.toString());
		} catch (IOException e) {
			logger.error("send response error", e);
		}
		
		//log to db
		LogBean log = new RequestLogBean(LogBean.LOG_TYPE_FIRMWARE, updateReq, updateResp);
		LogBuffer.addLog(log);
    	
	}
	
	private String getDownloadLink(String mac, FirmwareBean bean){
		String path = ContentBase.getInstance().getFirmwarePath(bean);
		String id = bean.getFirmware_id();
		String token = TokenPool.getInstance().put4Firmware(id, path);
		String link = DownloadURL+"?token="+token+"&mac="+mac;
		return link;
	}

}
