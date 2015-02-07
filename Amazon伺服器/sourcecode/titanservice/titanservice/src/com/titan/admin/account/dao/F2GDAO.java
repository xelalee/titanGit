package com.titan.admin.account.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import com.titan.base.jdbc.DAOHelper;
import com.titan.base.util.Util;

public class F2GDAO {
	
	private static F2GDAO instance = new F2GDAO();
	public static F2GDAO getInstance(){
		return instance;
	}
	
	public List<String> getInsertSQLs(String group_id, List<String> functions){
		List<String> sqls = new ArrayList<String>();
		for(String function: functions){
			sqls.add(this.getInsertSQL(group_id, function));
		}
		return sqls;
		
	}
	
	public String getInsertSQL(String group_id, String function){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" insert into FUNCTION2GROUP_NAME(FUNCTION_ID,GROUP_ID)");
		buffer.append(" values("+function+","+group_id+")");
		return buffer.toString();
	}
	
	public String getDeleteByGroup_idSQL(String group_id){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" delete from FUNCTION2GROUP_NAME"); 
		buffer.append(" where GROUP_ID="+group_id);
		return buffer.toString();
	}
	
	public List<String> getFunctionsByGroup_id(String group_id) throws SQLException{
		List<String> functions = new ArrayList<String>();
		StringBuffer buffer = new StringBuffer();
		buffer.append(" select * from FUNCTION2GROUP_NAME"); 
		buffer.append(" where GROUP_ID="+group_id);	
		
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(buffer.toString());
		
		for(HashMap<String, Object> hm: col) {
			String function = Util.getString(hm.get("FUNCTION_ID"));
			functions.add(function);
		}

		return functions;		
	}

}
