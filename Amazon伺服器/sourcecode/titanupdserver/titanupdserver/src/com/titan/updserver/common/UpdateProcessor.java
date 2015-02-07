package com.titan.updserver.common;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.titan.util.Configure;
import com.titan.util.Util;

public interface UpdateProcessor {
	
	public static String DownloadURL = Util.getString(Configure.CONFIGURE.getProperty("DownloadURL"));
	
	public void process(HttpServletRequest request, HttpServletResponse response);

}
