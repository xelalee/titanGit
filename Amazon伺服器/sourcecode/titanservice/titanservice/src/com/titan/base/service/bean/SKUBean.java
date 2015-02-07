package com.titan.base.service.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class SKUBean {
	private String service_type_id = "0";
	private String service_code = "";
	private String attribute = "";
	private String attribute_type = "";
	private String value = "0";
	
	public SKUBean(HashMap hm){
		if(hm!=null){
			this.service_type_id = Util.getString(hm.get("SERVICE_TYPE_ID"));
			this.service_code = Util.getString(hm.get("SERVICE_CODE"));
			this.attribute = Util.getString(hm.get("ATTRIBUTE"));
			this.attribute_type = Util.getString(hm.get("ATTRIBUTE_TYPE"));
			this.value = Util.getString(hm.get("VALUE"));
		}
	}
	
	public String getAttribute() {
		return attribute;
	}
	public void setAttribute(String attribute) {
		this.attribute = attribute;
	}
	public String getAttribute_type() {
		return attribute_type;
	}
	public void setAttribute_type(String attribute_type) {
		this.attribute_type = attribute_type;
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
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	
	

}
