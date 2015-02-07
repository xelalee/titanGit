package com.titan.updserver.account.dao;

import com.titan.jdbc.*;
import java.util.*;


public class GroupDisplayDao {

    Collection result = null;
    
    public Collection getAllGroup(){
    	String sql = "select * from FUNCTION";
    	try{
    	result = DAOHelper.query(sql);
    	}catch(Exception e){
    		System.out.println(e.toString());
    	}
    	return result;
    }
    
    public Collection getCurrentGroup(String group_id){
    	String sql = "select * from FUNCTION2GROUP_NAME where GROUP_ID = "+group_id;
    	try{
    		result = DAOHelper.query(sql);
    	}catch(Exception e){
    		System.out.println(e.toString());
    	}
    	return result;
    }
}