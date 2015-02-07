package com.titan.mytitan.login.bean;

import java.util.Locale;

import com.titan.mytitan.app.util.CookieUtil;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.base.util.LocaleUtil;
import com.titan.base.util.Util;



public class LocaleBean {
	
	private final static boolean DEBUG = false;
	
	public final static String COOKIE_LOCALE = "USER_SITE_COOKIE_LOCALE";
	public final static String SESSION_LOCALE = "USER_SITE_SESSION_LOCALE";
	public final static String STR_CSS_EN = "";
	public final static String STR_CSS_ZH = "_zh";
	public final static String LOCALE_EN ="en";
	public final static String LOCALE_ZH_CN ="zh_CN";
	public final static String LOCALE_ZH_TW ="zh_TW";
	public final static String LOCALE_ZH_HK ="zh_HK";	
	public final static String LOCALE_ZH_MO ="zh_MO";	
	public final static String LOCALE_ZH_SG ="zh_SG";	
	
	private String locale;
	private String value1;

	/**
	 * get locale
	 * @return String value
	 */
	public String getLocale() {
		//find in session
		String lo = Util.getString(ViewUtil.getSession(SESSION_LOCALE));
		if(DEBUG){
			System.out.println(ViewUtil.getServletRequest().getRemoteAddr()+" locale in session:"+lo);
		}
		if(!lo.equals("")){
			if(this.isSupportedLocale(lo)){
				return lo;
			}
		}
		
		//find in cookie
		CookieUtil cu = new CookieUtil();
		lo = Util.getString(cu.getCookieValue(COOKIE_LOCALE));
		if(DEBUG){
			System.out.println(ViewUtil.getServletRequest().getRemoteAddr()+" locale in cookie:"+lo);
		}		
		if(!lo.equals("")){
			ViewUtil.setSession(SESSION_LOCALE, lo);
			return lo;
		}
		
		//default SC
		lo = LOCALE_ZH_CN;
		
		ViewUtil.setSession(SESSION_LOCALE, lo);
		cu.setCookie(COOKIE_LOCALE,lo);
		return lo;
	}
	
	/**
	 * get locale
	 * @return Locale value
	 */
	public Locale getLocale0(){
		return LocaleUtil.makeLocale(this.getLocale());
	}
	
	public void setLocale(String locale){
		this.locale = locale;
	}
	
    public String getValue1() {
		return value1;
	}

	public void setValue1(String value1) {
		this.value1 = value1;
	}

	//	english, ""; chinese, "_zh"
	public String getCss_option() {
		String lo = this.getLocale();
		if(lo.equalsIgnoreCase(LOCALE_ZH_CN)){
			return STR_CSS_ZH;
		}else if(lo.equalsIgnoreCase(LOCALE_ZH_TW)){
			return STR_CSS_ZH;
		}else{
			return STR_CSS_EN;
		}
	}	
	
	public boolean isSupportedLocale(String lo){
		if(lo.equalsIgnoreCase(LOCALE_EN) 
				|| lo.equalsIgnoreCase(LOCALE_ZH_CN)
				|| lo.equalsIgnoreCase(LOCALE_ZH_TW)){
			return true;
		}else{
			return false;
		}
	}
	
	public String languageAction(){
		ViewUtil.setSession(LocaleBean.SESSION_LOCALE,this.locale);

		CookieUtil cu;
		try{
			cu = new CookieUtil();
			cu.setCookie(LocaleBean.COOKIE_LOCALE,this.locale);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		
		return NavigationResults.LOGIN;
	}	
	
	public String cancelLanguageAction(){
		this.locale = this.getLocale();
		return NavigationResults.LOGIN;
	}	

}
