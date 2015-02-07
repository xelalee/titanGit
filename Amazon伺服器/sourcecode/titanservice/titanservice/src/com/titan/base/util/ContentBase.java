package com.titan.base.util;

import java.io.File;

import org.apache.log4j.Logger;

import com.titan.base.configure.Configure;

public class ContentBase {
	
	static Logger logger = Logger.getLogger(ContentBase.class);
	
	static String CONTENT_HOME = Configure.configure.getProperty("CONTENT_HOME");
	
	private static ContentBase instance = new ContentBase();
	public static ContentBase getInstance(){
		return instance;
	}
	
	public ContentBase() {
		// TODO Auto-generated constructor stub
	}
	
	public String getTempPath(){
		String dir = CONTENT_HOME+File.separator+"registerTemp";
		File file = new File(dir);
		if(!file.exists()){
			file.mkdirs();
		}
		return dir;
	}

}
