package com.titan.base.uploadstatus;

import java.text.DecimalFormat;

public class UploadStatusBean {
	private long pBytesRead = 0;
	private long pContentLength = 0;
	private int pItems = 0; //the index of uploading item
	
	public UploadStatusBean(){
		
	}
	
	public UploadStatusBean(long pBytesRead, long pContentLength, int pItems){
		this.pBytesRead = pBytesRead;
		this.pContentLength = pContentLength;
		this.pItems = pItems;
	}

	/**
	 * @return the pBytesRead
	 */
	public long getpBytesRead() {
		return pBytesRead;
	}

	/**
	 * @param pBytesRead the pBytesRead to set
	 */
	public void setpBytesRead(long pBytesRead) {
		this.pBytesRead = pBytesRead;
	}

	/**
	 * @return the pContentLength
	 */
	public long getpContentLength() {
		return pContentLength;
	}

	/**
	 * @param pContentLength the pContentLength to set
	 */
	public void setpContentLength(long pContentLength) {
		this.pContentLength = pContentLength;
	}

	/**
	 * @return the pItems
	 */
	public int getpItems() {
		return pItems;
	}

	/**
	 * @param pItems the pItems to set
	 */
	public void setpItems(int pItems) {
		this.pItems = pItems;
	}
	
	public String calculatePercent(){
		String rst = "";
		if(this.pContentLength==0){
			rst = "N/A";
		}else{
			DecimalFormat df = new DecimalFormat("#00.0");
			double percent= (double)this.pBytesRead*100/(double)this.pContentLength;
			rst = df.format(percent);			
		}
		return rst;
	}
	

}
