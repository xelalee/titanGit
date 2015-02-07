package com.titan.controller.manage;

import com.titan.controller.ActionInterface;
import javax.servlet.ServletContext;
import com.titan.controller.exception.ActionException;
import com.titan.controller.dao.ActionDao;
import java.util.HashMap;
import java.util.Collection;
import java.util.Iterator;
import com.titan.util.Keys;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;


public class ActionManagement
    implements ActionInterface {
	
	static Logger logger = Logger.getLogger(ActionManagement.class);

  protected ServletContext context;
  ActionDao actionJB = new ActionDao();

  public ActionManagement() {
  }

  public void init() throws ActionException {
    try {
      Collection actionCollection = actionJB.getAllAction();

      HashMap actions = new HashMap();
      for (Iterator it = actionCollection.iterator(); it.hasNext(); ) {
        HashMap action = (HashMap) it.next();
        String actionName  = (String)action.get("ACTION_NAME");
        String actionClass = (String)action.get("ACTION_VALUE");
        actions.put(actionName,actionClass);
      }
      context.setAttribute(Keys.ACTIONS, actions);
    }
    catch (Exception ex) {
        logger.error("", ex);
      throw new ActionException("QueryHelperException while get action\n" +
                                ex.getMessage());
    }

  }

  public String getActionClass(HttpServletRequest request){
    String actionClass = "";
    String actionName = request.getParameter("ACTION_NAME");

    HashMap actionMap = (HashMap)this.context.getAttribute(Keys.ACTIONS);
    actionClass = (String)actionMap.get(actionName);
    return actionClass ;
  }

  public String process(HttpServletRequest request) throws ActionException{

    return "";
  }
  public void setServletContext(ServletContext context) {
    this.context = context;
  }

}