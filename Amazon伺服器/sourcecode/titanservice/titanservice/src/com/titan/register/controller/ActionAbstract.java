package com.titan.register.controller;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.base.util.Util;

public abstract class ActionAbstract {
	
	protected static Logger logger = Logger.getLogger(ActionAbstract.class);
	
	protected static Logger logger_register = Logger.getLogger("registerLogger");
	
	protected static Logger logger_refresh = Logger.getLogger("refreshLogger");
	
	public abstract HashMap<String, String> parseRequest(HttpServletRequest request);
	
	public abstract ResponseBase handle(HashMap<String, String> requestMap) throws SQLException;
	
	public void process(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException{
		
		String action = Util.getString(request.getParameter("action"));
		
		HashMap<String, String> requestMap = this.parseRequest(request);
		
		ResponseBase responseBase = this.handle(requestMap);
		
		//add source ip
		requestMap.put("srcIp", request.getRemoteAddr());
		
		//write log
		if(action.equalsIgnoreCase("serviceRefresh")){
			logger_refresh.info("[Request]: action: "+action+", "+this.getRequest(requestMap)+"; [Respose]: "+responseBase.toString());
		}else{
			logger_register.info("[Request]: action: "+action+", "+this.getRequest(requestMap)+"; [Respose]: "+responseBase.toString());
		}
		
		responseBase.sendResponse(response);
	}
	
	protected String getRequest(HashMap<String, String> requestMap){
		StringBuffer buffer = new StringBuffer();
		Set<Entry<String, String>> entries = requestMap.entrySet();
		for(Entry<String, String> entry: entries){
			buffer.append(entry.getKey()+": "+entry.getValue()+", ");
		}
		return buffer.toString();
	}

}
