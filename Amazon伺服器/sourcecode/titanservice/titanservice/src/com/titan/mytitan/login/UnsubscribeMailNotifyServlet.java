package com.titan.mytitan.login;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

import org.apache.log4j.Logger;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.app.log.CommonLog;

import com.titan.base.util.PasswordCoder;
import com.titan.base.util.Util;
import com.titan.mytitan.login.dao.LoginDAO;
import com.titan.base.configure.Configure;

public class UnsubscribeMailNotifyServlet extends HttpServlet {
	private final static String confirm_page = Configure.configure.getProperty("DOMAIN_NAME")+"/register/jsp/login/unsubcribe_notify_mail_confirm.jsf";

	// private ServletContext context;

	static Logger logger = Logger.getLogger(UnsubscribeMailNotifyServlet.class);

	private String username = "";

	private String password = "";

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

	private void process(HttpServletRequest request, HttpServletResponse response) 
	        throws ServletException, IOException {
		int flag = 0;
		// process
		username = Util.getString(request.getParameter("USERNAME"));
		String en_password = Util.getString(request.getParameter("PASSWORD"));
		password = PasswordCoder.decode(en_password);

		AccountBean bean = null;
		try{
			bean = AccountDAO.getInstance().getAccountByUsername(username);
		}catch(SQLException ex){
			flag = -1;
			bean = null;
		}
		if(bean!=null){
			if(password.equals(bean.getPassword())){
				try{
					flag = LoginDAO.getInstance().unsubscribe(bean);
				}catch(Exception ex){
					flag = -1;
				}				
			}
		}

		CommonLog lf = new CommonLog();
		if (flag == 1) {
			lf.setTitle("Unsubscribe successfully. [Username]:"+username);
			logger.info(lf.toString());
			response.sendRedirect(confirm_page + "?status=success");
		} else {
			lf.setTitle("Unsubscribe fail. [Username]:"+username+", [Password]:"+password);
			logger.error(lf.toString());			
			response.sendRedirect(confirm_page + "?status=fail");
		}

	}

	public void destroy() {
	}
}
