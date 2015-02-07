package com.titan.common;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.common.bean.MessageBean;
import com.titan.util.Util;


public class Controller extends HttpServlet {
	
	static Logger logger = Logger.getLogger(Controller.class);
	
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws
    ServletException, IOException {
    	
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
    
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws
    ServletException, IOException {
    	this.doGet(request, response);
    }
    
    protected void myforward(HttpServletRequest request, HttpServletResponse response, MessageBean message) throws ServletException, IOException{
    	request.setAttribute("confirm_page_message", message);
    	String url = message.getTargetURL();
    	try{
    		this.getServletContext().getRequestDispatcher(url).forward(request,response);
    	}catch(Exception ex){
    		logger.error("", ex);
    	}
    	
    }


}
