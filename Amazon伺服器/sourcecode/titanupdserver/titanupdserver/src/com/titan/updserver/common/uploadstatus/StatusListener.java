package com.titan.updserver.common.uploadstatus;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.ProgressListener;


public class StatusListener implements ProgressListener {
	
	private HttpServletRequest request;
	
	public StatusListener(HttpServletRequest request){
		this.request = request;  
	}

	@Override
	public void update(long pBytesRead, long pContentLength, int pItems) {		
		UploadStatusBean bean = new UploadStatusBean(pBytesRead, pContentLength, pItems);
		request.getSession().setAttribute("UPLOAD_STATUS", bean);		
	}

}
