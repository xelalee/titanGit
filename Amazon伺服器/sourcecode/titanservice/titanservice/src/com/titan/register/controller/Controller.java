package com.titan.register.controller;

import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.quartz.SchedulerException;

import com.titan.base.app.error.bean.ErrorBean;
import com.titan.base.app.response.ResponseUtil;
import com.titan.base.configure.Configure;

import com.titan.base.schedulejob.ScheduleJobManager;
import com.titan.base.util.Util;

public class Controller extends HttpServlet  {
    static Logger logger = Logger.getLogger(Controller.class);
    
    public void init() throws ServletException {
    	ServletContext context = getServletContext();
    	Configure.initial(context);
    	
    	try {
			ScheduleJobManager.start();
		} catch (SchedulerException e) {
			logger.error("", e);
		}
    }
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) 
	       throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		try{
			process(request, response);
		}catch(Exception ex){
			logger.fatal("Unexcepted exception of mytitan.com",ex);
            ResponseUtil.responseContent(response, ResponseUtil.FATAL_ERROR);
		}
	}


	public void doPost(HttpServletRequest request, HttpServletResponse response) 
	       throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");
		try{
			process(request, response);
		}catch(Exception ex){
            logger.fatal("Unexcepted exception of mytitan.com",ex);
            ResponseUtil.responseContent(response, ResponseUtil.FATAL_ERROR);
		}
	}	
	
	private void process(HttpServletRequest request, HttpServletResponse response) {
        String action = Util.getString(request.getParameter("action"));

        Class clazz = ActionMap.instance().getAction(action);
		if(clazz == null){
            this.handleError("ERR_NOT_SUPPORTED_ACTION", response);
		}else{
            ActionAbstract act = null;
			try{
	            act = (ActionAbstract) clazz.newInstance();	    
			}catch(Exception e){
				logger.error("Fail to load action class.",e);
				this.handleError("ERR_INTERNAL_ERROR", response);
			}
			
			try {
				act.process(request, response);
			} catch (SQLException e) {
				logger.error("Database error", e);
				this.handleError("ERR_DATABASE_OPERATION_ERROR", response);
			} catch (IOException e) {
				logger.error("process fail", e);
			}
		}
    }
	
	private void handleError(String errorKey, HttpServletResponse response){
		ErrorBean error = ErrorBean.getInstanceByName(errorKey);
		CommonResponse cr = new CommonResponse();
        cr.setCode(error.getCode());
        cr.setMessage(error.getMessage());
        try {
			cr.sendResponse(response);
		} catch (IOException e) {
			logger.error("send response fail", e);
		}
	}
    
}
