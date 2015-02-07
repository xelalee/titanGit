package com.titan.updserver.account.action;

import com.titan.controller.manage.ActionManagement;

import com.titan.controller.exception.ActionException;

import com.titan.util.Util;
import com.titan.util.SystemUtil;
import com.titan.jdbc.DAOHelper;
import com.titan.updserver.account.dao.AccountDao;


import java.util.HashMap;
import java.util.Collection;
import java.util.Iterator;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;



public class PrivilegeUpdateAction extends ActionManagement {
	
	static Logger logger = Logger.getLogger(PrivilegeUpdateAction.class);
	
	static final boolean DEBUG=false;

	public PrivilegeUpdateAction() {
	}

	public String process(HttpServletRequest request) throws ActionException {

	    
		String action = Util.getString(request.getParameter("hidAction"));
	    String function = Util.getString(request.getParameter("hidFunction"));
	    String group_id = Util.getString(request.getParameter("group_id"));
	    String check = Util.getString(request.getParameter("check"));
	    
	    String code=null;
	    ArrayList<String> dataList=new ArrayList<String>();
	    
	    if("PRIVILEGE_UPDATE".equalsIgnoreCase(action)){
	    	//get old data
	    	Collection col0=AccountDao.getAllFunction();

			StringBuffer sql =null;
			//delete old data in table
			sql=new StringBuffer();
			sql.append(" delete from FUNCTION2GROUP_NAME where GROUP_ID="+group_id);

		    dataList.add(sql.toString());
		    
		    //add new data	 
		    HashMap hm=new HashMap();
		    int i=0;
		    for(Iterator it=col0.iterator();it.hasNext();){
				hm=(HashMap)it.next();
				String GROUP_ID1=check.substring(i,i+1);
				if(GROUP_ID1.equals("1")){
					String MAPPING_ID=String.valueOf(SystemUtil.getSEQByName("FUNCTION2GROUP_NAME"));
			    	sql=new StringBuffer();
					sql.append(" insert into FUNCTION2GROUP_NAME(MAPPING_ID,FUNCTION_ID,MENU_ID,GROUP_ID)");
					sql.append(" values("+MAPPING_ID+","+Util.getString(hm.get("FUNCTION_ID"))+","+Util.getString(hm.get("MENU_ID"))+","+group_id+")");

				    dataList.add(sql.toString());					
				}   
				i++;
		    }	    
	    }
	    try{
	    	DAOHelper.executeSQL(dataList);
	    }catch(Exception ex){
	    	logger.error("", ex);
	    	code="2005";
	    }
	  
	    request.setAttribute("RESULT_CODE",code);
	    return "";
	}
}