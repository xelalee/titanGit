package com.titan.mytitan.login.bean;

import org.apache.log4j.Logger;

import com.titan.base.account.bean.MyAccountBean;
import com.titan.mytitan.app.util.CookieUtil;


public class LoginBean{
	static Logger logger = Logger.getLogger(LoginBean.class);

	public final static String COOKIE_USERNAME = "COOKIE_USERNAME";
	
	private String locale;
	
	private MyAccountBean accountbean;
	
	public String username;
	
	//whether or not the user is logged in
	private boolean loggedIn = false;
	
	public boolean cookied = false;
	
	public LoginBean() {
		accountbean = new MyAccountBean();
	}
	
	public String getLast_viewed_day(){
		String rst = "";
		String date = accountbean.getLast_viewed_date();
		if(date!=null){
			if(date.indexOf(" ")>-1){
				rst = date.substring(0,date.indexOf(" "));
			}			
		}
		return rst;
	}
	
	public String getLast_viewed_time(){
		String rst = "";
		String date = accountbean.getLast_viewed_date();
		if(date!=null){
			if(date.indexOf(" ")>-1){
				rst = date.substring(date.indexOf(" ")+1,date.indexOf(" ")+9);
			}			
		}
		return rst;		
	}
	
	public boolean isCookied() {
		CookieUtil cu = new CookieUtil();
		String un = cu.getCookieValue(COOKIE_USERNAME);
		if(un!=null&&un.length()>0){
			return true;
		}else{
			return false;
		}
	}

	public void setCookied(boolean cookied) {
		this.cookied = cookied;
	}
	
	public String getLocale() {
		LocaleBean bean = new LocaleBean();
		return bean.getLocale();
	}
	
	public void setLocale(String locale){
		this.locale = locale;
	}	

	public String getUsername() {
		CookieUtil cu = new CookieUtil();
		String un = cu.getCookieValue(COOKIE_USERNAME);
		if(un!=null&&un.length()>0){
			return un;
		}else{
			return "";
		}
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public boolean getLoggedIn() {
		return this.loggedIn;
	}
	
	public void setLoggedIn(boolean newLoggedIn) {
		this.loggedIn = newLoggedIn;
	}
	
	private void clear() {
		this.loggedIn = false;
	}
	
	public MyAccountBean getAccountbean() {
		return accountbean;
	}


	public void setAccountbean(MyAccountBean accountbean) {
		this.accountbean = accountbean;
	}
		
}
