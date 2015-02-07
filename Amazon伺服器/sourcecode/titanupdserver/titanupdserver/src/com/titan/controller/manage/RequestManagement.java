package com.titan.controller.manage;

import com.titan.controller.RequestInterface;
import javax.servlet.http.HttpServletRequest;
import com.titan.controller.exception.RequestManageException;
import javax.servlet.ServletContext;

import org.apache.log4j.Logger;

import com.titan.controller.manage.ActionManagement;
import java.util.HashMap;
import com.titan.util.Keys;


public class RequestManagement
    implements RequestInterface {
	
	static Logger logger = Logger.getLogger(RequestManagement.class);

  protected ServletContext context;
  public RequestManagement() {
  }

  public String doProcess(HttpServletRequest request) throws
      RequestManageException {
    String actionName = request.getParameter("hidFunction");

    //get the action calss
    ActionManagement action = getActionHandler(actionName);
    if (action == null ) {
      return null;
    }
    action.setServletContext(context);
    try {
      action.process(request);
      return "" ;
    }catch (Exception ex) {
    	logger.error("", ex);
    	throw new RequestManageException(
          "ActionException while perfoming the action \n" + ex.getMessage());
    }

  }

  /**
   * Get the action class by the action name
   * @param actionName
   * @return
   * @throws FrameworkException
   */
  private ActionManagement getActionHandler(String actionName) throws
      RequestManageException {
    ActionManagement action = null;
    //get the hashmap of the actions
    HashMap actionMap = (HashMap) context.getAttribute(Keys.ACTIONS);
    String className = "";
    //showActionMapping(actionMaps);
    if (actionMap == null) {
      logger.error("the action mapping is null");
      return null;
    }
	className = (String) actionMap.get(actionName);
    if (className == null || className.equals("")) {
		return null;
    }

    try {
    	  logger.debug("ClassName..."+className);
    	  
    	  action = (ActionManagement) getClass().getClassLoader().loadClass(
          className).newInstance();

    	  logger.debug("Success...Call action");

    }catch (Exception ex) {
        logger.error("", ex);
      throw new RequestManageException(
          "Exception while finding the action handler class\n" +
          ex.getMessage());
    }
    if (action == null) {
    	logger.error("Not found the class:" + className);
    }
    return action;
  }

  public void setServletContext(ServletContext context) {
    this.context = context;
  }

}