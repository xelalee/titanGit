package com.titan.base.service.dao;

import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.service.bean.ServiceBean;
import com.titan.base.util.Util;
import com.titan.base.jdbc.DAOHelper;

public class ServiceDAO {
    static Logger logger = Logger.getLogger(ServiceDAO.class);
    
    private static ServiceDAO instance = new ServiceDAO();
    public static ServiceDAO getInstance(){
    	return instance;
    }
	
	public ServiceBean getServiceByModelId_ServiceCode(String model_id, String service_code) throws SQLException{
		ServiceBean bean = null;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT sn.*");
		buffer.append(" FROM MODEL2SERVICE m2s LEFT JOIN SERVICE sn");
		buffer.append(" on m2s.SERVICE_ID=sn.SERVICE_ID");
		buffer.append(" WHERE m2s.MODEL_ID="+model_id);
		buffer.append(" AND m2s.SERVICE_CODE='"+service_code+"'");
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		if(col!=null && col.size()>0){
			Iterator it = col.iterator();
			HashMap hm = (HashMap)it.next();
			bean = new ServiceBean(hm);
		}
		return bean;
	}

    public HashMap getModel2ServiceName() throws SQLException {
        HashMap<String,HashMap> m2sMap = new HashMap<String,HashMap>(); 
        String sql = "SELECT distinct m2s.MODEL_ID,m2s.SERVICE_ID SERVICE_ID,sn.SERVICE_NAME,m2s.SERVICE_CODE," +
                " sn.SERVICE_SHORT_NAME" +
                " FROM MODEL2SERVICE m2s,SERVICE sn" +
                " WHERE m2s.SERVICE_ID = sn.SERVICE_ID";
        Collection col = DAOHelper.getInstance().query(sql);

        if(col!=null && col.size()>0){
            for(Iterator it = col.iterator();it.hasNext();){            
                HashMap hm = (HashMap)it.next();
                String model_id = Util.getString(hm.get("MODEL_ID"));
                String service_code = Util.getString(hm.get("SERVICE_CODE"));
                m2sMap.put(model_id + "::" + service_code, hm);
            }
        }
        return m2sMap;
    }
    
    public ServiceBean getByServiceId(String service_id) throws SQLException{
    	ServiceBean snb = null;
    	StringBuffer buffer = new StringBuffer();
    	buffer.append(" SELECT * FROM SERVICE");
    	buffer.append(" WHERE SERVICE_ID="+service_id);
    	
    	Collection col = DAOHelper.getInstance().query(buffer.toString());

    	
    	HashMap hm;
        for(Iterator it = col.iterator();it.hasNext();){
        	hm = (HashMap)it.next();
        	snb = new ServiceBean(hm);
        }
        return snb;
    }
    
}
