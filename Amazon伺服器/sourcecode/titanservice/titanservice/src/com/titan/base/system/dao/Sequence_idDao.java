package com.titan.base.system.dao;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import org.apache.log4j.Logger;

import com.titan.base.jdbc.DAOHelper;
import com.titan.base.util.Util;

public class Sequence_idDao {
	
	private static final Logger logger = Logger.getLogger(Sequence_idDao.class);
	
	private static Sequence_idDao instance = new Sequence_idDao();
	public static Sequence_idDao getInstance(){
		return instance;
	}
	
    public synchronized long getSEQ(String name) {
        long id = 0;
        String sql = "SELECT NEXTID FROM SEQUENCE_ID WHERE NAME ='"+name+"'";
        Collection<HashMap<String, Object>> col = DAOHelper.getInstance().queryQuietly(sql);
        if(col.size()==0){
        	id = 1;
	        sql = "INSERT INTO SEQUENCE_ID(NAME,NEXTID) VALUES ('"+name+"',2)";
        }
        else{
	        for (Iterator<HashMap<String, Object>> it = col.iterator(); it.hasNext(); ) {
	            HashMap<String, Object> dataMap = it.next();
	            id = Util.getInteger(dataMap.get("NEXTID"));
	        }
	        sql = "UPDATE SEQUENCE_ID SET NEXTID = NEXTID + 1 WHERE NAME='"+name+"'"; 
        }
        DAOHelper.getInstance().executeSQLQuietly(sql);
        return id;
    }   

}
