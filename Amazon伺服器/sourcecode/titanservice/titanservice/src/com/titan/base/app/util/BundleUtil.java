package com.titan.base.app.util;

import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;


public class BundleUtil {
	public static final String RESOURCES = "com.titan.mytitan.app.bundles.ModelResources";
	public static final String ERROR_RESOURCES = "com.titan.base.app.error.bundles.ErrorResources";
	public static final String EXCEPTION_RESOURCES = "com.titan.base.app.exception.bundles.ExceptionResources";
	public static final String MAIL_RESOURCES = "com.titan.base.app.mail.bundles.MailResources";
	public static final String RESPONSE_RESOURCES = "com.titan.base.app.response.bundles.ResponseResources";
	
	private ResourceBundle resources;
	
	private synchronized ResourceBundle getResources(String path) {
		return getResources(path,null);
	}	
	
	private synchronized ResourceBundle getResources(String path,Locale locale0) {
		String path1 = path;
		if(path.equalsIgnoreCase("")){
			path1 = RESOURCES;
		}
		if (resources == null) {
			try {
				Locale locale = locale0;
				if(locale0==null){
					locale = Locale.ENGLISH;
				}
				resources = ResourceBundle.getBundle(path1, locale);
			} catch (MissingResourceException x) {
				throw new InternalError(x.getMessage());
			}
		}
		return resources;
	}	
	
	public static String getResource(String path, String key) {
		return getResource(path,key,null);
	}
	
	public static String getResource(String path, String key, Locale locale0) {
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		BundleUtil util = new BundleUtil();
		return util.getResources(path,locale).getString(key);

	}

	public static String getResource(String key) {
		return getResource("", key, null);
	}
	
	public static String getResource(String key, Locale locale0) {
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		return getResource("", key, locale);
	}
	
	public static String getErrorResource(String key){
		return getResource(ERROR_RESOURCES, key);
	}
	
	public static String getErrorResource(String key, Locale locale){
		return getResource(ERROR_RESOURCES, key, locale);
	}
	
	public static String getExceptionResource(String key){
		return getResource(EXCEPTION_RESOURCES, key);
	}
	
	public static String getExceptionResource(String key, Locale locale){
		return getResource(EXCEPTION_RESOURCES, key, locale);
	}
	
	public static String getMailResource(String key){
		return getResource(MAIL_RESOURCES, key);
	}
	
	public static String getMailResource(String key, Locale locale){
		return getResource(MAIL_RESOURCES, key, locale);
	}

	public static ResourceBundle getResponseResources(){
		ResourceBundle res = null;
		try {
			res = ResourceBundle.getBundle(RESPONSE_RESOURCES, Locale.ENGLISH);
		} catch (MissingResourceException x) {
			throw new InternalError(x.getMessage());
		}		
		return res;
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

}
