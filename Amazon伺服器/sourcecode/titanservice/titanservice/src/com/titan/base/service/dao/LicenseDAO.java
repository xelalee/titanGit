package com.titan.base.service.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import com.titan.base.service.bean.LicenseBean;
import com.titan.base.service.exception.LicenseKeyInsertException;
import com.titan.base.util.Keys;
import com.titan.base.jdbc.DAOHelper;



public class LicenseDAO {
	
	private static LicenseDAO instance = new LicenseDAO();
	public static LicenseDAO getInstance(){
		return instance;
	}
	
	public int insert(LicenseBean lk) throws LicenseKeyInsertException{
		try{
			return DAOHelper.getInstance().executeSQL(getInsertSQL(lk));
		}catch(SQLException ex){
			throw new LicenseKeyInsertException();
		}			
	}
	
	public String getInsertSQL(LicenseBean lk){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" INSERT INTO LICENSE (SERVICE_ID, LICENSE_KEY, SERVICE_TYPE_ID, SERVICE_CODE,");
		buffer.append(" BEGIN_DATE, SUSPEND_COUNT, STATUS,ORDER_ID,CARD_TYPE, SN,  MY_SERVICE_ID, UPDATE_DATE, CREATE_DATE)");
		buffer.append(" VALUES ("+lk.getService_id());
		buffer.append(" ,'"+lk.getLicense_key()+"'");
		buffer.append(" ,'"+lk.getService_type_id()+"'");
		buffer.append(" ,'"+lk.getService_code()+"'");
		buffer.append(" ,'"+lk.getBegin_date()+"'");
		buffer.append(" ,"+lk.getSuspend_count());
		buffer.append(" ,'"+lk.getStatus()+"'");
		buffer.append(" ,'"+lk.getOrder_id()+"'");
		buffer.append(" ,'"+lk.getCard_type()+"'");
		buffer.append(" ,'"+lk.getSn()+"'");
		buffer.append(" ,"+lk.getMy_service_id());
		buffer.append(" ,now(),now())");
		
		return buffer.toString().trim();
	}
	
	public String getInitialSQL(LicenseBean lk){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" INSERT INTO LICENSE (SERVICE_ID, LICENSE_KEY, SERVICE_TYPE_ID, SERVICE_CODE,ORDER_ID,");
		buffer.append(" CARD_TYPE, SN, UPDATE_DATE, CREATE_DATE)");
		buffer.append(" VALUES ("+lk.getService_id());
		buffer.append(" ,'"+lk.getLicense_key()+"'");
		buffer.append(" ,'"+lk.getService_type_id()+"'");
		buffer.append(" ,'"+lk.getService_code()+"'");
		buffer.append(" ,'"+lk.getOrder_id()+"'");
		buffer.append(" ,'"+lk.getCard_type()+"'");
		buffer.append(" ,'"+lk.getSn()+"'");
		buffer.append(" ,now(),now())");
		
		return buffer.toString().trim();
	}
	
	public int save(List<LicenseBean> lks) throws SQLException{
		int effects = 0;
		List<String> sqls = new ArrayList<String>(); 
		for(LicenseBean lk : lks){
			String sql = this.getInitialSQL(lk);
			sqls.add(sql);
		}
		effects = DAOHelper.getInstance().executeSQL(sqls);
		return effects;
	}
	
	public int update(LicenseBean lk) throws SQLException {
		return DAOHelper.getInstance().executeSQL(getUpdateSQL(lk));
		
	}
	
	public String getUpdateSQL(LicenseBean lk){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" UPDATE LICENSE");
		buffer.append(" SET ");
		buffer.append(" SERVICE_ID = "+lk.getService_id());
		buffer.append(" ,BEGIN_DATE = now(),UPDATE_DATE = now()");
		buffer.append(" ,SUSPEND_COUNT = 0");
		buffer.append(" ,STATUS = '"+Keys.STR_INSTALLED+"'");
		buffer.append(" ,MY_SERVICE_ID = "+lk.getMy_service_id());
		buffer.append(" WHERE LICENSE_KEY = '"+lk.getLicense_key()+"'");
		
		return buffer.toString();
	}	
	
	public LicenseBean getLicenseKey(String lk) throws SQLException{
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT *");
		buffer.append(" FROM LICENSE");
		buffer.append(" WHERE upper(LICENSE_KEY) = upper('"+lk.trim()+"')");
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		HashMap hm;
		LicenseBean lkb = null;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			lkb = new LicenseBean(hm);
		}
		return lkb;
	}
	
	public List<LicenseBean> getLicenseKeys(String order_id) throws SQLException{
		List<LicenseBean> lks = new ArrayList<LicenseBean>();
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT *");
		buffer.append(" FROM LICENSE");
		buffer.append(" WHERE ORDER_ID = '"+order_id+"'");
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(buffer.toString());

		LicenseBean lk = null;
		for(HashMap<String, Object> hm: col){
			lk = new LicenseBean(hm);
			lks.add(lk);
		}
		return lks;
	}
	
	public List<LicenseBean> getLicenseKeysByMyServiceId(String my_service_id) throws SQLException{
		List<LicenseBean> lks = new ArrayList<LicenseBean>();
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT *");
		buffer.append(" FROM LICENSE");
		buffer.append(" WHERE MY_SERVICE_ID = '"+my_service_id+"'");
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(buffer.toString());

		LicenseBean lk = null;
		for(HashMap<String, Object> hm: col){
			lk = new LicenseBean(hm);
			lks.add(lk);
		}
		return lks;
	}

    public Collection getLKInfo(String lk) throws SQLException {
        StringBuffer sql = new StringBuffer();
        Collection col = null;

        sql.append("SELECT * ");
        sql.append(" FROM LICENSE ");
        sql.append(" WHERE LICENSE_KEY ='" + lk + "'");
        col = DAOHelper.getInstance().query(sql.toString());

        return col;
    }
    
    public boolean isTrialAllowed(String productId, String serviceId) throws SQLException {

        StringBuffer sql = new StringBuffer();
        Collection col = null;

        sql.append(" SELECT count(*) A ");
        sql.append(" FROM PRODUCT_SERVICE_LICENSE_VIEW ");
        sql.append(" WHERE MY_PRODUCT_ID = " + productId);
        sql.append(" AND SERVICE_ID = " + serviceId);

        col = DAOHelper.getInstance().query(sql.toString());

        int count = 0;
        if (col != null && col.size() > 0) {
            Iterator it = col.iterator();
            HashMap mp = (HashMap) it.next();
            count = Integer.parseInt(mp.get("A").toString());
        }
        return (count==0);
    }
    
	public String getDelLKSQL(String myproductid){
		StringBuffer buffer = new StringBuffer();
		buffer.append("DELETE FROM LICENSE WHERE MY_PRODUCT_ID=");
		buffer.append(myproductid);
		return buffer.toString();
	}
}