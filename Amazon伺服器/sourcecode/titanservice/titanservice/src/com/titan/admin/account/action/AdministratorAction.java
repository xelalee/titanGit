package com.titan.admin.account.action;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.admin.account.bean.AdministratorBean;
import com.titan.admin.account.dao.AdministratorDAO;

import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.mytitan.login.exception.IncorrectPasswordException;
import com.titan.mytitan.login.exception.UnknownUserException;

public class AdministratorAction implements ActionInterf{
	
	static Logger logger = Logger.getLogger(AdministratorAction.class);
	
	static Logger logger_admin = Logger.getLogger("adminLogger");
	
	private AdministratorBean loginbean;

	public AdministratorAction() {
		this.loginbean = new AdministratorBean();
	}
	
	public AdministratorBean getLoginbean() {
		return loginbean;
	}

	public void setLoginbean(AdministratorBean loginbean) {
		this.loginbean = loginbean;
	}
	
	public List<AdministratorBean> getAdministrators(){
		
		List<AdministratorBean> admins = new ArrayList<AdministratorBean>();
		try {
			admins = AdministratorDAO.getInstance().getAll();
		} catch (SQLException e) {
			logger.error("load administrators error");
		}
		return admins;
		
	}
	
	public String loadAction(){
		String username = Util.getString(ViewUtil.getRequestParameter("username"));
		try {
			this.loginbean = AdministratorDAO.getInstance().get(username);
		} catch (SQLException e) {
			logger.error("get administrator error");
		}
		
		return "account_edit";
	}

	public String login(){
		String rst = "";
		try {
			String username = this.loginbean.getUsername();
			String password = this.loginbean.getPassword();
			
			AdministratorBean bean = AdministratorDAO.getInstance().get(username);
			
			if(bean==null){
				throw new UnknownUserException(); 
			}
			
			if(!password.equals(bean.getPassword())){
				throw new IncorrectPasswordException();
			}
			
			ViewUtil.setSession(Keys.ADMIN_USER_INFO, bean);
			
			logger_admin.info("account "+bean.getUsername()+" login, ip: "+ViewUtil.getServletRequest().getRemoteAddr());
			
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
		}catch(Exception ex){
			ViewUtil.addErrorMessage(ex.toString());
			rst = NavigationResults.RETRY;			
			logger.error("", ex);
		}
		return rst;		
	}

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		String dispatch = Util.getString(request.getParameter("dispatch"));
		
		AdministratorBean bean = new AdministratorBean();
		bean.setEmail(Util.getString(request.getParameter("email")));
		
		bean.setGroup_id(Util.getString(request.getParameter("group")));
		
		bean.setPassword(Util.getString(request.getParameter("password")));
		bean.setUsername(Util.getString(request.getParameter("username")));
		
		MessageBean message = new MessageBean();
		message.setBackURL("/jsp/admin/account/account_list.jsf");
		message.setMenu("Account Management");
		if(dispatch.equalsIgnoreCase("add")){
			message.setFunction("Account Add");
			message.setSucc(false);
			try {
				int effects = AdministratorDAO.getInstance().add(bean);
				if(effects==1){
					message.setSucc(true);
					message.setMessage("The account is added successfully.");
				}
			} catch (SQLException e) {
				logger.error("Add administrator fail.");
				message.setMessage("Operation fail, "+e.getMessage());
			}
		}else if(dispatch.equalsIgnoreCase("edit")){
			message.setFunction("Account Edit");
			message.setSucc(false);
			try {
				int effects = AdministratorDAO.getInstance().update(bean);
				if(effects==1){
					message.setSucc(true);
					message.setMessage("The account is updated successfully.");
				}
			} catch (SQLException e) {
				logger.error("Update administrator fail.");
				message.setMessage("Operation fail, "+e.getMessage());
			}			
		}else if(dispatch.equalsIgnoreCase("delete")){
			message.setFunction("Account Delete");
			message.setSucc(false);
			try {
				int effects = AdministratorDAO.getInstance().delete(bean);
				if(effects==1){
					message.setSucc(true);
					message.setMessage("The account is deleted successfully.");
				}
			} catch (SQLException e) {
				logger.error("Delete administrator fail.");
				message.setMessage("Operation fail, "+e.getMessage());
			}			
		}
		return message;
	}

}
