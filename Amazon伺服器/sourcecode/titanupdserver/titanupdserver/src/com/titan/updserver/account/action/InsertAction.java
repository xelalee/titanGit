package com.titan.updserver.account.action;

import com.titan.controller.manage.ActionManagement;
import javax.servlet.http.*;
import com.titan.jdbc.*;
import com.titan.updserver.account.dao.AccountDao;
import java.util.*;
import com.titan.util.*;

import org.apache.log4j.Logger;

public class InsertAction extends ActionManagement{

	static Logger logger = Logger.getLogger(InsertAction.class);
	
	public String process(HttpServletRequest request){
		
		logger.debug("enter InsertAction...");
		
		String code = null;
		AccountDao mydup = new AccountDao();
		String name = request.getParameter("USERNAME");
		String pass = request.getParameter("PASSWORD");
		String email = request.getParameter("EMAIL");
		String group = request.getParameter("Group_Info");
		String creator = (String)((HashMap)request.getSession().getAttribute(Keys.USER_INFO)).get("USERNAME");
		
		boolean duplicate = mydup.getDuplicateUser(name);
		
		logger.debug("duplicate: "+duplicate);
		
		if(duplicate)
		{
			code = "2006";
			logger.error("Account Insert:Duplicate User");
			request.setAttribute("RESULT_CODE",code);
			return "";
		}
		
		StringBuffer sql = new StringBuffer();
		sql.append("insert into ACCOUNT (GROUP_ID,USERNAME,PASSWORD,EMAIL,CREATE_DATE,CREATE_BY)");
		sql.append("values(");
		sql.append(group+",");
		sql.append("'"+name+"',");
		sql.append("'"+pass+"',");
		sql.append("'"+email+"',");
		sql.append("now(),");
		sql.append("'"+creator+"'");
		sql.append(")");
		
		logger.debug("sql: "+sql.toString());

		try {
			DAOHelper.executeSQL(sql.toString());
		}catch (Exception ex) {
			code = "2003";
			logger.error("Account Insert error", ex);
		}
		request.setAttribute("RESULT_CODE",code);
		return "";
	}
}