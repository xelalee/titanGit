package com.titan.controller;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;


import com.titan.controller.exception.FlowManageException;
import com.titan.controller.manage.FlowManagement;
import com.titan.util.Keys;
import com.titan.controller.manage.AuthManagement;
import com.titan.controller.manage.RequestManagement;
import com.titan.controller.manage.SysManagement;
import com.titan.util.Util;
import com.titan.util.Configure;
import com.titan.schedulejob.ScheduleJobManager;

import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.apache.log4j.BasicConfigurator;

public class ControllerServlet extends HttpServlet {
    private ServletContext context;
    
	static Logger logger = Logger.getLogger(ControllerServlet.class);
    /**
     * @throws ServletException
     */
    public void init() throws ServletException {
    	context = getServletContext();
    	
    	try{
			initLog4j();
    	}catch(Exception e){
    		logger.error("System initial error, init Log4j error!",e);
    	}
    	
    	this.initConfig(context);
    	
    	try{
			initServlet();
    	}catch(Exception e){
    		logger.error("System initial error, init servlet error!",e);
    	}
    	
    	ScheduleJobManager.start();
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws
        ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        try{
            processRequest(request, response);
        }catch(Exception ex){
            logger.error("", ex);
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws
        ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        try{
            processRequest(request, response);
        }catch(Exception ex){
        	logger.error("", ex);
        }
    }

    /**
     * process the user's request
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @throws ServletException
     */
    protected void processRequest(HttpServletRequest orgrequest,
                                  HttpServletResponse response) throws
        ServletException {
    	
        try {
            HttpServletRequest request = getRequest(orgrequest);

            String nextView = "";
            nextView = getAuth(request);

            if (nextView == null || nextView.trim().equals("")) {
            	logger.debug(">> Call Action..");
                getRequestManage().doProcess(request); //call requestManagement --> get ActionManagement obj
                logger.debug(">> Call Action.. Success");
                nextView = getFlowManage().getNextView(request); // call FlowManagement-->get forward next page
                logger.debug(">> Call Flow.. Success:"+nextView);

                String code = (String) request.getAttribute("RESULT_CODE");
                logger.debug(">> controllerservlet code: " + code);
                if (code == null || code.trim().equals("")) {
                	logger.debug(">> no message code..forward to " + nextView);
                    //-- add by Karen for myTitan, set remeber username cookie
                    this.setUsernameCookie(orgrequest, response);
                    context.getRequestDispatcher(nextView).forward(orgrequest, response);            
					                    
					//orgrequest.getRequestDispatcher(nextView).forward(orgrequest, response);
                } else if ("pass".equalsIgnoreCase(code)) {
                    context.getRequestDispatcher(nextView).forward(request, response);
                } 
            } else {
            	logger.debug(">> nextView:" + nextView);
                
                if (nextView.equals("sessionTimeout")
                           || nextView.equals("invalidAccess")) {
                    context.getRequestDispatcher("/jsp/commom/session_timeout.jsp").forward(request, response);
                } else if (nextView.equals("welcome")) {
                     context.getRequestDispatcher("/jsp/index.jsp").forward(request, response);
                }
				
                //-- end of add
            }
        } catch (Exception ex) {
        	logger.error("", ex);
            throw new ServletException("Exception while dispathing\n" + ex.getMessage());
        }
    }

    /**
     * Authentication the user is legal
     * @param request HttpServletRequest
     */
    private String getAuth(HttpServletRequest request) throws ServletException {
        AuthManagement authManagement = (AuthManagement) context.getAttribute(Keys.AUTH_MANAGE);
        if (authManagement == null) {
            String authClassName = Keys.AUTH_MANAGE;
            authManagement = (AuthManagement) loadClass(authClassName);
            authManagement.setServletContext(context);
            context.setAttribute(Keys.AUTH_MANAGE, authManagement);
        }
        try {
            return authManagement.getAuth(request);
        } catch (Exception ex) {
        	logger.error("", ex);
            throw new ServletException("AuthException while login\n" +
                                       ex.getMessage());
        }
    }

    /** 
     * @param orgrequest
     * @param response
     */
    private void  setUsernameCookie(HttpServletRequest orgrequest,
                                   HttpServletResponse response) {
        String uri = orgrequest.getRequestURI();
        logger.debug("Remember:"+Util.getString(orgrequest.getParameter("REMEMBER")));
        String USERNAME=Util.getString(orgrequest.getParameter("USERNAME"));
        if (uri.endsWith("login") && !USERNAME.equals("")) {
        	if(orgrequest.getParameter("REMEMBER")!=null){
        		logger.debug("set cookie-----------------");
				Cookie usernameCookie = new Cookie("USERNAME",USERNAME);
				usernameCookie.setMaxAge(60 * 60 * 24 * 14); //seconds
				response.addCookie(usernameCookie);
        		
        	}else{
        		logger.debug("clear cookie-----------------");
				Cookie usernameCookie = new Cookie("USERNAME",USERNAME);
				usernameCookie.setMaxAge(0); //seconds
				response.addCookie(usernameCookie);        		
        	}
		}		
    }

    /**
     * desc : get RequestManagement object
     * @return
     * @throws ServletException
     */
    private RequestManagement getRequestManage() throws ServletException {
        RequestManagement requestManagement = (RequestManagement) context.
            getAttribute(Keys.REQUEST_MANAGE);
        if (requestManagement == null) {
            String requestManageClassName = Keys.REQUEST_MANAGE;
            requestManagement = (RequestManagement) loadClass(
                requestManageClassName);
            requestManagement.setServletContext(this.context);
            context.setAttribute(Keys.REQUEST_MANAGE, requestManagement);
        }
        return requestManagement;
    }

    /**
     * desc : get FlowManagement object
     * @return
     * @throws FlowManageException
     */
    private FlowManagement getFlowManage() throws FlowManageException {
        FlowManagement flowManagement = (FlowManagement) context.
            getAttribute(Keys.FLOW_MANAGE);
        if (flowManagement == null) {
            String flowManageClassName = Keys.FLOW_MANAGE;
            try {
                flowManagement = (FlowManagement) loadClass(flowManageClassName);
            } catch (Exception e) {
            	logger.error("", e);
                throw new FlowManageException("getFlowManage()-->" + e.toString());
            }
            flowManagement.setServletContext(context);
            context.setAttribute(Keys.FLOW_MANAGE, flowManagement);
        }
        return flowManagement;
    }

    private Object loadClass(String className) throws ServletException {
        try {
            return this.getClass().getClassLoader().loadClass(className).
                newInstance();
        } catch (Exception ex) {
        	logger.error("", ex);
            throw new ServletException(
                "Exception while loading the class:" + className +
                "\n" + ex.getMessage());
        }
    }
    
    private void initConfig(ServletContext context){
    	Configure.initialConfig(context);
    }

    /**
     * desc : Process ActionManagement , FlowManagement
     * @throws ServletException
     */
    private void initServlet() throws ServletException {
        try {
            String sysClassName = "";
            sysClassName = Keys.SYSTEM_MANAGE;
            SysManagement sysManagement = (SysManagement) getClass().
                         getClassLoader().loadClass(sysClassName).newInstance();
            sysManagement.setServletContext(context);
            sysManagement.init() ;
        } catch (Exception ex) {
        	logger.error("", ex);
            throw new ServletException(
                "exception while initial servlet\n" +
                ex.getMessage());
        }

    }

    public HttpServletRequest getRequest(HttpServletRequest request) throws
        ServletException {
        return request;
    }
    
	private void initLog4j() {

		  ServletConfig config = this.getServletConfig();
		  String propString = config.getInitParameter("log4j_properties");

		  try {
			Properties prop = new Properties();
			prop.load(context.getResourceAsStream(propString));
			PropertyConfigurator.configure(prop);
		  } catch(Exception ex) {
			logger.error("Can not load properties , using BasicConfigurator ....",ex);
			BasicConfigurator.configure();
		  }
		  logger.info("Log4j initialize successfully !!!");
	}

}
