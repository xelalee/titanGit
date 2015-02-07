package com.titan.updserver.account.action;

import com.titan.controller.manage.ActionManagement;
import javax.servlet.http.*;
import com.titan.jdbc.*;
import com.titan.updserver.account.dao.AccountDao;
import com.titan.util.Util;

import java.util.*;

import org.apache.log4j.Logger;

public class AccountAction extends ActionManagement{
	
	static Logger logger = Logger.getLogger(AccountAction.class);
	public String process(HttpServletRequest request){
		String code = null;
		String name = Util.getString(request.getParameter("USERNAME"));
		String group = Util.getString(request.getParameter("Group_Info"));
	
		Collection col = AccountDao.getUser(name, group);
		
		request.setAttribute("USERS", col);
		
		request.setAttribute("RESULT_CODE",code);
		return "";
	}
}