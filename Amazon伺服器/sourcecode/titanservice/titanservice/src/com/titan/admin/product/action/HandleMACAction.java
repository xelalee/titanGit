package com.titan.admin.product.action;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;
import com.titan.base.product.dao.ProductDAO;
import com.titan.base.product.bean.ProductBean;
import com.titan.base.util.Util;

public class HandleMACAction implements ActionInterf {
	
	static Logger logger = Logger.getLogger(HandleMACAction.class);

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		String dispatch = Util.getString(request.getParameter("dispatch"));
		
		String targetDate = Util.getString(request.getParameter("targetDate"));
		
		MessageBean message = new MessageBean();
		
		String originalURL = "/jsp/admin/product/queryMAC.jsf";
		
		message.setBackURL(originalURL);
		
		message.setMenu("Product Management");
		if(dispatch.equalsIgnoreCase("query")){
			List<ProductBean> products = null;
			try {
				products = ProductDAO.getInstance().getByDate(targetDate, targetDate);
				logger.debug("products length: "+products.size());
			} catch (SQLException e) {
				logger.error("", e);
			}
			request.getSession().setAttribute("query_products", products);
			
			request.getSession().setAttribute("targetDate", targetDate);
			
			request.getRequestDispatcher(originalURL).forward(request, response);
			
			logger.debug("forward ..." + originalURL);
			
		}else if(dispatch.equalsIgnoreCase("delete")){
			String product_macs = Util.getString(request.getParameter("product_macs"));
			
			String[] productArr = product_macs.split(",");
			
			int effects = 0;
			
			try {
				effects = ProductDAO.getInstance().deleteByMac(productArr);
			} catch (SQLException e) {
				logger.error("", e);
			}
			
			logger.debug("delete product number " + effects);
			
			List<ProductBean> products = null;
			try {
				products = ProductDAO.getInstance().getByDate(targetDate, targetDate);
			} catch (SQLException e) {
				logger.error("", e);
			}
			request.getSession().setAttribute("query_products", products);
			
			request.getSession().setAttribute("targetDate", targetDate);
			
			request.getRequestDispatcher(originalURL).forward(request, response);
			
			logger.debug("forward ..." + originalURL);			
			
		}
		
		
		return null;
	}

}
