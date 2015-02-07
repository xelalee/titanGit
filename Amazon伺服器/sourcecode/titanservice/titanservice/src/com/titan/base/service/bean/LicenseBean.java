package com.titan.base.service.bean;

import java.util.HashMap;

import com.titan.base.util.Keys;
import com.titan.base.util.Util;



public class LicenseBean {
	
	public final static int PIN_CODE_LENGTH = 16;
	
	private String license_key = "";
	private String sn = "";
	private String begin_date = "";
	private String suspend_count = "0";
	private String status = "";
	private String model_id = "";
	private String service_id = "0";
	private String service_type_id = "T";
	private String service_code = "";
	private String card_type = "";
	private String my_service_id = "";	
	private String order_id = "0";
	private String create_date = "";
	
	private boolean pinCodeGenerated = false;//is pin_code generated, SET true when it is a generated license key
	
	private String pin_code = "";

	public LicenseBean(){
		
	}
	
	public LicenseBean(String license_key){
		if(license_key!=null && license_key.length()>0){
			String[] strs = license_key.split("-");
			this.service_type_id = strs[0];
			this.service_code = strs[1];
			if(strs.length>2){
				this.pin_code = strs[2];	
			}
		}
	}
	
	public LicenseBean(HashMap hm){
		if(hm!=null){
			this.license_key = Util.getString(hm.get("LICENSE_KEY"));
			this.sn = Util.getString(hm.get("SN"));
			this.begin_date = Util.getString(hm.get("BEGIN_DATE"));
			this.suspend_count = Util.getString(hm.get("SUSPEND_COUNT"));
			this.status = Util.getString(hm.get("STATUS"));
			this.model_id = Util.getString(hm.get("MODEL_ID"));
			this.service_id = Util.getString(hm.get("SERVICE_ID"));
			this.service_type_id = Util.getString(hm.get("SERVICE_TYPE_ID"));
			this.service_code = Util.getString(hm.get("SERVICE_CODE"));
			this.card_type = Util.getString(hm.get("CARD_TYPE"));
			this.my_service_id = Util.getString(hm.get("MY_SERVICE_ID"));
			this.order_id = Util.getString(hm.get("ORDER_ID"));
			this.create_date = Util.getString(hm.get("CREATE_DATE"));
		}
	}

	public String getBegin_date() {
		return begin_date;
	}

	public void setBegin_date(String begin_date) {
		this.begin_date = begin_date;
	}

	public String getCard_type() {
		return card_type;
	}

	public void setCard_type(String card_type) {
		this.card_type = card_type;
	}

	public String getLicense_key() {
		return license_key;
	}

	public void setLicense_key(String license_key) {
		this.license_key = license_key;
	}

	public String getModel_id() {
		return model_id;
	}

	public void setModel_id(String model_id) {
		this.model_id = model_id;
	}

	public String getMy_service_id() {
		return my_service_id;
	}

	public void setMy_service_id(String my_service_id) {
		this.my_service_id = my_service_id;
	}

	public String getService_code() {
		return service_code.toUpperCase(Keys.DEFAULT_LOCALE);
	}

	public void setService_code(String service_code) {
		this.service_code = service_code;
	}

	public String getService_id() {
		return service_id;
	}

	public void setService_id(String service_id) {
		this.service_id = service_id;
	}

	public String getService_type_id() {
		return service_type_id.toUpperCase(Keys.DEFAULT_LOCALE);
	}

	public void setService_type_id(String service_type_id) {
		this.service_type_id = service_type_id;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getSuspend_count() {
		return suspend_count;
	}

	public void setSuspend_count(String suspend_count) {
		this.suspend_count = suspend_count;
	}	
	
	public String getPin_code() {
		return pin_code;
	}

	public void setPin_code(String pin_code) {
		this.pin_code = pin_code;
	}

	public boolean isPinCodeGenerated() {
		return pinCodeGenerated;
	}

	public void setPinCodeGenerated(boolean pinCodeGenerated) {
		this.pinCodeGenerated = pinCodeGenerated;
	}

	public String getService_codeByLk() {
		String rst = "";
		if(this.license_key!=null && this.license_key.length()>0){
			String[] strs = this.license_key.split("-");
			rst = strs[1];
		}
		return rst;
	}
	
	public String getService_type_idByLk() {
		String rst = "";
		if(this.license_key!=null && this.license_key.length()>0){
			String[] strs = this.license_key.split("-");
			if(strs.length>2){
				rst = strs[2];
			}
		}
		return rst;
	}
	
	public String getSn() {
		return sn;
	}

	public void setSn(String sn) {
		this.sn = sn;
	}

	public String getOrder_id() {
		return order_id;
	}

	public void setOrder_id(String order_id) {
		this.order_id = order_id;
	}

	public String getCreate_date() {
		return create_date;
	}

	public void setCreate_date(String create_date) {
		this.create_date = create_date;
	}

	public static void main(String[] args){
		LicenseBean lk = new LicenseBean("T-AV0001");
		System.out.println(lk.getLicense_key()+" "+lk.getService_type_id()+" "+lk.getService_code()+" "+lk.getPin_code());
	}
	

}
