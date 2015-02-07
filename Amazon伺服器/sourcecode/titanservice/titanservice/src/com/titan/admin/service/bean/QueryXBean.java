package com.titan.admin.service.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class QueryXBean {
	private String username;
	private String sn;
	private String mac;
	private String model;
	private String my_service_id;
	private String service_name;
	private String service_type_id;
	private String status;

	public QueryXBean() {
		// TODO Auto-generated constructor stub
	}
	
	public QueryXBean(HashMap<String, Object> hm) {
		if(hm!=null){
			this.username = Util.getString(hm.get("USERNAME"));
			this.sn = Util.getString(hm.get("SN"));
			this.mac = Util.getString(hm.get("MAC"));
			this.model = Util.getString(hm.get("MODEL_NAME"));
			this.my_service_id = Util.getString(hm.get("MY_SERVICE_ID"));
			this.service_name = Util.getString(hm.get("SERVICE_NAME"));
			this.service_type_id = Util.getString(hm.get("SERVICE_TYPE_ID"));
			this.status = Util.getString(hm.get("STATUS"));
		}
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getSn() {
		return sn;
	}

	public void setSn(String sn) {
		this.sn = sn;
	}

	public String getMac() {
		return mac;
	}

	public void setMac(String mac) {
		this.mac = mac;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String model) {
		this.model = model;
	}

	public String getService_name() {
		return service_name;
	}

	public void setService_name(String service_name) {
		this.service_name = service_name;
	}

	public String getService_type_id() {
		return service_type_id;
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

	public String getMy_service_id() {
		return my_service_id;
	}

	public void setMy_service_id(String my_service_id) {
		this.my_service_id = my_service_id;
	}

}
