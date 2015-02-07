package com.titan.updserver.account.action;

import com.titan.controller.manage.ActionManagement;
import javax.servlet.http.*;
import com.titan.jdbc.*;
import com.titan.updserver.account.resource.*;
import java.util.*;

import org.apache.log4j.Logger;

public class DeleteAction extends ActionManagement{
	
	static Logger logger = Logger.getLogger(DeleteAction.class);
	
	public String process(HttpServletRequest request){
		String code = null;
		String name = request.getParameter("USERNAME");
	
		String sql = "delete from ACCOUNT where USERNAME = '"+name+"'";
		
		try {
		    DAOHelper.executeSQL(sql);
		}
		catch (Exception ex) {
			code = "2002";
			logger.error("Account Delete:"+ex.toString());
		}
		request.setAttribute("RESULT_CODE",code);
		return "";
	}
}