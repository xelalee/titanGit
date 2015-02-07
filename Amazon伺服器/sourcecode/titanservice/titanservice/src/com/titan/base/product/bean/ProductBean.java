package com.titan.base.product.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class ProductBean {
    private String sn = "";
    private String mac = "";
    private String model_id = "0";
    private String model_name = "";
    private String create_date = "";	
	
	public ProductBean(){
		
	}
	
	public ProductBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.sn = Util.getString(hm.get("SN"));
			this.mac = Util.getString(hm.get("MAC"));
			this.model_id = Util.getString(hm.get("MODEL_ID"));
			this.model_name = Util.getString(hm.get("MODEL_NAME"));
			this.create_date = Util.getString(hm.get("CREATE_DATE"));
		}
	}	

	public String getMac() {
		return mac;
	}

	public void setMac(String mac) {
		this.mac = mac;
	}

	public String getCreate_date() {
		return create_date;
	}

	public void setCreate_date(String create_date) {
		this.create_date = create_date;
	}

	public String getModel_id() {
		return model_id;
	}

	public void setModel_id(String model_id) {
		this.model_id = model_id;
	}	

	public String getModel_name() {
		return model_name;
	}

	public void setModel_name(String model_name) {
		this.model_name = model_name;
	}

	public String getSn() {
		return sn;
	}

	public void setSn(String sn) {
		this.sn = sn;
	}
	
	public boolean validateSnMac(){
		return !sn.equals("") && !mac.equals("");
	}

}
