
package com.titan.updserver.login.action;

import com.titan.controller.manage.ActionManagement;
import javax.servlet.http.HttpServletRequest;
import com.titan.controller.exception.ActionException;
import com.titan.util.Keys;

public class LogoutAction extends ActionManagement {

	public String process(HttpServletRequest request) throws ActionException {
	  
	  request.getSession().removeAttribute(Keys.USER_INFO);
	  request.getSession().invalidate();
	  
	  return "";
	}
}
