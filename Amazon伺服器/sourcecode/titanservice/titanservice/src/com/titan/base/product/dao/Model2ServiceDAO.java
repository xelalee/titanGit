package com.titan.base.product.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import com.titan.base.product.bean.Model2ServiceBean;
import com.titan.base.service.bean.LicenseBean;
import com.titan.base.jdbc.DAOHelper;

public class Model2ServiceDAO {
	
	private static Model2ServiceDAO instance = new Model2ServiceDAO();
	public static Model2ServiceDAO getInstance(){
		return instance;
	}
	
    public List<Model2ServiceBean> getServiceCodes(String serviceTypeId) throws SQLException{
    	List<Model2ServiceBean> list = new ArrayList<Model2ServiceBean>();
		StringBuffer buffer = new StringBuffer();

		buffer.append(" SELECT DISTINCT SERVICE_TYPE_ID, SERVICE_CODE"); 
		buffer.append(" FROM MODEL2SERVICE");
		if(!serviceTypeId.equals("")){
			buffer.append(" WHERE SERVICE_TYPE_ID='"+serviceTypeId+"'");
		}
		buffer.append(" ORDER BY SERVICE_CODE,SERVICE_TYPE_ID DESC");
		
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(buffer.toString());

		for(HashMap<String, Object> hm: col){
			Model2ServiceBean bean = new Model2ServiceBean(hm);
			list.add(bean);
		}
		return list;    	
    }
    
    public Model2ServiceBean getByCardType_ServiceCode_ServiceType(String cardType, String serviceCode,
            String serviceTypeId) throws SQLException {
        Model2ServiceBean m2s = null;
        
        StringBuffer buffer = new StringBuffer();
        buffer.append(" SELECT m2s.*");   
        buffer.append(" FROM MODEL2SERVICE m2s, MODEL m");   
        buffer.append(" WHERE m2s.MODEL_ID=m.MODEL_ID"); 
        buffer.append(" AND m.CARD_TYPE = '"+cardType+"'");  
        buffer.append(" AND m2s.SERVICE_CODE ='"+serviceCode+"'");  
        buffer.append(" AND m2s.SERVICE_TYPE_ID ='"+serviceTypeId+"'"); 
        
        Collection col = DAOHelper.getInstance().query(buffer.toString());

        if(col != null && col.size() > 0){
            Iterator it = col.iterator();
            HashMap hm = (HashMap) it.next();
            
            m2s = new Model2ServiceBean(hm);
        } 
        
        return m2s;
    }
    
    public Model2ServiceBean getByModelId_ServiceCode_ServiceType(String modelId, String serviceCode,
            String serviceTypeId) throws SQLException {
        Model2ServiceBean m2s = null;
        Collection col        = null;
        StringBuffer buffer = new StringBuffer();
        buffer.append(" SELECT * ");          
        buffer.append(" FROM MODEL2SERVICE ");
        buffer.append(" WHERE MODEL_ID = "+modelId);
        buffer.append(" AND SERVICE_CODE ='"+serviceCode+"'");
        buffer.append(" AND SERVICE_TYPE_ID ='" + serviceTypeId +"'");
        
        col = DAOHelper.getInstance().query(buffer.toString());

        if(col != null && col.size() > 0){
            Iterator it = col.iterator();
            HashMap hm = (HashMap) it.next();
            
            m2s = new Model2ServiceBean(hm);
        } 
        
        return m2s;
    }
    
    public boolean checkLKMatchServiceId(String license_key, String service_id, String modelId) throws SQLException {
    	
    	LicenseBean lk = new LicenseBean(license_key);
    	
        Collection col        = null;
        StringBuffer buffer = new StringBuffer();
        buffer.append(" SELECT * ");          
        buffer.append(" FROM MODEL2SERVICE ");
        buffer.append(" WHERE MODEL_ID = "+modelId);
        buffer.append(" AND SERVICE_TYPE_ID ='"+lk.getService_type_id()+"'");
        buffer.append(" AND SERVICE_CODE ='"+lk.getService_code()+"'");
        buffer.append(" AND SERVICE_ID =" + service_id );
        
        col = DAOHelper.getInstance().query(buffer.toString());
        
        return (col != null && col.size()>0);
    }
    
    public Collection getModelByLK(LicenseBean lkBean) throws SQLException{
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT MODEL_ID,SERVICE_ID");
        sql.append(" FROM MODEL2SERVICE");
        sql.append(" WHERE SERVICE_TYPE_ID ='" + lkBean.getService_type_id()+"'");
        sql.append(" AND SERVICE_CODE ='" + lkBean.getService_code()+"'");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        
        return col;
    }

}
