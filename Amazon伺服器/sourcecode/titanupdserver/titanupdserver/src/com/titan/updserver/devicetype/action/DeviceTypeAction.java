package com.titan.updserver.devicetype.action;

import com.titan.controller.manage.ActionManagement;
import com.titan.controller.exception.ActionException;
import com.titan.jdbc.DAOHelper;

import com.titan.util.Util;
//import com.titan.util.SystemUtil;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import java.util.*;
//import java.math.BigDecimal;


public class DeviceTypeAction extends ActionManagement {
	
	static Logger logger = Logger.getLogger(DeviceTypeAction.class);

  private boolean DEBUG = false;
  private String action = "";
  private String function = "";
  String code = null;

  public DeviceTypeAction() {
  }

  /**
   * To execute transaction and return status code
   * @param request (request)
   * @return code
   * @throws ActionException
   */
  public String process(HttpServletRequest request) throws ActionException {

	//Transaction remote = (Transaction) request.getSession().getAttribute(Keys.Titan_EJB_NAME);
	this.action = request.getParameter("hidAction");
	this.function = request.getParameter("hidFunction");
	ArrayList dataList = null;

	dataList = businessRule(request);

	//To execute transaction and return status code
	String transactionStatus = "";
	if (dataList != null) {
	
		try {
		    DAOHelper.executeSQL(dataList);
		}
		catch (Exception ex) {
			
			if("ADDNEW".equalsIgnoreCase(action)) {
				   code = "4110";        //exception when add a device type
			} 
			else if("UPDATE".equalsIgnoreCase(action)) {
					code = "4120";       //exception when update a device type
			}else if("DELETE".equalsIgnoreCase(action)){
					code = "4130";		 //exception when delete a device type	
			}
			request.setAttribute("RESULT_CODE",code);
		    logger.error("", ex);
		    
		}
	}
	return "";
  }

  /**
   * Fill in the business rule
   * @param request (request)
   * @return sql ArrayList
   */
  private ArrayList businessRule(HttpServletRequest request) {
	ArrayList dataList = new ArrayList();
	
	// retrieve original and new device type parameter
	String device_type = Util.getString(request.getParameter("device_type"));
	String org_device_type = Util.getString(request.getParameter("org_device_type"));
	
	//Write Business code
	if("ADDNEW".equalsIgnoreCase(action)) {
	   if(isDeviceTypeExist(request)) {
	   	// this device type already exists, so don't add again
		code = "4111";
		request.setAttribute("RESULT_CODE",code);
		return null;
	   }
	   dataList = insertDeviceTypeSql(request);
	} else if("UPDATE".equalsIgnoreCase(action)) {

		// original and new device type are the same
		if (org_device_type.equals(device_type)) {
			return null;
		} else if (org_device_type.equalsIgnoreCase(device_type)) {
		// case can be changed
		} else {
			if(isDeviceTypeExist(request)) {
			 // this device type already exists, so don't update
			 code = "4111";
			 request.setAttribute("RESULT_CODE",code);
			 return null;
			}
		}
		
		if(isUsedInSignature(request, org_device_type)) {
			// this device type has beed used in signature table, so can't update
			code = "4121";
			request.setAttribute("RESULT_CODE", code);
			return null; 
		}
	   dataList = updateDeviceTypeSql(request);
	} else if("DELETE".equalsIgnoreCase(action)) {
		if(isUsedInSignature(request, device_type)) {
            //this device type has beed used in signature table, so can't delete
			code = "4121";
			request.setAttribute("RESULT_CODE", code);
			return null; 
		}
		dataList = deleteDeviceTypeSql(request);
	}
	return dataList;
  }

  /**
   * Create insert DEVICE_TYPE table sql
   * @param request (device_new.jsp request)
   * @return ArrayList
   */
  private ArrayList insertDeviceTypeSql(HttpServletRequest request) {
	  
	  ArrayList dataList = new ArrayList();

	StringBuffer device_type_sql = new StringBuffer();
	
	String device_type = Util.getString(request.getParameter("device_type"));

	device_type_sql.append("insert into DEVICE_TYPE (DEVICE) ");
	device_type_sql.append("values ('"+device_type+"')");
	
	dataList.add(device_type_sql.toString());
	
	return dataList;
  }


  /**
   * Create update DEVICE_TYPE table sql
   * @param request (device_edit.jsp request)
   * @return ArrayList
   */
  private ArrayList updateDeviceTypeSql(HttpServletRequest request) {
	  ArrayList dataList = new ArrayList();
	StringBuffer device_type_sql = new StringBuffer();
	
	String device_type = Util.getString(request.getParameter("device_type"));

	device_type_sql.append("update DEVICE_TYPE set DEVICE=? ");
	device_type_sql.append("where DEVICE='"+device_type+"'");
	
	dataList.add(device_type_sql.toString());
	
	return dataList;
  }

  
  
  /**
   * Create delete DEVICE_TYPE table sql, added by william.yang
   * @param request (device_edit.jsp request)
   * @return ArrayList
   */
  private ArrayList deleteDeviceTypeSql(HttpServletRequest request) {
	  
	  ArrayList dataList = new ArrayList();
	  
	StringBuffer device_type_sql = new StringBuffer();
    
	String device_type = Util.getString(request.getParameter("device_type"));
	
	device_type_sql.append("delete from DEVICE_TYPE where DEVICE='"+device_type+"'");

	dataList.add(device_type_sql.toString());
	
	return dataList;
  }
  
  /**
   * check if device type exists
   * @return
   */	
  private boolean isDeviceTypeExist(HttpServletRequest request) {
	  StringBuffer sql = new StringBuffer();
		
	  String device_type = Util.getString(request.getParameter("device_type"));
	  
	  sql.append("select DEVICE from DEVICE_TYPE where upper(DEVICE)=upper('"+device_type+"')");
	 
	  try{
		      Collection col = DAOHelper.query(sql.toString());
			  //judge
			  if((col==null) || (col.isEmpty())){
				  return false;   
			  }
			  else
			  {
				  return true;	//exists			
			  }
	  }catch(Exception e){
		  logger.error("", e);
		  return true;   //exists
	  }			
  }
  
  /**
   * check if this device type has been used in table signature
   * @return
   */	
  private boolean isUsedInSignature(HttpServletRequest request, String device_type) {
	  StringBuffer sql = new StringBuffer();
	  ArrayList device_type_value = new ArrayList();
		
	  sql.append("select DEVICE from SIGNATURE where upper(DEVICE)=upper('"+device_type+"')");
		
	  try{
			  Collection col = DAOHelper.query(sql.toString());
			  //judge
			  if((col==null) || (col.isEmpty())){
				  return false;   
			  }
			  else
			  {
				  return true;	//exists			
			  }
	  }catch(Exception e){
		  logger.error("", e);
		  return true;   //exists
	  }			
  }

}
