package com.titan.updserver.signature;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;

import com.titan.updserver.common.ContentBase;
import com.titan.updserver.common.UpdateProcessor;
import com.titan.updserver.common.UpdateResponse;
import com.titan.updserver.common.codemessage.CodeMessage;
import com.titan.updserver.common.token.TokenPool;
import com.titan.updserver.log.LogBuffer;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.RequestLogBean;
import com.titan.updserver.signature.bean.SignatureBean;
import com.titan.updserver.signature.dao.SignatureDao;
import com.titan.util.Configure;

public class SignatureUpdateProcessor implements UpdateProcessor {
	
	static Logger logger = Logger.getLogger(SignatureUpdateProcessor.class);
	
	private static SignatureUpdateProcessor instance = new SignatureUpdateProcessor();
	
	public static SignatureUpdateProcessor getInstance(){
		return instance;
	}

	@Override
	public void process(HttpServletRequest request, HttpServletResponse response) {
    	//process
		SignatureUpdateRequest updateReq = new SignatureUpdateRequest(request);
		
		UpdateResponse updateResp = new  UpdateResponse();
    	
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
    	
    	List<SignatureBean> list = 
    			SignatureDao.getInstance().getUpdateVersions(updateReq.getDevice(), updateReq.getService(), updateReq.getSigVer());
    	
    	if(list.size()==0){
    		cm = Configure.codeMessageMap.get("noUpdate");
    		cm.setMessage(cm.getMessage().replaceAll("#version#", updateReq.getSigVer()));
    		updateResp.reportError(cm);
    	}else{
    		StringBuffer fileBuffer = new StringBuffer();
    		StringBuffer versionBuffer = new StringBuffer();
    		
    		for(SignatureBean bean: list){
    			fileBuffer.append("#"+this.getDownloadLink(updateReq.getMac(), bean));
    			versionBuffer.append("#"+bean.getSig_ver());
    		}
    		
    		updateResp.setFilelist(fileBuffer.substring(1));
    		updateResp.setVersion(versionBuffer.substring(1));
    	}
    	
		try {
			updateResp.sendResponse(response);
			logger.debug("[Request]: "+updateReq.toString()+"; [Response]: "+updateResp.toString());
		} catch (IOException e) {
			logger.error("send response error", e);
		}
		
		//log to db
		LogBean log = new RequestLogBean(LogBean.LOG_TYPE_SIGNATURE, updateReq, updateResp);
		LogBuffer.addLog(log);
		
	}
	
	private String getDownloadLink(String mac, SignatureBean bean){
		String path = ContentBase.getInstance().getSignaturePath(bean);
		String id = bean.getSignature_id();
		String token = TokenPool.getInstance().put4Signature(id, path);
		String link = DownloadURL+"?token="+token+"&mac="+mac;
		return link;
	}

}
