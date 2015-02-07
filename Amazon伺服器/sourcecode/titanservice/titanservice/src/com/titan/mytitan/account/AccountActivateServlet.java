package com.titan.mytitan.account;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

import org.apache.log4j.Logger;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.account.exception.AccountActivateException;
import com.titan.base.app.log.CommonLog;
import com.titan.base.util.Util;
import com.titan.base.configure.Configure;


public class AccountActivateServlet extends HttpServlet {
	private final static String myaccount_activate_confirm = "/jsp/myaccount/myaccount_activate_confirm.jsf";
	// private ServletContext context;

	static Logger logger = Logger.getLogger(AccountActivateServlet.class);

	private String account_id = "";

	private String subscription_code = "";

	public void init() throws ServletException {
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		process(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		process(request, response);
	}

	private void process(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		boolean flag = false;
		// process
		account_id = Util.getString(request.getParameter("ACCOUNT"));
		subscription_code = Util.getString(request.getParameter("SUB"));
		AccountBean accountbean = new AccountBean(account_id);
		BigDecimal accountid = new BigDecimal(account_id);
		boolean account_Subscription = false;
		boolean account_status = false;
		String fail_note="";
		try{
			account_Subscription = AccountDAO.getInstance().checkAccountSubscription(accountid, subscription_code);
		    account_status = AccountDAO.getInstance().checkAccountStatus(accountid, subscription_code);
		    if(account_Subscription) {
		       if(account_status) {
		    	   AccountDAO.getInstance().activate(accountbean);
		    	   flag=true;
		       }else{
		    	   fail_note = "Acivated";
		       }
		    }else{
		    	fail_note = "NoExist";
		    }    
		}catch(AccountActivateException ex){
			logger.error("AccountActivateException");
		}catch(SQLException e){
			logger.error("DAOHelperException");
		}

		CommonLog clog = new CommonLog();
		String url = "";
		if (flag) {
			clog.setTitle("Account activate successfully. [Account ID]:"+account_id);
			logger.info(clog.toString());
			url = myaccount_activate_confirm + "?status=success";
			//this.getServletContext().getRequestDispatcher(myaccount_activate_confirm + "?status=success").forward(request,response);
		} else {		
			clog.setTitle("Account activate fail. [Account ID]:"+account_id);
			logger.error(clog.toString());	
			url = myaccount_activate_confirm + "?status=fail&fail_note="+fail_note;
			//response.sendRedirect(myaccount_activate_confirm + "?status=fail&fail_note="+fail_note);
		}
		this.getServletContext().getRequestDispatcher(url).forward(request,response);

	}

	public void destroy() {
	}
}
