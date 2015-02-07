package com.titan.base.system.dao;

import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.system.bean.Sn_seqBean;
import com.titan.base.jdbc.DAOHelper;

public class Sn_seqDAO {
	
	private static final Logger logger = Logger.getLogger(Sn_seqDAO.class);
	
	private static Sn_seqDAO instance = new Sn_seqDAO();
	public static Sn_seqDAO getInstance(){
		return instance;
	}
	
	public Sn_seqBean get4Product() throws SQLException{
        return this.get("S");
	}
	
	public Sn_seqBean get4License() throws SQLException{
        return this.get("L");
	}
	
	public synchronized Sn_seqBean get(String type){
		String month = this.getCurrentMonth();
		Sn_seqBean bean = null;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT * FROM SN_SEQ");
        sql.append(" WHERE MONTH='"+month+"'");
        sql.append(" AND TYPE='"+type+"'");
        
        Collection<HashMap<String, Object>> col = DAOHelper.getInstance().queryQuietly(sql.toString());
        
        if(col.size()==0){
        	//initial
        	sql = new StringBuffer();
            sql.append(" INSERT INTO SN_SEQ(MONTH,TYPE,SEQ)VALUES(");
            sql.append(" '"+month+"','"+type+"', 2");
            sql.append(")");
            DAOHelper.getInstance().executeSQLQuietly(sql.toString());
            bean = new Sn_seqBean(month, type, 1);
        }else{
            for(Iterator<HashMap<String, Object>> it=col.iterator();it.hasNext();){
            	HashMap<String, Object> hm = it.next();
            	bean = new Sn_seqBean(hm);
            } 
            this.increase(bean);
        }
        return bean;
	}
	
	public void increase(Sn_seqBean bean){
		increase(bean,1);
	}
	
	/**
	 * seq = seq +quantity
	 * @param bean
	 * @param quantity
	 * @throws DAOHelperException
	 */
	public synchronized void increase(Sn_seqBean bean,int quantity){
        StringBuffer sql = new StringBuffer();
        sql.append(" UPDATE SN_SEQ SET SEQ = SEQ +"+quantity);
        sql.append(" WHERE MONTH='"+bean.getMonth()+"'");
        sql.append(" AND TYPE='"+bean.getType()+"'");
        
        DAOHelper.getInstance().executeSQLQuietly(sql.toString());
	}
	
	private String getCurrentMonth(){
		Calendar cal = Calendar.getInstance();
		int year = cal.get(Calendar.YEAR);
		int month = cal.get(Calendar.MONTH);
		String yearStr = String.valueOf(year).substring(2);
		return yearStr + Integer.toHexString(month+1);
	}

}
