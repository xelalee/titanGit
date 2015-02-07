package com.titan.updserver.firmware.bean;

import java.util.HashMap;

import com.titan.util.Util;

public class FirmwareCompareBean{
	private FirmwareBean firmware;
	private String signature_status = "";
	private boolean compareEquals = false;
	private String compareResult = "";
	
	public FirmwareCompareBean(){
		this.firmware = new FirmwareBean();
	}
	
	public FirmwareCompareBean(HashMap<String, Object> hm){
		this.firmware = new FirmwareBean(hm);
		if(hm!=null){
			this.signature_status = Util.getString(hm.get("SIGNATURE_STATUS"));
		}
	}

	/**
	 * @return the signature_status
	 */
	public String getSignature_status() {
		return signature_status;
	}

	/**
	 * @param signature_status the signature_status to set
	 */
	public void setSignature_status(String signature_status) {
		this.signature_status = signature_status;
	}

	/**
	 * @return the signature
	 */
	public FirmwareBean getSignature() {
		return firmware;
	}

	/**
	 * @param signature the signature to set
	 */
	public void setSignature(FirmwareBean signature) {
		this.firmware = signature;
	}

	/**
	 * @return the compareEquals
	 */
	public boolean isCompareEquals() {
		return compareEquals;
	}

	/**
	 * @param compareEquals the compareEquals to set
	 */
	public void setCompareEquals(boolean compareEquals) {
		this.compareEquals = compareEquals;
	}

	/**
	 * @return the compareResult
	 */
	public String getCompareResult() {
		return compareResult;
	}

	/**
	 * @param compareResult the compareResult to set
	 */
	public void setCompareResult(String compareResult) {
		this.compareResult = compareResult;
	}	

}
