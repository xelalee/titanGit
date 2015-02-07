package com.titan.updserver.account.action;

import com.titan.controller.manage.ActionManagement;
import javax.servlet.http.*;
import com.titan.jdbc.*;
import com.titan.updserver.account.resource.*;
import java.util.*;
import com.titan.util.*;

import org.apache.log4j.Logger;

public class UpdateAction extends ActionManagement{
	
	static Logger logger = Logger.getLogger(UpdateAction.class);
	
	public String process(HttpServletRequest request){
		String code = null;
		String name = request.getParameter("USERNAME");
		String pass = request.getParameter("PASSWORD");
		String email = request.getParameter("EMAIL");
		String group = request.getParameter("Group_Info");
		String creator = (String)((HashMap)request.getSession().getAttribute(Keys.USER_INFO)).get("USERNAME");

		
		StringBuffer sql = new StringBuffer();
		
		sql.append(" update ACCOUNT set");
		sql.append(" PASSWORD='"+pass+"',");
		sql.append(" EMAIL='"+email+"',");
		sql.append(" GROUP_ID="+group);
		sql.append(" where USERNAME='"+name+"'");

		try {
		    DAOHelper.executeSQL(sql.toString());
		}
		catch (Exception ex) {
			code = "2004";
			logger.error("Account Update:"+ex.toString());
		}
		request.setAttribute("RESULT_CODE",code);
		
		return "";
	}
}