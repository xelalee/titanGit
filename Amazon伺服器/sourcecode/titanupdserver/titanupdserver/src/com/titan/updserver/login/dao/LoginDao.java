package com.titan.updserver.login.dao;

import java.util.Collection;

import com.titan.jdbc.DAOHelper;


public class LoginDao {
	
	public static Collection getUserInfo(String username){
		return DAOHelper.queryQuietly("select * from ACCOUNT where USERNAME='"+username+"'");
	}
	
	public static Collection getUserInfo_Ex(String username) throws Exception{
		return DAOHelper.query("select * from ACCOUNT where USERNAME='"+username+"'");
	}
	
}
