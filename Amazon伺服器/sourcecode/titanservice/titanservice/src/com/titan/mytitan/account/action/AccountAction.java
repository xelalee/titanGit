package com.titan.mytitan.account.action;

import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.account.exception.AccountDuplicateException;
import com.titan.base.account.exception.AccountInsertException;
import com.titan.base.account.exception.AccountUpdateException;
import com.titan.base.account.exception.PasswordConfirmNotMatchException;
import com.titan.base.app.log.CommonLog;
import com.titan.base.app.mail.EmailTool;
import com.titan.base.system.dao.Sequence_idDao;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.base.account.bean.MyAccountBean;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.mytitan.login.bean.LoginBean;
import com.titan.mytitan.login.exception.IncorrectPasswordException;
import com.titan.base.jdbc.DAOHelper;

public class AccountAction{
	static Logger logger = Logger.getLogger(AccountAction.class);
	
	private MyAccountBean accountbean;
	
	public AccountAction(){
		accountbean = new MyAccountBean();
	}
	
	public MyAccountBean getAccountbean() {
		return accountbean;
	}

	public void setAccountbean(MyAccountBean accountbean) {
		this.accountbean = accountbean;
	}

	
	public String loadAction(){
		LoginBean loginbean =(LoginBean) ViewUtil.getSession(Keys.USER_INFO);
		if(loginbean!=null){
			try{ 
				this.accountbean = AccountDAO.getInstance().getMyAccountByAccountId(loginbean.getAccountbean().getAccount_id());
			}catch(SQLException ex){
				  ViewUtil.addErrorMessage(ex.getMessage());
				  return NavigationResults.FAILURE;				
			}
		}
		
		return "myaccount_update";
	}
	  
	public String updateAction(){
		String rst = NavigationResults.SUCCESS;
		try{
			List<String> sqls = new ArrayList<String>();
			LoginBean loginbean =(LoginBean) ViewUtil.getSession(Keys.USER_INFO);
			this.accountbean.setUpdate_by(loginbean.getAccountbean().getUsername());
			sqls.add(AccountDAO.getInstance().getUpdateSQL(this.accountbean));

			try{
				DAOHelper.getInstance().executeSQL(sqls);
                //update personal information in session
				loginbean.setAccountbean(this.accountbean);
				ViewUtil.setSession(Keys.USER_INFO,loginbean);
			}catch(SQLException ex){
				AccountUpdateException e = new AccountUpdateException();
				ViewUtil.addErrorMessage(e);
				rst = NavigationResults.FAILURE;
			}
		}catch(Exception ex){
			AccountUpdateException e = new AccountUpdateException();
			ViewUtil.addErrorMessage(e);
			rst = NavigationResults.FAILURE;
		}	
        //log
		CommonLog clog = new CommonLog();
		if(rst.equalsIgnoreCase(NavigationResults.FAILURE)){
			clog.setTitle("Update Account fail. [Account Id]:"
					+this.accountbean.getAccount_id());
			logger.error(clog.toString());
		}else{
			clog.setTitle("Update Account success. [Account Id]:"
					+this.accountbean.getAccount_id());
			logger.info(clog.toString());
		}
		return rst;
	}
	
	public String registerAction(){
		String rst = "";
		//does password and confirm match
		if(!this.accountbean.getPassword1().equals(this.accountbean.getPassword())){
			PasswordConfirmNotMatchException ex = new PasswordConfirmNotMatchException();
		    ViewUtil.addErrorMessage(ex);
		    return NavigationResults.FAILURE;
		}
		
		//does user exist
		AccountBean myacc = null;
		try{
			myacc = AccountDAO.getInstance().getAccountByUsername(this.accountbean.getUsername());
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.getMessage());
			return NavigationResults.FAILURE;			
		}
		if(myacc!=null){
			AccountDuplicateException ex = new AccountDuplicateException();
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;			
		}
		
		//save in local db
		try{
			String account_id = String.valueOf(Sequence_idDao.getInstance().getSEQ(AccountBean.STR_ACCOUNT_ID));
			this.accountbean.setAccount_id(account_id);
			this.accountbean.setSubscription_code(Util.getRandomStr(16));
			this.accountbean.setStatus(AccountBean.STR_INITIAL_FLAG);
			this.accountbean.setCreate_by(this.accountbean.getUsername());
			if(!this.accountbean.getReminder()){
				this.accountbean.setLogin_status("F");
			}
			List<String> sqls = new ArrayList<String>();
			sqls.add(AccountDAO.getInstance().getInsertSQL(this.accountbean));
			try{
				DAOHelper.getInstance().executeSQL(sqls);
				rst = NavigationResults.SUCCESS;
			}catch(SQLException ex){
				AccountInsertException e = new AccountInsertException();
				ViewUtil.addErrorMessage(e);
				return NavigationResults.FAILURE;
			}
		}catch(Exception ex){
			AccountInsertException e = new AccountInsertException();
			ViewUtil.addErrorMessage(e);
			return NavigationResults.FAILURE;
		}
		//send mail
		if(rst.equals(NavigationResults.SUCCESS)){
			EmailTool.sendCreateAccountMail(this.accountbean);		
		}
		return rst;
	}
	
	public String cancelRegisterAction(){
		this.accountbean = new MyAccountBean();	
		return NavigationResults.LOGIN;
	}
	
	public String changePasswordAction(){
		String rst = NavigationResults.SUCCESS;
		//validate old password
		AccountBean bean = null;
		LoginBean loginbean =(LoginBean) ViewUtil.getSession(Keys.USER_INFO);
		try{
			this.accountbean.setAccount_id(loginbean.getAccountbean().getAccount_id());
			bean = AccountDAO.getInstance().getAccountByAccountId(this.accountbean.getAccount_id());
		}catch(SQLException ex){
			  ViewUtil.addErrorMessage(ex.getMessage());
			  return NavigationResults.FAILURE;
		}
		if(!bean.getPassword().equals(this.accountbean.getPassword())){
			IncorrectPasswordException ex = new IncorrectPasswordException();
		    ViewUtil.addErrorMessage(ex);
		    return NavigationResults.FAILURE;			
		}
		
		//does password AND confirm match
		if(!this.accountbean.getPassword1().equals(this.accountbean.getPassword2())){
			PasswordConfirmNotMatchException ex = new PasswordConfirmNotMatchException();
		    ViewUtil.addErrorMessage(ex);
		    return NavigationResults.FAILURE;
		}
		
		List<String> sqls = new ArrayList<String>();
		this.accountbean.setUpdate_by(loginbean.getAccountbean().getUsername());
		sqls.add(AccountDAO.getInstance().getChangePasswordSQL(this.accountbean));
		try{
			DAOHelper.getInstance().executeSQL(sqls);
		}catch(SQLException ex){
			rst = NavigationResults.FAILURE;
		}
		if(rst.equals(NavigationResults.FAILURE)){
			AccountUpdateException ex = new AccountUpdateException();
			ViewUtil.addErrorMessage(ex);
		}
        //log
		CommonLog clog = new CommonLog();
		if(rst.equalsIgnoreCase(NavigationResults.FAILURE)){
			clog.setTitle("Update Account Password fail. [Account Id]:"
					+this.accountbean.getAccount_id());
			logger.error(clog.toString());
		}else{
			clog.setTitle("Update Account Password success. [Account Id]:"
					+this.accountbean.getAccount_id());
			logger.info(clog.toString());
		}
		return rst;	
	}
	
}
