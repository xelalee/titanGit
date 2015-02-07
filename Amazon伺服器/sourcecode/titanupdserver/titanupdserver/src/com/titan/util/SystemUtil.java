package com.titan.util;

import java.io.FileInputStream;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.ArrayList;
import java.util.Properties;

import com.titan.jdbc.DAOHelper;
import com.titan.util.Keys;

public class SystemUtil {

    public static final String SEQUENCE_ID = "SEQUENCE_ID";
    public SystemUtil() {
    }
	
    /**
     *@Get Sequence Number in SEQUENCE_ID table
     *@param name the string to get Sequnce Value
     *@return java.math.BigDecimal the result
     */
    public static int getSEQByName(String name) {
    	int id = 0;
        Collection dataCollection = new ArrayList();
        String sql = "";
        sql="select NEXTID from " + SEQUENCE_ID+" where NAME ='"+name+"'";
        dataCollection = DAOHelper.queryQuietly(sql);
        if((!dataCollection.isEmpty())&&(dataCollection!=null)){
	        for (Iterator it = dataCollection.iterator(); it.hasNext(); ) {
	            HashMap dataMap = (HashMap) it.next();
	            id = Util.getInteger(dataMap.get("NEXTID"));
	        }
	        sql = "update " + SEQUENCE_ID + " set NEXTID = NEXTID + 1 where NAME='"+name+"'"; 
        }
        else{
        	id = 1;
	        sql = "insert into " + SEQUENCE_ID + "(NAME,NEXTID) values ('"+name+"',2)";
        }
        
        DAOHelper.executeSQLQuietly(sql);
        
        return id;
    }   

    /**
     *@set Sequence Number in SEQUENCE_ID table
     *@param name the string to get Sequnce Value
     *@param nextid 
     *@return java.math.BigDecimal the result
     */
    public static void setSEQByName(String name,String nextid) {
        int effects=0;

        String sql = "";
        sql = "update " + SEQUENCE_ID + " set NEXTID ="+nextid+" where NAME='"+name+"'"; 
	    
        effects = DAOHelper.executeSQLQuietly(sql);
        
        if(effects==0){
		    sql = "insert into " + SEQUENCE_ID + "(NAME,NEXTID) values ('"+name+"',"+nextid+")";
		    effects = DAOHelper.executeSQLQuietly(sql);
        }
    }    
    
	public static HashMap parseKeywords(String keywords) {
		ArrayList keylist = new ArrayList();
		ArrayList oplist = new ArrayList();
		HashMap result = new HashMap();
		
		String keys = keywords;
		String key = "";
		int and_pos = keywords.indexOf("+");
		int or_pos = keywords.indexOf(",");		
		int len = keywords.length();
		
		if(and_pos < 0 && or_pos < 0){
			keylist.add("%"+keys.trim()+"%");
		}
		else if(and_pos < 0){
			while(or_pos >= 0){
				key = keys.substring(0,or_pos).trim();

				keylist.add("%"+key+"%");
				oplist.add(" OR ");				
				keys = keys.substring(or_pos+1).trim();
				or_pos = keys.indexOf(",");			
			}
			keylist.add("%"+keys+"%");
		}
		else if(or_pos < 0){
			while(and_pos >= 0){
				key = keys.substring(0,and_pos).trim();
			
				keylist.add("%"+key+"%");
				keys = keys.substring(and_pos+1).trim();
				and_pos = keys.indexOf("+");
				oplist.add(" AND ");
			}
			keylist.add("%"+keys+"%");
		}
		else{
			int pos = 0;
			while(and_pos >= 0 || or_pos >= 0){
				if(and_pos < 0){
					oplist.add(" OR ");
					pos = or_pos;
				}
				else if(or_pos < 0){
					oplist.add(" AND ");
					pos = and_pos;
				}
				else if(and_pos > or_pos){
					oplist.add(" OR ");
					pos = or_pos;
				}
				else{
					oplist.add(" AND ");
					pos = and_pos;					
				}
				
				key = keys.substring(0,pos).trim();
				keylist.add("%"+key+"%");
				
				keys = keys.substring(pos+1).trim();
				and_pos = keys.indexOf("+");
				or_pos = keys.indexOf(",");
			}
			keylist.add("%"+keys+"%");			
		}
		
		result.put("key",keylist);
		result.put("op",oplist);

		return result;
	}

	
    public static Properties loadPropertyFile(String filename) throws Exception{
    	SystemUtil util = new SystemUtil();
		Properties props = new Properties();
		try {
			String classRoot = util.getClass().getResource(".").toString();

			int index1 = classRoot.indexOf(":");
			int index2 = classRoot.indexOf("classes");
			String webInfPath = classRoot.substring(index1+1,index2);

			String path = webInfPath + "conf/" + filename;	
			
			FileInputStream stream = new FileInputStream(path);
			props.load(stream);
			stream.close();
		} catch (Exception e) {
			throw e;
		}
		return props;
    }
    
    public static String getWebInfoRoot(){
    	String webInfRoot = "";
    	SystemUtil util = new SystemUtil();

		String classRoot = util.getClass().getResource(".").toString();

		int index1 = classRoot.indexOf(":");
		int index2 = classRoot.indexOf("classes");
		webInfRoot = classRoot.substring(index1+1,index2);

		return webInfRoot;
    }

}

