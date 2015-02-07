package com.titan.base.app.countrycode.dao;

import java.sql.SQLException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import com.titan.base.app.countrycode.bean.CountryCodeBean;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.base.jdbc.DAOHelper;

public class CountryCodeDAO {
	
	private static CountryCodeDAO instance = new CountryCodeDAO();
	public static CountryCodeDAO getInstance(){
		return instance;
	}
	
	public Collection getAll() throws SQLException  {
		StringBuffer sql = new StringBuffer();
		sql.append(" SELECT * FROM ");
		sql.append(Keys.QUICK_CODE);
		sql.append(" order by code");
		Collection col = DAOHelper.getInstance().query(sql.toString());
		return col;
	}

	public CountryCodeBean get(String code) throws SQLException{
		StringBuffer sql = new StringBuffer();
		sql.append(" SELECT * FROM ");
		sql.append(Keys.QUICK_CODE);
		sql.append(" WHERE CODE = '" + code + "' ");
		Collection col = DAOHelper.getInstance().query(sql.toString());
		
		HashMap hm = null;
		for (Iterator it = col.iterator(); it.hasNext();) {
			hm = (HashMap) it.next();
		}
		CountryCodeBean bean = new CountryCodeBean(hm);
		return bean;
	}
	
    public String getCountryNameByCode(String code) throws SQLException{
        String CountryName = "";
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT VALUE1 FROM "+Keys.QUICK_CODE);
        sql.append(" WHERE CODE = '");
        sql.append(code+"'");
        Collection col = DAOHelper.getInstance().query(sql.toString());

        if(col != null){
            for(Iterator it=col.iterator(); it.hasNext(); ){
                HashMap hmp = (HashMap)it.next();
                CountryName = Util.getString(hmp.get("VALUE1"));
            }
        }
        return CountryName;
    }
}
