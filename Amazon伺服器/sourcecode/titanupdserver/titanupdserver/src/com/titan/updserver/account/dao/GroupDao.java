package com.titan.updserver.account.dao;

import java.util.*;
import java.math.*;
import com.titan.jdbc.*;
import com.titan.updserver.account.resource.*;

public class GroupDao {
	
	public Collection getGroup(){
		String sql = "select * from GROUP_NAME";
		Collection result = null;
		try{
			result = DAOHelper.query(sql);
		}catch(Exception e){
			System.out.println(e.toString());
		}
		return result;
	}
	
	public static String getGroupName(String group_id){
		String sql = "select GROUP_NAME from GROUP_NAME where GROUP_ID = "+new BigDecimal(group_id);

		String name = null;
		Collection result = null;

		try{
			result = DAOHelper.query(sql);
			HashMap map = new HashMap();
			map = (HashMap)result.iterator().next();
			name = (String)map.get("GROUP_NAME");
			//System.out.println("name is "+name);
		}catch(Exception e){
			System.out.println(e.toString());
		}
		return name;
	}
}