package com.titan.controller.manage;

import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletContext;

import org.apache.log4j.Logger;

import com.titan.controller.*;
import com.titan.util.Keys;
import com.titan.util.Util;

import java.util.Iterator;
import java.util.Collection;
import com.titan.controller.dao.ActionDao;
import com.titan.controller.exception.FlowManageException;


public class FlowManagement
    implements FlowInterface {
	
	static Logger logger = Logger.getLogger(FlowManagement.class);

  protected ServletContext context;
  ActionDao actionJB = new ActionDao();
//  boolean DEBUG = true;
  public FlowManagement() {
  }

  public void init() throws FlowManageException {
    try {
      Collection actionCollection = actionJB.getAllAction();
      HashMap actions = new HashMap();
      for (Iterator it = actionCollection.iterator(); it.hasNext(); ) {
        HashMap actionResult = null;
        HashMap action = (HashMap) it.next();
        String actionName = (String) action.get("ACTION_NAME");
        logger.debug("actionName.." + actionName);
        actionResult = new HashMap();
        Collection resultCollection = actionJB.getResultByActionName(actionName);
        for (Iterator resultIt = resultCollection.iterator(); resultIt.hasNext(); ) {
          HashMap result = (HashMap) resultIt.next();
          actionResult.put(result.get("RESULT_NAME"),result.get("RESULT_VALUE"));
        } //end of result
        actions.put(actionName, actionResult);
      }
      context.setAttribute(Keys.ACTION_MAPPING, actions);

      logger.debug("FlowManagement init successfully, action:" + actions);
      
    }
    catch (Exception ex) {
        logger.error("", ex);
      throw new FlowManageException("QueryHelperException while get action:\n" +
                                    ex.toString());
    }

  }

  /**
   * Get the next page by action result and action name
   * @param request HttpServletRequest
   * @return
   */
  public String getNextView(HttpServletRequest request) {
    String actionName = Util.getString(request.getParameter("hidFunction"));
    String resultName = Util.getString(request.getParameter("hidAction"));
    
    if(actionName.equals("") || resultName.equals("") ) {
    	return Keys.DEFAULT_PAGE;
    }

    HashMap actionMap = (HashMap)this.context.getAttribute(Keys.ACTION_MAPPING);
    
    logger.debug("Ya....." + actionName+", XX..." + resultName+", Really Data.." + actionMap);
    
    HashMap actionResult = (HashMap) actionMap.get(actionName);
    if(actionResult == null){
    	return Keys.DEFAULT_PAGE;
    }
    //get the action result key
    String resultPage = (String) actionResult.get(resultName);
    
    logger.debug("ResultPage..." + resultPage);

    if (resultPage == null || resultPage.trim().equals("")) {
      return Keys.DEFAULT_PAGE;
    }
    return resultPage;
  }

  public void setServletContext(ServletContext context) {
    this.context = context;
  }

}