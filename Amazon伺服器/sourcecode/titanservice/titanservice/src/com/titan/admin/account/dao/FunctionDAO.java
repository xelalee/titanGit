package com.titan.admin.account.dao;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import com.titan.admin.account.bean.FunctionBean;
import com.titan.admin.account.bean.GroupBean;
import com.titan.base.jdbc.DAOHelper;

public class FunctionDAO {
	
	private static FunctionDAO instance = new FunctionDAO();
	public static FunctionDAO getInstance(){
		return instance;
	}
	
	public List<FunctionBean> getAll(){
		List<FunctionBean> functions = new ArrayList<FunctionBean>();
		
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT f.*,m.MENU_NAME");
		buffer.append(" FROM FUNCTION f, MENU m");
		buffer.append(" WHERE f.MENU_ID=m.MENU_ID");
		buffer.append(" ORDER BY MENU_ID,FUNCTION_ID");
		
		FunctionBean function;
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().queryQuietly(buffer.toString());
		for(HashMap<String, Object> hm :col){
			function = new FunctionBean(hm);
			functions.add(function);
		}

		return functions;
	}

}
