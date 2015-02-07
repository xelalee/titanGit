package com.titan.register.service.action;

import java.sql.SQLException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.app.error.bean.ErrorBean;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.service.business.ServiceRefresh;
import com.titan.base.util.Util;
import com.titan.register.controller.ActionAbstract;
import com.titan.register.controller.ResponseBase;
import com.titan.register.service.ServiceRefreshResponse;

public class ServiceRefreshAction extends ActionAbstract{

	@Override
	public HashMap<String, String> parseRequest(HttpServletRequest request) {
		HashMap<String, String> map = new HashMap<String, String>();
		map.put("mac", Util.getString(request.getParameter("mac")));
		return map;
	}

	@Override
	public ResponseBase handle(HashMap<String, String> requestMap)
			throws SQLException {
		String mac = requestMap.get("mac");
		
		ServiceRefreshResponse resp = new ServiceRefreshResponse();

		ErrorBean error = null;
		MyProductBean myproduct = MyProductDAO.getInstance().getProductByMac(mac);

		
		if(myproduct == null){	
			resp = new ServiceRefreshResponse("ERR_PRODUCT_UNREGISTERED");
			return resp;
		}
		
		String sku = "";
		AccountBean account = null;

		sku = ServiceRefresh.getSKUString(mac);
        if(sku == null || sku.equalsIgnoreCase("")){
            sku = "N/A";        
        }
        
		account = AccountDAO.getInstance().getAccountByAccountId(myproduct.getAccount_id());

		String username = account.getUsername();
		
		resp.setSku(sku);
		resp.setUsername(username);
		
		return resp;
	}
	   
}
