package com.titan.base.service.business;

import java.sql.SQLException;
import java.util.*;

import com.titan.base.service.bean.GetSKUViewBean;
import com.titan.base.service.dao.GetSKUViewDAO;

public class ServiceRefresh {
	public final static String SKU_SEPARATOR = "&";
	public final static String SKU_EQUAL_MARK = "=";
	
	public final static String SERVICE_REFRESH = "service_refresh";
	
	/**
	 * get SKU String FROM SKU Collection
	 * @param list
	 * @return
	 * @throws SQLException 
	 */
	public static String getSKUString(String mac) throws SQLException{
		StringBuffer buffer = new StringBuffer();
		Collection col = GetSKUViewDAO.getInstance().getSKUByMAC(mac);

		HashMap hm = null;
		GetSKUViewBean bean = null;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new GetSKUViewBean(hm);
			buffer.append(SKU_SEPARATOR);
			buffer.append(bean.getSku_attribute());
			buffer.append(SKU_EQUAL_MARK);
			buffer.append(bean.getSku_value());
		}
		if(buffer.length()==0){
			return "";
		}
		return buffer.substring(1);
	}

}
