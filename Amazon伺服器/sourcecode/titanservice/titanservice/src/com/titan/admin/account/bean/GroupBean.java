package com.titan.admin.account.bean;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.titan.base.util.Util;

public class GroupBean {
	
	private String group_id;
	private String group_name;
	
	private List<String> functions = new ArrayList<String>();

	public GroupBean() {
	}
	
	public GroupBean(HashMap<String, Object> hm) {
		if(hm!=null){
			this.group_id = Util.getString(hm.get("GROUP_ID"));
			this.group_name = Util.getString(hm.get("GROUP_NAME"));
		}
	}

	public String getGroup_id() {
		return group_id;
	}

	public void setGroup_id(String group_id) {
		this.group_id = group_id;
	}

	public String getGroup_name() {
		return group_name;
	}

	public void setGroup_name(String group_name) {
		this.group_name = group_name;
	}

	public List<String> getFunctions() {
		return functions;
	}

	public void setFunctions(List<String> functions) {
		this.functions = functions;
	}

}
