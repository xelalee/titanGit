package com.titan.updserver.account.dao;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

import org.apache.log4j.Logger;

import com.titan.jdbc.DAOHelper;
import com.titan.util.Util;


public class AccountDao {
	
	static Logger logger=Logger.getLogger(AccountDao.class);
	
	public boolean getDuplicateUser(String name){
		Collection result = null;
		String sql = "select * from ACCOUNT where USERNAME = '"+name+"'";

	    try{
	    	result = DAOHelper.query(sql);
	    	if(!result.isEmpty())
	    	  return true;	
	    }catch(Exception e){
	    	System.out.println(e.toString());
	    }
	
		return false;
	}
	
	public Collection getUserInfo(String name){
		Collection result = null;
		String sql = "select * from ACCOUNT where USERNAME = '"+name+"'";
		try{
				result = DAOHelper.query(sql);
		}catch(Exception e){
			System.out.println(e.toString());
		}
		return result;
	}
	
	public static Collection<HashMap<String, Object>> getUser(String username, String group_id){
		StringBuffer sql = new StringBuffer();
		sql.append(" select a.*,gn.GROUP_NAME"); 
		sql.append(" from ACCOUNT a, GROUP_NAME gn"); 
		sql.append(" where a.GROUP_ID=gn.GROUP_ID"); 
		if(!username.equals("")){
			sql.append(" and a.USERNAME='"+username+"'"); 
		}
		if(!group_id.equals("")){
			sql.append(" and a.GROUP_ID="+group_id); 
		}
		
		return DAOHelper.queryQuietly(sql.toString());
	}

  public static Collection getLoginMenu(String username) {
    StringBuffer sql = new StringBuffer();
    sql.append(" select distinct menu.MENU_ID, menu.MENU_NAME, menu.SORT_ID"); 
    sql.append(" from ACCOUNT acc, FUNCTION2GROUP_NAME f2g, MENU menu"); 
    sql.append(" where acc.GROUP_ID=f2g.GROUP_ID"); 
    sql.append(" and f2g.MENU_ID=menu.MENU_ID"); 
    sql.append(" and acc.USERNAME='"+username+"'"); 
    sql.append(" order by menu.SORT_ID");
    return DAOHelper.queryQuietly(sql.toString(), false);
  }

  public static Collection getLoginFunction(String username, String menu_id) {
  	StringBuffer sql = new StringBuffer();
    sql.append(" select distinct f.FUNCTION_ID, f.FUNCTION_NAME, f.URL,f.SORT_ID, f2g.MENU_ID"); 
    sql.append(" from ACCOUNT acc, FUNCTION2GROUP_NAME f2g, FUNCTION f"); 
    sql.append(" where acc.GROUP_ID=f2g.GROUP_ID"); 
    sql.append(" and f2g.FUNCTION_ID=f.FUNCTION_ID"); 
    sql.append(" and acc.USERNAME='"+username+"'"); 
    if(!menu_id.equals("")){
    	sql.append(" and f2g.MENU_ID="+menu_id); 
    }
    sql.append(" order by f.SORT_ID");
    return DAOHelper.queryQuietly(sql.toString(), false);
  }
  
  public static Collection getFunctionByGroup_ID(String Group_ID){
  	StringBuffer sql = new StringBuffer();
 
    sql.append(" select f.MENU_ID,m.MENU_NAME,m.SORT_ID m_sort_id,"); 
    sql.append(" f.FUNCTION_ID,f.FUNCTION_NAME,f.SORT_ID f_sort_id");
    sql.append(" from MENU m,FUNCTION f"); 
    sql.append(" where f.MENU_ID=m.MENU_ID");
    sql.append(" and f.FUNCTION_ID in");
    sql.append(" ( select distinct FUNCTION_ID from FUNCTION2GROUP_NAME where GROUP_ID="+Group_ID+" )");
    sql.append(" order by f.MENU_ID,f.SORT_ID");    
    
    return DAOHelper.queryQuietly(sql.toString());
  }
  
  public static Collection getAllFunction(){	  	
	  StringBuffer sql = new StringBuffer();		    
	  sql.append(" select f.MENU_ID,m.MENU_NAME,m.SORT_ID m_sort_id,"); 	    
	  sql.append(" f.FUNCTION_ID,f.FUNCTION_NAME,f.SORT_ID f_sort_id");	    
	  sql.append(" from MENU m,FUNCTION f"); 	    
	  sql.append(" where f.MENU_ID=m.MENU_ID");
	  sql.append(" order by f.MENU_ID,f.SORT_ID");      
	  return DAOHelper.queryQuietly(sql.toString());
  } 
  
  public static Collection<String> getFunctionListByGroup_ID(String Group_ID){
	  Collection<String> rst = new ArrayList<String>();	  	
	  StringBuffer sql = new StringBuffer();  
	  sql.append(" select distinct FUNCTION_ID from FUNCTION2GROUP_NAME where GROUP_ID="+Group_ID);    
	  Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(sql.toString());
	  for(HashMap<String, Object> hm: col){
		  String function = Util.getString(hm.get("FUNCTION_ID"));
		  rst.add(function);
	  }
	  return rst;
  }
  
}