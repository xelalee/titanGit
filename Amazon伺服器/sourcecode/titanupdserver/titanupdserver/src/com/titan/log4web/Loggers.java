package com.titan.log4web;

import java.util.HashMap;

import com.titan.util.Util;

public class Loggers
{  

	public static Loggers Instance()
	{
		return _instance;
	}
	
	public String getLoggerName(String logger) {
		String name=Util.getString(_server_loggers.get(logger));
		if(name.equals("")) name=Util.getString(_device_loggers.get(logger));
		return name;
	}
	

	private Loggers()
	{
		_server_loggers = new HashMap();	
		_server_loggers.put("ALL", "all");
		_server_loggers.put("SIGNATURE MANAGEMENT", "signature_management");
		_server_loggers.put("MAILSHELL MANAGEMENT", "mailshell_management");
		_server_loggers.put("SYSTEM", "system");
		
		_device_loggers = new HashMap();
		_device_loggers.put("", "");
		_device_loggers.put("SIGNATURE UPDATE", "signature_update");
		_device_loggers.put("SIGNATURE DOWNLOAD", "signature_download");
		_device_loggers.put("MAILSHELL UPDATE", "mailshell_update");
		_device_loggers.put("MAILSHELL DOWNLOAD", "mailshell_download");

	}

	public String[] getServerLoggers()
	{
		return _server_logger_array;
	}
	
	public String[] getDeviceLoggers()
	{
		return _device_logger_array;
	}

	private static final String _server_logger_array[] = {
		"ALL",
		"SIGNATURE MANAGEMENT", 
		"MAILSHELL MANAGEMENT",
		"SYSTEM"
	};
	
	private static final String _device_logger_array[] = {
	    "",
		"SIGNATURE UPDATE",
		"SIGNATURE DOWNLOAD",
		"MAILSHELL UPDATE",
		"MAILSHELL DOWNLOAD"
	};

	private HashMap _server_loggers;
	private HashMap _device_loggers;
	private static Loggers _instance = new Loggers();

}
