package com.titan.updserver.common;

import java.util.*;

import org.apache.log4j.Logger;

import com.titan.jdbc.DAOHelper;
import com.titan.updserver.common.logformat.CommonLogFormatter;
import com.titan.util.Configure;
import com.titan.util.Keys;
import com.titan.util.Util;
import com.titan.util.WebPageJavaBean;

public class ServerBase{
    static Logger logger = Logger.getLogger(ServerBase.class);
	public ServerBase(){
		
	}

	
	/**
	 * if local server is health, return TRUE,FALSE
	 * @return
	 */
	public static boolean LocalServerStatus(){
	    try{
	        Collection col = DAOHelper.query("select now() from dual");
	        if(col.size()>0) return true;
	        else return false;
	    }catch(Exception ex){
	        return false;
	    }
	}

	/**
	 * test status of remote server
	 * @param ip
	 * @return
	 */
	public static boolean TestRemoteServer(String ip){
	    boolean flag = false;
	    String url_prefix = Configure.CONFIGURE.getProperty("SYNC_PROTOCOL", "https")+Keys.COLON_SLASH_SLASH;
	    String url =url_prefix+ip+"/updserver/jsp/status.jsp";
	    WebPageJavaBean jb = null;
	    try{
	        jb = WebPageJavaBean.getWebPage(url);
	        if(jb.line(0).trim().equalsIgnoreCase("TRUE")){
	            flag = true;
	        }
	    }catch(Exception ex){
	    	System.out.println(ex.getMessage()+", url: "+url);
	    }
	    return flag;
	}
}