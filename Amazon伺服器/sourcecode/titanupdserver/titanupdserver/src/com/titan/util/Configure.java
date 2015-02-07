package com.titan.util;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import java.util.ResourceBundle;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;

import com.titan.updserver.common.codemessage.CodeMessage;

public class Configure {
	
	static Logger logger = Logger.getLogger(Configure.class);
	
	private final static String WEBINF_CONF_DIR = "/WEB-INF/conf/";
	
	public static Properties DATABASE_CONFIGURE;
	
	public static Properties CONFIGURE;
	
	public static Map<String, CodeMessage> codeMessageMap = new HashMap<String, CodeMessage>();
	
	public static void initialConfig(ServletContext context){

		try{
			String filename = "database-config.properties" ;
			DATABASE_CONFIGURE = new Properties();
			InputStream is = context.getResourceAsStream(WEBINF_CONF_DIR+filename);
			DATABASE_CONFIGURE.load(is);
			logger.info(DATABASE_CONFIGURE);
		}catch(Exception ex){
			logger.error("", ex);
		}
		
		try{
			String filename = "config.properties" ;
			CONFIGURE = new Properties();
			InputStream is = context.getResourceAsStream(WEBINF_CONF_DIR+filename);
			CONFIGURE.load(is);
			logger.info(CONFIGURE);
		}catch(Exception ex){
			logger.error("", ex);
		}
		
		//initial code message
		try{
			String resourcePath = "com.titan.updserver.common.codemessage.codeMessage";
			ResourceBundle resources = ResourceBundle.getBundle(resourcePath);
			Enumeration<String> keys = resources.getKeys();
			while(keys.hasMoreElements()){
				String key = keys.nextElement();
				String value = resources.getString(key);
				CodeMessage cm = new CodeMessage(key, value);
				codeMessageMap.put(key, cm);
				logger.debug("key: "+key+"; value: "+value);
			}
			logger.info("codeMessageMap.size(): "+codeMessageMap.size());
		}catch(Exception ex){
			logger.error("", ex);
		}
		
	}
	
	public final static String LOCAL_IP = getLOCAL_IP();
	
	public final static String LOCAL_HOST=getLOCAL_HOST();
	
	private static String getLOCAL_IP(){
		String localip="";
		try{
			localip=java.net.InetAddress.getLocalHost().getHostAddress();
		}catch(Exception ex){
		}
		return localip;
	}	
	
	private static String getLOCAL_HOST(){
		String localhost="";
		try{
			localhost=java.net.InetAddress.getLocalHost().toString();
		}catch(Exception ex){
		}
		return localhost;
	}

}
