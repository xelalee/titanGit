package com.titan.base.product.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import com.titan.base.product.bean.ModelBean;
import com.titan.base.jdbc.DAOHelper;



public class ModelDAO {
	
	private static ModelDAO instance = new ModelDAO();
	public static ModelDAO getInstance(){
		return instance;
	}
	
	public ModelBean getModelByID(String id) throws SQLException{
		ModelBean bean = null;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT *");
        sql.append(" FROM MODEL");
        sql.append(" WHERE MODEL_ID="+id);
        Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(sql.toString());

        for(HashMap<String, Object> hm : col){
        	bean = new ModelBean(hm);
        }
        return bean;		
	}
	
	public List<ModelBean> getAll() throws SQLException{
		List<ModelBean> list = new ArrayList<ModelBean>();
		
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT *");
        sql.append(" FROM MODEL");
        sql.append(" ORDER BY MODEL_ID");
        Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(sql.toString());

        ModelBean bean = null;
        for(HashMap<String, Object> hm : col){
        	bean = new ModelBean(hm);
        	list.add(bean);
        }
        
        return list;		
	}
	
	public List<String> getCardTypes() throws SQLException{
		List<String> list = new ArrayList<String>();
		
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT DISTINCT CARD_TYPE");
        sql.append(" FROM MODEL");
        sql.append(" ORDER BY CARD_TYPE");
        Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(sql.toString());

        ModelBean bean = null;
        for(HashMap<String, Object> hm : col){
        	bean = new ModelBean(hm);
        	list.add(bean.getCard_type());
        }
        
        return list;		
	}

}
