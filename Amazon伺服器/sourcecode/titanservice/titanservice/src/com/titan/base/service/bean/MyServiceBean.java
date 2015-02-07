package com.titan.base.service.bean;

import java.util.HashMap;

import com.titan.base.util.Util;



public class MyServiceBean {
	public static final String STR_MY_SERVICE_ID = "MY_SERVICE_ID";
	public final static String STR_EXPIRED = "Expired";
	public final static String STR_INSTALLED = "Installed";
	public final static String STR_TRIAL = "trial";
	public final static String STR_ACTIVATE = "activate";
	public final static String STR_UPGRADE = "upgrade";	
	public final static String STR_TRIAL_SERVICE = "Trial";
	public final static String STR_STANDARD_SERVICE = "Standard";
	
	protected String my_service_id = "0";
	protected String my_product_id ="0";
	protected String service_id ="0";
	protected String service_name = "";
	protected String service_type_id ="T";
	protected String service_type = "";
	protected String service_code = "";
	protected String expiration_date = "";
	protected String suspend_date = "";
	protected String suspend_count = "0";
	protected String status = "";
	protected String remark = "";
	protected String begin_date = "";
	protected String reactivate_date = "";
	protected String value = "0";
	protected String original_date = "";

	public MyServiceBean() {
	}
	
	public MyServiceBean(HashMap hm) {
		if(hm!=null){
			this.my_service_id = Util.getString(hm.get("MY_SERVICE_ID"));
			this.my_product_id = Util.getString(hm.get("MY_PRODUCT_ID"));
			this.service_id = Util.getString(hm.get("SERVICE_ID"));
			this.service_name = Util.getString(hm.get("SERVICE_NAME"));
			this.service_type_id = Util.getString(hm.get("SERVICE_TYPE_ID"));
			if(this.service_type_id.equalsIgnoreCase("S")){
				this.service_type = "Standard";
			}else if(this.service_type_id.equalsIgnoreCase("T")){
				this.service_type = "Trial";
			}
			this.service_code = Util.getString(hm.get("SERVICE_CODE"));
			this.expiration_date = Util.getString(hm.get("EXPIRATION_DATE"));
			this.suspend_date = Util.getString(hm.get("SUSPEND_DATE"));
			this.suspend_count = Util.getString(hm.get("SUSPEND_COUNT"));
			this.status = Util.getString(hm.get("STATUS"));
			this.remark = Util.getString(hm.get("REMARK"));
			this.begin_date = Util.getString(hm.get("BEGIN_DATE"));
			this.reactivate_date = Util.getString(hm.get("REACTIVATE_DATE"));
			this.value = Util.getString(hm.get("VALUE"),"0");
			this.original_date = Util.getString(hm.get("ORIGINAL_DATE"));
		}
	}

	public String getBegin_date() {
		return begin_date;
	}

	public void setBegin_date(String begin_date) {
		this.begin_date = begin_date;
	}

	public String getExpiration_date() {
		return expiration_date;
	}

	public void setExpiration_date(String expiration_date) {
		this.expiration_date = expiration_date;
	}
	
	public String getExpiration_date_disp(){
		String expirationDate = this.expiration_date;
		String originalDate = this.original_date;
		int blank_index1 = expirationDate.indexOf(" ");
		int blank_index2 = originalDate.indexOf(" ");
		if(blank_index1 > -1){
			expirationDate = expirationDate.substring(0,blank_index1);
		}
		if(blank_index2 > -1){
			originalDate = originalDate.substring(0,blank_index2);
		}
		if(expirationDate.compareTo(originalDate)>0){
			return originalDate + " extends to " + expirationDate;
		}else{
			return expirationDate;
		}
	}

	public String getMy_product_id() {
		return my_product_id;
	}

	public void setMy_product_id(String my_product_id) {
		this.my_product_id = my_product_id;
	}

	public String getMy_service_id() {
		return my_service_id;
	}

	public void setMy_service_id(String my_service_id) {
		this.my_service_id = my_service_id;
	}

	public String getService_id() {
		return service_id;
	}

	public void setService_id(String service_id) {
		this.service_id = service_id;
	}

	public String getService_type_id() {
		return service_type_id;
	}

	public void setService_type_id(String service_type_id) {
		this.service_type_id = service_type_id;
	}
	
	public String getService_type() {
		return service_type;
	}

	public void setService_type(String service_type) {
		this.service_type = service_type;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}



	public String getReactivate_date() {
		return reactivate_date;
	}

	public void setReactivate_date(String reactivate_date) {
		this.reactivate_date = reactivate_date;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getService_code() {
		return service_code;
	}

	public void setService_code(String service_code) {
		this.service_code = service_code;
	}

	public String getSuspend_count() {
		return suspend_count;
	}

	public void setSuspend_count(String suspend_count) {
		this.suspend_count = suspend_count;
	}

	public String getSuspend_date() {
		return suspend_date;
	}

	public void setSuspend_date(String suspend_date) {
		this.suspend_date = suspend_date;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getOriginal_date() {
		return original_date;
	}

	public void setOriginal_date(String original_date) {
		this.original_date = original_date;
	}

	public String getService_name() {
		return service_name;
	}

	public void setService_name(String service_name) {
		this.service_name = service_name;
	}

}
