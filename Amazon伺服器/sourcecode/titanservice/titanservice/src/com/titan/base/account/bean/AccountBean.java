package com.titan.base.account.bean;


import java.util.HashMap;

import com.titan.base.util.Key;
import com.titan.base.util.PasswordCoder;
import com.titan.base.util.Util;


public class AccountBean{
	
	public final static String STR_ACCOUNT_ID = "ACCOUNT_ID";
	public final static String STR_ACTIVE_FLAG = "ACTIVATION";
	public final static String STR_INITIAL_FLAG = "INITIATION";
	public final static String STR_VALIDATION_CODE = "VALIDATION_CODE";
	public final static int INT_MINIMUM_ACCOUNT_LENGTH = 6;
	
	private String account_id="";
	private String username="";
	private String password="";
	private String password1="";
	private String password2="";
	private String password_hint="";
	private String first_name="";
	private String last_name="";
	private String company="";
	private String address="";
	private String city="";
	private String state="";
	private String country_code="045";
	private String postal_code="";
	private String phone="";
	private String fax="";
	private String email="";
	private String time_zone_code="";
	private String login_count="";
	private String last_viewed_ip="";
	private String status="";
	private String last_viewed_date="";
	private boolean reminder=true;
	private String reminder_lang="";
	private String create_date="";
	private String create_by="";
	private String update_date="";
	private String update_by="";
	private String login_status="";
	private String subscription_code="";
	
	public AccountBean(){
		this.reminder_lang = "en";
	}

	public AccountBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.account_id = Util.getString(hm.get("ACCOUNT_ID"));
			this.address = Util.getString(hm.get("ADDRESS"));
			this.city = Util.getString(hm.get("CITY"));
			this.company = Util.getString(hm.get("COMPANY"));
			this.country_code = Util.getString(hm.get("COUNTRY_CODE"));
			this.create_by = Util.getString(hm.get("CREATE_BY"));
			this.create_date = Util.getString(hm.get("CREATE_DATE"));
			this.email = Util.getString(hm.get("EMAIL"));
			this.fax = Util.getString(hm.get("FAX"));
			this.first_name = Util.getString(hm.get("FIRST_NAME"));
			this.last_name = Util.getString(hm.get("LAST_NAME"));
			this.last_viewed_date = Util.getString(hm.get("LAST_VIEWED_DATE"));
			this.last_viewed_ip = Util.getString(hm.get("LAST_VIEWED_IP"));
			this.login_count = Util.getString(hm.get("LOGIN_COUNT"));
			this.password = PasswordCoder.decode(Util.getString(hm.get("PASSWORD")));
			this.password_hint = Util.getString(hm.get("PASSWORD_HINT"));
			this.phone = Util.getString(hm.get("PHONE"));
			this.postal_code = Util.getString(hm.get("POSTAL_CODE"));
			this.reminder = Util.getString(hm.get("REMINDER")).equals("T")?true:false;
			this.reminder_lang = Util.getString(hm.get("REMINDER_LANG"));
			this.state = Util.getString(hm.get("STATE"));
			this.status = Util.getString(hm.get("STATUS"));
			this.time_zone_code = Util.getString(hm.get("TIME_ZONE_CODE"));
			this.update_by = Util.getString(hm.get("UPDATE_BY"));
			this.update_date = Util.getString(hm.get("UPDATE_DATE"));
			this.username = Util.getString(hm.get("USERNAME"));
			this.login_status = Util.getString(hm.get("LOGIN_STATUS"));
			this.subscription_code = Util.getString(hm.get("SUBSCRIPTION_CODE"));;
		}
	}
	
	public AccountBean(String account_id){
        this.account_id = account_id;
	}

	
	public String getAccount_id() {
		return account_id;
	}

	public void setAccount_id(String account_id) {
		this.account_id = account_id;
	}

	public String getAddress() {
		return address.trim();
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCity() {
		return city.trim();
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getCompany() {
		return company.trim();
	}

	public void setCompany(String company) {
		this.company = company;
	}

	public String getCountry_code() {
		return country_code;
	}

	public void setCountry_code(String country_code) {
		this.country_code = country_code;
	}

	public String getCreate_by() {
		return create_by;
	}

	public void setCreate_by(String create_by) {
		this.create_by = create_by;
	}

	public String getCreate_date() {
		return create_date;
	}

	public void setCreate_date(String create_date) {
		this.create_date = create_date;
	}

	public String getEmail() {
		return email.trim();
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getFax() {
		return fax.trim();
	}

	public void setFax(String fax) {
		this.fax = fax;
	}

	public String getFirst_name() {
		return first_name.trim();
	}

	public void setFirst_name(String first_name) {
		this.first_name = first_name;
	}

	public String getLast_name() {
		return last_name.trim();
	}

	public void setLast_name(String last_name) {
		this.last_name = last_name;
	}

	public String getLast_viewed_date() {
		return last_viewed_date;
	}

	public void setLast_viewed_date(String last_viewed_date) {
		this.last_viewed_date = last_viewed_date;
	}

	public String getLast_viewed_ip() {
		return last_viewed_ip;
	}

	public void setLast_viewed_ip(String last_viewed_ip) {
		this.last_viewed_ip = last_viewed_ip;
	}

	public String getLogin_count() {
		return login_count;
	}

	public void setLogin_count(String login_count) {
		this.login_count = login_count;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPassword_hint() {
		return password_hint.trim();
	}

	public void setPassword_hint(String password_hint) {
		this.password_hint = password_hint;
	}

	public String getPassword1() {
		return password1;
	}

	public void setPassword1(String password1) {
		this.password1 = password1;
	}

	public String getPassword2() {
		return password2;
	}

	public void setPassword2(String password2) {
		this.password2 = password2;
	}

	public String getPhone() {
		return phone.trim();
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPostal_code() {
		return postal_code.trim();
	}

	public void setPostal_code(String postal_code) {
		this.postal_code = postal_code;
	}

	public boolean getReminder() {
		return reminder;
	}

	public void setReminder(boolean reminder) {
		this.reminder = reminder;
	}

	public String getReminder_lang() {
		return reminder_lang.trim();
	}

	public void setReminder_lang(String reminder_lang) {
		this.reminder_lang = reminder_lang;
	}

	public String getState() {
		return state.trim();
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getStatus() {
		return status.trim();
	}

	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getTime_zone_code() {
		return time_zone_code.trim();
	}

	public void setTime_zone_code(String time_zone_code) {
		this.time_zone_code = time_zone_code;
	}

	public String getUpdate_by() {
		return update_by.trim();
	}

	public void setUpdate_by(String update_by) {
		this.update_by = update_by;
	}

	public String getUpdate_date() {
		return update_date.trim();
	}

	public void setUpdate_date(String update_date) {
		this.update_date = update_date;
	}

	public String getUsername() {
		return username.trim();
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getLogin_status() {
		return login_status;
	}

	public void setLogin_status(String login_status) {
		this.login_status = login_status;
	}
	
	public String getSubscription_code() {
		return subscription_code;
	}

	public void setSubscription_code(String subscription_code) {
		this.subscription_code = subscription_code;
	}
	
	public String getFullname(String locale){
		String rst = "";
		//LocaleBean bean = new LocaleBean();
		if(locale.equalsIgnoreCase(com.titan.base.util.Keys.LOCALE_ZH_CN)
		 ||locale.equalsIgnoreCase(com.titan.base.util.Keys.LOCALE_ZH_TW)){
			rst = this.last_name+this.first_name;
		}else{
			rst = this.first_name+"."+this.last_name;
		}
		return rst;
	}
	
	/**
	 * to check is username valid
	 * @param username0
	 * @return
	 */
	public static boolean isAllCharsValid(String username0){
		boolean isValid = true;
		final String pattern = "[a-zA-Z0-9.@\\-_]*";
		//allowed chars: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.@-_
		String username = username0.trim();
		if(username==null){
			isValid = false;
		}else{
			isValid = username.matches(pattern);			
		}	
		return isValid;
	}
	
}
