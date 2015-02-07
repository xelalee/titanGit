package com.titan.base.service.dao;

import java.sql.SQLException;
import java.util.*;

import com.titan.base.service.bean.SKUBean;
import com.titan.base.util.Util;
import com.titan.base.jdbc.DAOHelper;

public class SKUDAO {
	
	private static SKUDAO instance = new SKUDAO();
	
	public static SKUDAO getInstance(){
		return instance;
	}
	
	public int getDateValue(String service_type_id, String service_code) throws SQLException{
		SKUBean bean = getSku(service_type_id,service_code,"date");

		return Util.getInteger(bean.getValue());
	}
	
	public SKUBean getSku(String service_type_id, String service_code) throws SQLException{
		return getSku(service_type_id,service_code,"");
	}
	
	public Collection getSkuCollection(String service_type_id, String service_code) throws SQLException 
			{
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT *");
		buffer.append(" FROM SKU");
		buffer.append(" WHERE SERVICE_TYPE_ID='"+service_type_id+"'");
		buffer.append(" AND SERVICE_CODE='"+service_code+"'");
		
		Collection col = DAOHelper.getInstance().query(buffer.toString());
	
		return col;
	}
	
	/**
	 * @param service_type_id
	 * @param service_code 
	 * @param attribute_type opetional, SET "" or null if ignore
	 * @return
	 * @throws SQLException 
	 */
	public SKUBean getSku(String service_type_id, String service_code, String attribute_type) throws SQLException 
	      {
		SKUBean bean = null;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT *");
		buffer.append(" FROM SKU");
		buffer.append(" WHERE SERVICE_TYPE_ID='"+service_type_id+"'");
		buffer.append(" AND SERVICE_CODE='"+service_code+"'");
		if(attribute_type!=null && !attribute_type.trim().equals("")){
			buffer.append(" AND ATTRIBUTE_TYPE='"+attribute_type+"'");
		}
		
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			bean = new SKUBean(hm);
		}
		return bean;
	}

}
