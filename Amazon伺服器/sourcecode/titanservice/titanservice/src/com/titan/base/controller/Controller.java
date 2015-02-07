
package com.titan.base.controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.base.util.Util;
import com.titan.base.controller.bean.MessageBean;

public class Controller extends HttpServlet{
	
	private static Logger logger = Logger.getLogger(Controller.class);
	
	public void init() throws ServletException {
	}
	
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws
    ServletException, IOException {
    	this.process(request, response);
    }
    
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws
    ServletException, IOException {
    	this.process(request, response);
    }
	
	private void process(HttpServletRequest request, HttpServletResponse response) throws ServletException {
		
		logger.debug("call [URI]:"+request.getRequestURI());
		
		String action = Util.getString(request.getParameter("action"));
		
		if(action.equals("")){
			action = getAction(request);
		}
		
		logger.debug("action: "+action);
		
		if(action.equalsIgnoreCase(ActionName.login)){
			toLoginPage(request,response);
			return;
		}else if(action.equalsIgnoreCase(ActionName.logout)){
			toLoginPage(request,response);
			return;
		}else if(action.equalsIgnoreCase(ActionName.admin)){
			toAdminLoginPage(request,response);
			return;
		}
		
    	try{
    		String processorName = Util.getString(request.getParameter("action"));
    		logger.debug("processorName: "+processorName);
    		//get action
    		Class clazz = ActionMap.getClassName(processorName);
    		logger.debug("className: "+clazz.getName());
    		//get class
    		ActionInterf processor;
			processor = (ActionInterf)clazz.newInstance();

    		//process
    		MessageBean message = processor.process(request, response, this.getServletConfig());
    		//forward
    		if(message!=null){
    			this.myforward(request, response, message);
    		}
    	}catch(Exception e){
    		logger.error("handle error.", e);
    		throw new ServletException(e.getMessage());
    	}
	}
	
	/**
	 * parse action FROM URI
	 * @param uri
	 * @return
	 */
	private String getAction(HttpServletRequest request){
		String action = "";
		String uri = Util.getString(request.getRequestURI());
		if(uri.endsWith("login")){
			action = ActionName.login;
		}else if(uri.endsWith("login.jsp")){
			action = ActionName.login;
		}else if(uri.endsWith("logout")){
			action = ActionName.logout;
		}else if(uri.endsWith("admin")){
			action = ActionName.admin;
		}else{
			logger.error("Unsupported URI called, [URI]:"+uri);
		}
		return action;
	}
	
	private void toLoginPage(HttpServletRequest request, HttpServletResponse response){
    	try{
    		String targetURL = "/jsp/login/login.jsf";
    		this.getServletContext().getRequestDispatcher(targetURL).forward(request,response);
    	}catch(Exception ex){
    		logger.error("", ex);
    	}
		
	}
	
	private void toAdminLoginPage(HttpServletRequest request, HttpServletResponse response){
		logger.debug("redirect to admin login");
    	try{
    		String targetURL = "/jsp/admin/login/login.jsf";
    		this.getServletContext().getRequestDispatcher(targetURL).forward(request,response);
    	}catch(Exception ex){
    		logger.error("", ex);
    	}
	}
    
    protected void myforward(HttpServletRequest request, HttpServletResponse response, MessageBean message) throws ServletException, IOException{
    	request.setAttribute("confirm_page_message", message);
    	String url = message.getTargetURL();
    	logger.debug("target URL: "+url);
    	try{
    		this.getServletContext().getRequestDispatcher(url).forward(request,response);
    	}catch(Exception ex){
    		logger.error("", ex);
    	}
    }

}
