package com.titan.base.util;

import java.util.Locale;

public interface Keys {
    
    public final static int INTERNAL_SERVER_ERROR = 500;
    
    public final static Locale DEFAULT_LOCALE = Locale.US;
    
	// account INFOR
	public final static String USER_INFO = "USER_SITE_USER_INFO" ;
	
	public final static String ADMIN_USER_INFO = "ADMIN_SITE_USER_INFO" ;
	
	public final static String SESSION_LISTENER = "SESSION_LISTENER";

	public final String QUICK_CODE = "COUNTRY_CODE";
	public final String QUICK_CODE_VALUE1 = "VALUE1";
	public final String COUNTRY_CODE = "COUNTRY_CODE";
	public final String SERVICE_NAME = "SERVICE_NAME";
	
	public final static String STATUS_ACTIVE = "ACTIVE";
	public final static String STATUS_INACTIVE = "INACTIVE";
	
	public final static String STR_PROTOCOL_HTTPS = "HTTPS";
	
	public final static String STR_ZERO = "0";
	public final static String STR_NOT_AVAILABLE = "N/A";
	
	public final static String STR_EXPIRED = "Expired";
	public final static String STR_INSTALLED = "Installed";
	
	public final static String STR_ERROR = "ERROR";
	public final static String STR_MSG = "MSG";
	
	public final static int MILLIS_IN_5_SECONDS = 5*1000;
	public final static int MILLIS_IN_10_SECONDS = 10*1000;
	public final static int MILLIS_IN_30_SECONDS = 30*1000;
	
	public final static int MILLIS_IN_1_MINUTES = 60*1000;
	public final static int MILLIS_IN_5_MINUTES = 5*60*1000;
	public final static int MILLIS_IN_10_MINUTES = 10*60*1000;
	
	
	public final static String LOCALE_EN ="en";
	public final static String LOCALE_ZH_CN ="zh_CN";
	public final static String LOCALE_ZH_TW ="zh_TW";
	
	public final static String SKU_ATTRIBUTE_TYPE_DATE = "date";
	public final static String SKU_ATTRIBUTE_TYPE_NUMBER = "number";
	public final static String SKU_ATTRIBUTE_TYPE_BOOLEAN = "boolean";

}
