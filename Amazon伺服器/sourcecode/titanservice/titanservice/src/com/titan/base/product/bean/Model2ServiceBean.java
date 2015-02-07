package com.titan.base.product.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class Model2ServiceBean {
    private String model_id = "0";
    private String service_type_id = "0";
    private String service_code = "";
    private String service_id = "0";
    
    public Model2ServiceBean(HashMap<String, Object> hm){
    	if(hm!=null){
        	this.model_id = Util.getString(hm.get("MODEL_ID"));
        	this.service_type_id = Util.getString(hm.get("SERVICE_TYPE_ID"));
        	this.service_code = Util.getString(hm.get("SERVICE_CODE"));
        	this.service_id = Util.getString(hm.get("SERVICE_ID"));    		
    	}
    }
    
	public String getModel_id() {
		return model_id;
	}
	public void setModel_id(String model_id) {
		this.model_id = model_id;
	}
	public String getService_code() {
		return service_code;
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
		return service_type_id;
	}
	public void setService_type_id(String service_type_id) {
		this.service_type_id = service_type_id;
	}
	
}
