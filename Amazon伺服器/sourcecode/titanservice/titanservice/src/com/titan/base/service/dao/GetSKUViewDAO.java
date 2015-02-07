package com.titan.base.service.dao;

import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.jdbc.DAOHelper;

public class GetSKUViewDAO {
    
    private static final Logger logger = Logger.getLogger(GetSKUViewDAO.class);
    
    private static GetSKUViewDAO instance = new GetSKUViewDAO();
    public static GetSKUViewDAO getInstance(){
    	return instance;
    }
    
	/**
	 * get SKU by MAC
	 * @param mac
	 * @return
	 * @throws SQLException 
	 */
	public Collection getSKUByMAC(String mac) throws SQLException{
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT * FROM GET_SKU_VIEW");
		buffer.append(" WHERE upper(MAC)=upper('"+mac+"')");
        buffer.append(" ORDER BY SERVICE_CODE asc,SKU_ATTRIBUTE_TYPE asc");
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		return col;
	}

}
