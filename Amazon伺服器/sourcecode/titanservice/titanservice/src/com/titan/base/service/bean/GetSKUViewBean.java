package com.titan.base.service.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class GetSKUViewBean {
	private String authentication_code = "";
	private String activation_key = "";
	private String my_service_id = "0"; 
	private String service_id = "0";
	private String service_code = "";
	private String begin_date = "";
	private String expiration_date = "";
	private String reactivate_date = "";
	private String service_type_id = "0"; 
	private String status = "";
	private String sku_attribute = "";
	private String sku_attribute_type = "";
	private String sku_value = "";
	
	public GetSKUViewBean(HashMap hm){
		if(hm!=null){
			this.authentication_code = Util.getString(hm.get("AUTHENTICATION_CODE"));
			this.activation_key = Util.getString(hm.get("ACTIVATION_KEY"));
			this.my_service_id = Util.getString(hm.get("MY_SERVICE_ID"));
			this.service_id = Util.getString(hm.get("SERVICE_ID"));
			this.service_code = Util.getString(hm.get("SERVICE_CODE"));
			this.begin_date = Util.getString(hm.get("BEGIN_DATE"));
			this.expiration_date = Util.getString(hm.get("EXPIRATION_DATE"));
			this.reactivate_date = Util.getString(hm.get("REACTIVATE_DATE"));
			this.service_type_id = Util.getString(hm.get("SERVICE_TYPE_ID"));
			this.status = Util.getString(hm.get("STATUS"));
			this.sku_attribute = Util.getString(hm.get("SKU_ATTRIBUTE"));
			this.sku_attribute_type = Util.getString(hm.get("SKU_ATTRIBUTE_TYPE"));
			this.sku_value = Util.getString(hm.get("SKU_VALUE"));
		}
	}
	
	public String getActivation_key() {
		return activation_key;
	}
	public void setActivation_key(String activation_key) {
		this.activation_key = activation_key;
	}
	public String getAuthentication_code() {
		return authentication_code;
	}
	public void setAuthentication_code(String authentication_code) {
		this.authentication_code = authentication_code;
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
	public String getMy_service_id() {
		return my_service_id;
	}
	public void setMy_service_id(String my_service_id) {
		this.my_service_id = my_service_id;
	}
	public String getReactivate_date() {
		return reactivate_date;
	}
	public void setReactivate_date(String reactivate_date) {
		this.reactivate_date = reactivate_date;
	}
	public String getService_id() {
		return service_id;
	}
	public void setService_id(String service_id) {
		this.service_id = service_id;
	}	
	public String getService_code() {
		return service_code;
	}
	public void setService_code(String service_code) {
		this.service_code = service_code;
	}

	public String getService_type_id() {
		return service_type_id;
	}
	public void setService_type_id(String service_type_id) {
		this.service_type_id = service_type_id;
	}
	public String getSku_attribute() {
		return sku_attribute;
	}
	public void setSku_attribute(String sku_attribute) {
		this.sku_attribute = sku_attribute;
	}
	
	public String getSku_attribute_type() {
		return sku_attribute_type;
	}

	public void setSku_attribute_type(String sku_attribute_type) {
		this.sku_attribute_type = sku_attribute_type;
	}

	public String getSku_value() {
		return sku_value;
	}
	public void setSku_value(String sku_value) {
		this.sku_value = sku_value;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	
}
