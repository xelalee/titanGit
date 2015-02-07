package com.titan.base.configure;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.servlet.ServletContext;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;


public class Configure {
	
	static Logger logger = Logger.getLogger(Configure.class);
	
	private final static String WEBINF_CONF_DIR = "/WEB-INF/conf/";
	
	public static Properties configure = null;
	
	public static Properties dbConfigure = null;
	
	public static Properties jobConfigure = null;
	
	/**
	 * get configure, if not initialized, load it
	 * @return
	 */
	public static void initial(ServletContext context){
		initLog4j(context);
		
		configure = loadProperties(context, "config.properties");
		
		dbConfigure = loadProperties(context, "database-config.properties");
		
		jobConfigure = loadProperties(context, "jobconfig.properties");
		
	}
	
    private static void initLog4j(ServletContext context){
		try{
			String filename = "log4j.properties" ;
			Properties props = new Properties();
			InputStream is = context.getResourceAsStream(WEBINF_CONF_DIR+filename);
			props.load(is);
			PropertyConfigurator.configure(props);
		}catch(Exception ex){
			ex.printStackTrace();
			BasicConfigurator.configure();
		}
    }
    
    private static Properties loadProperties(ServletContext context, String filename){
		Properties props = new Properties();
		
		try {
			InputStream is = context.getResourceAsStream(WEBINF_CONF_DIR+filename);
			props.load(is);
		} catch (IOException e) {
			logger.error("", e);
		}
		return props;
    }
    

}
