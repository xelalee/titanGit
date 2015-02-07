package com.titan.controller.manage;

//import java.util.HashMap;
import javax.servlet.ServletContext;

import org.apache.log4j.Logger;

import com.titan.controller.SysInterface;
import com.titan.controller.exception.SysManageException;
import com.titan.util.Keys;


public class SysManagement
    implements SysInterface {
	
	static Logger logger = Logger.getLogger(SysManagement.class);

  protected ServletContext context;
  
  boolean DEBUG=true;

  public SysManagement() {
  }

  public void init() throws SysManageException {
	  
      try {
    	  logger.debug("SystemManagement init begin" );
          ClassLoader classLoader = this.getClass().getClassLoader();
          //initial action manage
          String actionManageClassName = Keys.ACTION_MANAGE;
          ActionManagement actionManagement = (ActionManagement) classLoader.
                                              loadClass(actionManageClassName).
                                              newInstance();
          actionManagement.setServletContext(context);
          actionManagement.init();
          context.setAttribute(Keys.ACTION_MANAGE, actionManagement);
          //initial flow manage
          String flowManageClassName = Keys.FLOW_MANAGE;
          FlowManagement flowManagement = (FlowManagement) classLoader.
                                          loadClass(flowManageClassName).
                                          newInstance();
          flowManagement.setServletContext(context);
          flowManagement.init();
          context.setAttribute(Keys.FLOW_MANAGE, flowManagement);

          logger.debug("SystemManagement init successfully" );
      } catch (Exception ex) {
          logger.error("", ex);
          throw new SysManageException(
              "Exception while finding the action handler class\n" +
              ex.getMessage());
      }



  }

  public void setServletContext(ServletContext context) {
    this.context = context;
  }

}