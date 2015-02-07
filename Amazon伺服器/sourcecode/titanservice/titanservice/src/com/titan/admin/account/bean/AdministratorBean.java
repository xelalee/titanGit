package com.titan.admin.account.bean;

import java.util.HashMap;

import com.titan.base.util.PasswordCoder;
import com.titan.base.util.Util;

public class AdministratorBean {

	private String account_id;
	private String username;
	private String password;
	private String password1;
	private String email;
	private String group_id;
	private String group_name;
	public AdministratorBean(){
		
	}
	
	public AdministratorBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.account_id = Util.getString(hm.get("ACCOUNT_ID"));
			this.username = Util.getString(hm.get("USERNAME"));
			this.password = PasswordCoder.decode(Util.getString(hm.get("PASSWORD")));
			this.email = Util.getString(hm.get("EMAIL"));
			this.group_id = Util.getString(hm.get("GROUP_ID"));
			this.group_name = Util.getString(hm.get("GROUP_NAME"));
		}
	}

	public String getAccount_id() {
		return account_id;
	}

	public void setAccount_id(String account_id) {
		this.account_id = account_id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
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

	public String getPassword1() {
		return password1;
	}

	public void setPassword1(String password1) {
		this.password1 = password1;
	}

}
