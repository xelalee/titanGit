package com.titan.updserver.common;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.updserver.common.token.Token;
import com.titan.updserver.common.token.TokenPool;
import com.titan.updserver.firmware.bean.FirmwareBean;
import com.titan.updserver.log.LogBuffer;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.DownloadLogBean;
import com.titan.updserver.signature.bean.SignatureBean;
import com.titan.util.Configure;

public class DownloadProcessor {
	
	static Logger logger = Logger.getLogger(DownloadProcessor.class);
	
	private static DownloadProcessor instance = new DownloadProcessor();
	
	public static DownloadProcessor getInstance(){
		return instance;
	}
	
	public void process(HttpServletRequest request, HttpServletResponse response){
    	
    	DownloadRequest downloadReq = new DownloadRequest(request);
    	
    	DownloadResponse downloadResp = new DownloadResponse();
    	
    	String token = downloadReq.getToken();
    	
    	String path = TokenPool.getInstance().fetch(token);
    	
    	String logType = "";
    	String targetFileName = "";
    	if(token.startsWith(Token.ContentType_SIG)){
    		targetFileName = "signature"+SignatureBean.fileExtension;
    		logType = LogBean.LOG_TYPE_SIGNATURE;
    	}else if(token.startsWith(Token.ContentType_FW)){
    		targetFileName = "firmware"+FirmwareBean.fileExtension;
    		logType = LogBean.LOG_TYPE_FIRMWARE;
    	}
    	
    	if(path.equals("")){
    		try {
				downloadResp.responseError(response, Configure.codeMessageMap.get("invalidToken"));
			} catch (IOException e) {
				logger.error("", e);
			}
    	}else{
    		try {
				downloadResp.responseFile(response, path, targetFileName);
			} catch (IOException e) {
				logger.error("", e);
			}
    	}
    	
		//log to db
		LogBean log = new DownloadLogBean(logType, downloadReq, downloadResp);
		LogBuffer.addLog(log);
	}
	

}
