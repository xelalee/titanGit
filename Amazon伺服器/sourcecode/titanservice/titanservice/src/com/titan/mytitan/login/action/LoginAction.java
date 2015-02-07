package com.titan.mytitan.login.action;

import java.sql.SQLException;

import org.apache.log4j.Logger;

import com.titan.base.account.dao.AccountDAO;
import com.titan.base.account.exception.AccountUpdateException;

import com.titan.base.util.Key;
import com.titan.base.util.Keys;
import com.titan.mytitan.app.util.CookieUtil;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.mytitan.login.bean.LoginBean;
import com.titan.mytitan.login.bean.SessionBean;
import com.titan.mytitan.login.bean.SessionListener;
import com.titan.mytitan.login.dao.LoginDAO;
import com.titan.mytitan.login.exception.IncorrectPasswordException;
import com.titan.mytitan.login.exception.LoginException;
import com.titan.mytitan.login.exception.UnknownUserException;
import com.titan.mytitan.login.exception.UserInactivatedException;


public class LoginAction{
	static Logger logger = Logger.getLogger(LoginAction.class);

	private LoginBean loginbean;
	
	public LoginAction(){
		this.loginbean = new LoginBean();
	}
	
	/**
	 * Backing bean action to login a user.
	 * @return
	 */
	
	public LoginBean getLoginbean() {
		return loginbean;
	}


	public void setLoginbean(LoginBean loginbean) {
		this.loginbean = loginbean;
	}
	
	public String loginAction(){
		//for some certain browser, multiple login FROM same client, may cause issue
		//following code is to detect this issue
		String SessionID = ViewUtil.getSessionID();
		if(SessionBean.doesAppSessionIDExist(SessionID)){
			return NavigationResults.CONFIRM;
		}
		return this.login();
	}
	
	public String specialLoginAction(){
		return this.login();
	}
	
	public String login(){
		String rst = "";
		try {
			this.loginbean.getAccountbean().setUsername(this.loginbean.username);
			LoginBean bean = LoginDAO.getInstance().login(this.loginbean);
            String last_viewed_ip = bean.getAccountbean().getLast_viewed_ip();
			this.loginbean.setAccountbean(bean.getAccountbean());
			
			//save in session scope
			ViewUtil.setSession(Keys.USER_INFO,bean);
			//session listener
			ViewUtil.setSession(Keys.SESSION_LISTENER,new SessionListener(this.loginbean.getUsername(),ViewUtil.getSessionID()));
			
            //save in application scope
			SessionBean.setAppSessionID(this.loginbean.getAccountbean().getUsername(),ViewUtil.getSessionID());
			
			//set last viewed info
			this.loginbean.getAccountbean().setLast_viewed_ip(ViewUtil.getServletRequest().getRemoteAddr());
			AccountDAO.getInstance().updateLastViewedInfo(this.loginbean.getAccountbean());
			this.loginbean.getAccountbean().setLast_viewed_ip(last_viewed_ip);
			//handle cookie
			CookieUtil cu = new CookieUtil();
			if(this.loginbean.cookied){
				cu.setCookie(LoginBean.COOKIE_USERNAME,this.loginbean.getAccountbean().getUsername());
			}else{
				cu.removeCookie(LoginBean.COOKIE_USERNAME);
			}
			
			rst = NavigationResults.SUCCESS;
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.getMessage());
			rst = NavigationResults.RETRY;			
		}catch(IncorrectPasswordException ex) {
			ViewUtil.addErrorMessage(ex);
			rst = NavigationResults.RETRY;
		}catch(UnknownUserException ex){
			ViewUtil.addErrorMessage(ex);
			rst = NavigationResults.RETRY;
		}catch(UserInactivatedException ex){
			ViewUtil.addErrorMessage(ex);
			rst = NavigationResults.RETRY;
		}catch(LoginException ex) {
			ViewUtil.addErrorMessage(ex);
			rst = NavigationResults.RETRY;
		}catch(AccountUpdateException ex){
			rst = NavigationResults.SUCCESS;
		}catch(Exception ex){
			ex.printStackTrace();
			ViewUtil.addErrorMessage(ex.toString());
			rst = NavigationResults.RETRY;			
		}
		return rst;		
	}
	
	public String loadWelcomeAction(){
		LoginBean loginbean =(LoginBean) ViewUtil.getSession(Keys.USER_INFO);
		this.loginbean.getAccountbean().setFirst_name(loginbean.getAccountbean().getFirst_name());
		this.loginbean.getAccountbean().setLast_name(loginbean.getAccountbean().getLast_name());
		return NavigationResults.HOME;
	}
	
	public String logoutAction(){
		Key.ONLINE_USER_MAP.remove(this.loginbean.getAccountbean().getUsername());
		ViewUtil.getServletRequest().getSession().removeAttribute(Keys.USER_INFO);
		ViewUtil.getServletRequest().getSession().removeAttribute(Keys.SESSION_LISTENER);
		//ViewUtil.getServletRequest().getSession().invalidate();
		return NavigationResults.LOGOUT;
	}


}
