package com.titan.admin.account.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class FunctionBean {

	private String function_id;
	private String menu_id; 
	private String menu_name;
	private String function_name;
	private String url;
	private String sort_id;  

	public FunctionBean() {
	}
	
	public FunctionBean(HashMap<String, Object> hm) {
		if(hm!=null){
			this.function_id = Util.getString(hm.get("FUNCTION_ID"));
			this.menu_id = Util.getString(hm.get("MENU_ID"));
			this.menu_name = Util.getString(hm.get("MENU_NAME"));
			this.function_name = Util.getString(hm.get("FUNCTION_NAME"));
			this.url = Util.getString(hm.get("URL"));
			this.sort_id = Util.getString(hm.get("SORT_ID"));
		}
	}

	public String getFunction_id() {
		return function_id;
	}

	public void setFunction_id(String function_id) {
		this.function_id = function_id;
	}

	public String getMenu_id() {
		return menu_id;
	}

	public void setMenu_id(String menu_id) {
		this.menu_id = menu_id;
	}

	public String getMenu_name() {
		return menu_name;
	}

	public void setMenu_name(String menu_name) {
		this.menu_name = menu_name;
	}

	public String getFunction_name() {
		return function_name;
	}

	public void setFunction_name(String function_name) {
		this.function_name = function_name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getSort_id() {
		return sort_id;
	}

	public void setSort_id(String sort_id) {
		this.sort_id = sort_id;
	}		
	
}
