package com.titan.updserver.common;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import com.titan.util.Keys;

import com.titan.updserver.common.codemessage.CodeMessage;

public class DownloadResponse {
	
	private String code = "0";
	private String message = "N/A";
	
	private boolean succ = false;
	private long bytesum = 0;
	private long timeCost = 0;
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		buffer.append("<returns>");
		buffer.append("<code>"+this.code+"</code>");
		buffer.append("<message>"+this.message+"</message>");
		buffer.append("</returns>");
		return buffer.toString();
	}
	
	public void responseError(HttpServletResponse response, CodeMessage cm) throws IOException{
		this.code = cm.getCode();
		this.message = cm.getMessage();
		
    	response.setContentType("text/plain");
    	response.getWriter().println(this.toString());
	}
	
	public long responseFile(HttpServletResponse response, String filePath, String targetFileName) throws IOException{
		long t1 = System.currentTimeMillis();
		File file = new File(filePath);
        response.reset();
		response.setContentType("bin");
		response.setHeader("Content-Length",String.valueOf(file.length()));
		response.setHeader("Content-Disposition","attachment;filename="+targetFileName);
 
		final ServletOutputStream sos = response.getOutputStream();
		
		final BufferedInputStream inStream = new BufferedInputStream(new FileInputStream(file.getPath()));
		
		long bytesum = 0;
		int byteread = 0;
			
		try{
	    	byte[]  buffer = new  byte[Keys.BUFFER_SIZE];
			while ((byteread = inStream.read(buffer))!=-1)
			 {
			   bytesum += byteread;
			   sos.write(buffer,0,byteread);
			 } 
			sos.flush();
		}finally{
			
			try{				
			    inStream.close();
			}catch(Exception ex){}
			try{				
				sos.close();
			}catch(Exception ex){}
			
			this.bytesum = bytesum;
			
			long t2 = System.currentTimeMillis();
			this.timeCost = (t2-t1)/1000;
		}
		
		this.succ = true;
		
		return bytesum;
	}

	public boolean isSucc() {
		return succ;
	}

	public void setSucc(boolean succ) {
		this.succ = succ;
	}

	public long getBytesum() {
		return bytesum;
	}

	public void setBytesum(long bytesum) {
		this.bytesum = bytesum;
	}

	public long getTimeCost() {
		return timeCost;
	}

	public void setTimeCost(long timeCost) {
		this.timeCost = timeCost;
	}

}
