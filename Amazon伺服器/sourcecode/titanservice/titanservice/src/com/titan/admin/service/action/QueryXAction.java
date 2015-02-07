package com.titan.admin.service.action;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.titan.admin.service.bean.QueryXBean;
import com.titan.admin.service.dao.QueryXDAO;
import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;
import com.titan.base.util.Util;

public class QueryXAction implements ActionInterf  {

	public QueryXAction() {
		// TODO Auto-generated constructor stub
	}

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		
		String sn = Util.getString(request.getParameter("SERIAL_NUMBER"));
		String mac = Util.getString(request.getParameter("MAC_ADDRESS"));
		String user = Util.getString(request.getParameter("USERNAME"));
		String email = Util.getString(request.getParameter("EMAIL"));
		String lk = Util.getString(request.getParameter("LICENSE_KEY"));
		
		MessageBean message = new MessageBean();
		message.setMenu("Service Management");
		message.setFunction("Query X");
		
		String originalURL = "/jsp/admin/service/queryX.jsf";
		message.setBackURL(originalURL);
		
		List<QueryXBean> list = new ArrayList<QueryXBean>();
		try {
			list = QueryXDAO.getInstance().query(user, email, sn, mac, lk);
		} catch (SQLException e) {
			logger.error("query error");
			message.setSucc(false);
			message.setMessage("Query error. "+e.getMessage());
			return message;
		}

		request.setAttribute("SERIAL_NUMBER", sn);
		request.setAttribute("MAC_ADDRESS", mac);
		request.setAttribute("USERNAME", user);
		request.setAttribute("EMAIL", email);
		request.setAttribute("LICENSE_KEY", lk);
		
		request.setAttribute("QUERY_X_ITEMS", list);
		
		message.setSucc(true);
		message.setTargetURL(originalURL);
		
		return message;
	}

}
