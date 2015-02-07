package com.titan.register.account.action;

import java.sql.SQLException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import com.titan.base.account.dao.AccountDAO;
import com.titan.base.util.Util;
import com.titan.register.controller.CommonResponse;
import com.titan.register.controller.ActionAbstract;
import com.titan.register.controller.ResponseBase;

public class AccountCheckAction extends ActionAbstract{

	@Override
	public HashMap<String, String> parseRequest(HttpServletRequest request) {
		HashMap<String, String> map = new HashMap<String, String>();
		map.put("username", Util.getString(request.getParameter("username")));
		return map;
	}

	@Override
	public ResponseBase handle(HashMap<String, String> requestMap) throws SQLException{
		String username = Util.getString(requestMap.get("username"));
		CommonResponse resp = new CommonResponse();
		if(AccountDAO.getInstance().getAccountByUsername(username)==null){
			resp.setCode("0");
		}else{
			resp.setCode("1");
		}
		return resp;
		
	}
}
