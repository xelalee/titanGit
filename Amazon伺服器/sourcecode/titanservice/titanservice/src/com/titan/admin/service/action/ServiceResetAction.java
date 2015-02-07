package com.titan.admin.service.action;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;

import com.titan.base.jdbc.DAOHelper;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.MyProductDAO;

import com.titan.base.service.bean.MyServiceBean;
import com.titan.base.service.dao.MyServiceDAO;
import com.titan.base.util.Util;

public class ServiceResetAction implements ActionInterf  {

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		
		String dispatch = Util.getString(request.getParameter("dispatch"));
		
		MessageBean message = new MessageBean();
		
		if(dispatch.equals("search")){
			
			message = this.search(request, response, config);
			
		}else if(dispatch.equals("reset")){
			
			message = this.reset(request, response, config);
			
		}
		
		
		return message;
	}
	
	
	public MessageBean search(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		
		MessageBean message = new MessageBean();
		message.setMenu("Service Management");
		message.setFunction("Service Reset");
		
		String originalURL = "/jsp/admin/service/serviceReset.jsf";
		message.setBackURL(originalURL);
		
		String sn = Util.getString(request.getParameter("SERIAL_NUMBER"));
		String mac = Util.getString(request.getParameter("MAC_ADDRESS"));
		
		
		
		logger.debug("sn: "+sn+", mac: "+mac);
		
		MyProductBean myProduct = null;

		try {
			myProduct = MyProductDAO.getInstance().getProductBySnMac(sn, mac);	
		} catch (SQLException e) {
			logger.error("", e);
			message.setSucc(false);
			message.setMessage("Query error. "+e.getMessage());
			return message;
		}
		
		if(myProduct==null){
			message.setSucc(false);
			message.setMessage("Device is not registered.");
			return message;
		}else{
			List<MyServiceBean> myServices = null;
			try {
				myServices = MyServiceDAO.getInstance().getServicesByProductId(myProduct.getMy_product_id());
			} catch (SQLException e) {
				logger.error("", e);
			}
			
			request.getSession().setAttribute("service_reset_myproduct", myProduct);
			request.getSession().setAttribute("service_reset_myservice", myServices);
			
			request.getRequestDispatcher(originalURL).forward(request, response);
			
			logger.debug("forward ..." + originalURL);
			
		}
		
		return null;
		
	}
	
	public MessageBean reset(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		
		String id = Util.getString(request.getParameter("MY_PRODUCT_ID"));
		
		MessageBean message = new MessageBean();
		message.setMenu("Service Management");
		message.setFunction("Service Reset");
		
		String originalURL = "/jsp/admin/service/serviceReset.jsf";
		message.setBackURL(originalURL);
		
		MyProductBean myProduct = null;
		
		try {
			myProduct = MyProductDAO.getInstance().getByMyProductId(id);
		} catch (SQLException e) {
			logger.error("", e);
			message.setSucc(false);
			message.setMessage("Query error. "+e.getMessage());
			return message;
		}
		
		if(myProduct==null){
			message.setSucc(false);
			message.setMessage("Device is not registered.");
			return message;
		}
		
		List<String> sqls = new ArrayList<String>();
		//clear services
		sqls.add(MyServiceDAO.getInstance().getDelServiceSQL(myProduct.getMy_product_id()));
		//clear device
		sqls.add(MyProductDAO.getInstance().getDelProdSQL(myProduct.getMy_product_id()));
		
		try {
			DAOHelper.getInstance().executeSQL(sqls);
		} catch (SQLException e) {
			logger.error("", e);
			message.setSucc(false);
			message.setMessage("Service reset fail. "+e.getMessage());
			return message;
		}
		
		message.setSucc(true);
		message.setMessage("Service reset successfully.");
		
		request.getSession().removeAttribute("service_reset_myproduct");
		request.getSession().removeAttribute("service_reset_myservice");
		
		return message;
	}

}
