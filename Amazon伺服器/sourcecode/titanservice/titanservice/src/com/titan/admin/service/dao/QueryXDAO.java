package com.titan.admin.service.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import com.titan.admin.service.bean.QueryXBean;
import com.titan.base.jdbc.DAOHelper;

import com.titan.base.product.dao.ProductDAO;

public class QueryXDAO {
	
	private static QueryXDAO instance = new QueryXDAO();
	public static QueryXDAO getInstance(){
		return instance;
	}

	public QueryXDAO() {
		// TODO Auto-generated constructor stub
	}
	
	public List<QueryXBean> query(String user, String email, String sn, String mac, String lk) 
			throws SQLException{
		List<QueryXBean> list = new ArrayList<QueryXBean>();
		
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT a.USERNAME, pslv.MY_PRODUCT_ID,pslv.SN,");
		buffer.append(" pslv.MAC,pslv.MODEL_NAME,pslv.SERVICE_NAME,");
		buffer.append(" pslv.SERVICE_TYPE_ID,pslv.STATUS, pslv.MY_SERVICE_ID");
		buffer.append(" FROM ACCOUNT a, PRODUCT_SERVICE_LICENSE_VIEW pslv");
		buffer.append(" WHERE a.ACCOUNT_ID=pslv.ACCOUNT_ID");
		if(!user.equals("")){
			buffer.append(" AND a.USERNAME='"+user+"'");
		}
		if(!email.equals("")){
			buffer.append(" AND a.EMAIL='"+email+"'");
		}
		if(!sn.equals("")){
			buffer.append(" AND pslv.SN='"+sn+"'");
		}
		if(!mac.equals("")){
			buffer.append(" AND pslv.MAC='"+mac+"'");
		}
		if(!lk.equals("")){
			buffer.append(" AND pslv.LICENSE_KEY='"+lk+"'");
		}
		
		Collection<HashMap<String,Object>> col = DAOHelper.getInstance().query(buffer.toString());
		
		if(col.size()==0){
			col = ProductDAO.getInstance().getProductBySnMac(sn, mac);
		}
		
		for(HashMap<String,Object> hm: col){
			QueryXBean bean = new QueryXBean(hm);
			list.add(bean);
		}
		
		return list;
	}

}
