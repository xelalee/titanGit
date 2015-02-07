/*
 * Created on 2012-5-30
 *
 * COPYRIGHT (C) 2012, Titan Corporation   Co., Ltd                  
 * Protected as an unpublished work. All Rights Reserved.
 * Titan PROPRIETARY/CONFIDENTIAL.                                               
 *                                  
 * The computer program listings, specifications, and 
 * documentation herein are the property of Titan 
 * Corporation and shall not be reproduced, copied, 
 * disclosed, or used in whole or in part for any reason 
 * without the prior express written permission of     
 * Titan Corporation.  
 */
package com.titan.updserver.account.bean;

import java.util.HashMap;

import com.titan.util.Util;

public class AccountBean {
	
	private String account_id;
	private String group_id;
	private String username;
	private String password;
	private String email;
	private String create_date;
	private String create_by; 	
	
	private String group_name;
	
	public AccountBean(){
		
	}

	public AccountBean(HashMap hm){
		if(hm!=null){
			this.account_id = Util.getString(hm.get("ACCOUNT_ID"));
			this.group_id = Util.getString(hm.get("GROUP_ID"));
			this.username = Util.getString(hm.get("USERNAME"));
			this.password = Util.getString(hm.get("PASSWORD"));
			this.email = Util.getString(hm.get("EMAIL"));
			this.create_date = Util.getString(hm.get("CREATE_DATE"));
			this.create_by = Util.getString(hm.get("CREATE_BY"));
			this.group_name = Util.getString(hm.get("GROUP_NAME"));
		}
	}
	
	/**
	 * @return the account_id
	 */
	public String getAccount_id() {
		return account_id;
	}

	/**
	 * @param account_id the account_id to set
	 */
	public void setAccount_id(String account_id) {
		this.account_id = account_id;
	}

	/**
	 * @return the group_id
	 */
	public String getGroup_id() {
		return group_id;
	}

	/**
	 * @param group_id the group_id to set
	 */
	public void setGroup_id(String group_id) {
		this.group_id = group_id;
	}

	/**
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * @param username the username to set
	 */
	public void setUsername(String username) {
		this.username = username;
	}

	/**
	 * @return the password
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * @param password the password to set
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * @return the email
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * @param email the email to set
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * @return the create_date
	 */
	public String getCreate_date() {
		return create_date;
	}

	/**
	 * @param create_date the create_date to set
	 */
	public void setCreate_date(String create_date) {
		this.create_date = create_date;
	}

	/**
	 * @return the create_by
	 */
	public String getCreate_by() {
		return create_by;
	}

	/**
	 * @param create_by the create_by to set
	 */
	public void setCreate_by(String create_by) {
		this.create_by = create_by;
	}

	/**
	 * @return the group_name
	 */
	public String getGroup_name() {
		return group_name;
	}

	/**
	 * @param group_name the group_name to set
	 */
	public void setGroup_name(String group_name) {
		this.group_name = group_name;
	}
	

}
