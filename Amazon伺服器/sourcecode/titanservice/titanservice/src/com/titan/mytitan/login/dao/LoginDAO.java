package com.titan.mytitan.login.dao;

import java.sql.SQLException;
import java.util.*;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.bean.MyAccountBean;
import com.titan.mytitan.login.bean.LoginBean;
import com.titan.mytitan.login.exception.IncorrectPasswordException;
import com.titan.mytitan.login.exception.LoginException;
import com.titan.mytitan.login.exception.UnknownUserException;
import com.titan.mytitan.login.exception.UnsubscribeException;
import com.titan.mytitan.login.exception.UserInactivatedException;
import com.titan.base.jdbc.DAOHelper;


public class LoginDAO {
	private static LoginDAO instance = new LoginDAO();
	public static LoginDAO getInstance(){
		return instance;
	}
	
	public LoginBean login(LoginBean bean) 
	    throws LoginException,UnknownUserException,
	    IncorrectPasswordException,UserInactivatedException, SQLException{
		LoginBean loginbean = null;
		StringBuffer sql = new StringBuffer();
		sql.append(" SELECT * FROM ACCOUNT");
		sql.append(" WHERE upper(USERNAME)=upper('");
		sql.append(bean.getAccountbean().getUsername()+"')");
		Collection col = DAOHelper.getInstance().query(sql.toString());

		if(col == null || col.size() == 0){
			throw new UnknownUserException();
		}
		
		HashMap hm = (HashMap)col.iterator().next();
		
		MyAccountBean mabean = new MyAccountBean(hm);
		
		loginbean = new LoginBean();
		loginbean.setAccountbean(mabean);
		
		if(!mabean.getPassword().equals(bean.getAccountbean().getPassword())){
			throw new IncorrectPasswordException();
		}
		
		if(!mabean.getStatus().equalsIgnoreCase(AccountBean.STR_ACTIVE_FLAG)){
			throw new UserInactivatedException();
		}
		
		loginbean.setLoggedIn(true);
		return loginbean;		
	}
	
	public int unsubscribe(AccountBean bean) throws UnsubscribeException{
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE ACCOUNT");
		buffer.append(" SET REMINDER='F'");
		buffer.append(" WHERE upper(USERNAME)=upper('"+bean.getUsername()+"')");
		int effects = 0;
		try{
			effects = DAOHelper.getInstance().executeSQL(buffer.toString());
		}catch(SQLException ex){
			ex.printStackTrace();
			throw new UnsubscribeException();
		}		
		return effects;
	}

}
