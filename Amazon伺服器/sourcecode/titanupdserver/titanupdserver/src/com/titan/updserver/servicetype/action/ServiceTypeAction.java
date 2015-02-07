package com.titan.updserver.servicetype.action;

import com.titan.controller.manage.ActionManagement;
import com.titan.controller.exception.ActionException;
import com.titan.jdbc.DAOHelper;

import com.titan.util.Util;
//import com.titan.util.SystemUtil;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import java.util.*;
//import java.math.BigDecimal;

public class ServiceTypeAction extends ActionManagement {
	
	static Logger logger = Logger.getLogger(ServiceTypeAction.class);

  private boolean DEBUG = false;
  private String action = "";
  private String function = "";
  String code = null;

  public ServiceTypeAction() {
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
				   code = "4210";        //exception when add a service type
			} 
			else if("UPDATE".equalsIgnoreCase(action)) {
					code = "4220";       //exception when update a service type
			}else if("DELETE".equalsIgnoreCase(action)){
					code = "4230";		 //exception when delete a service type	
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
	
	// retrieve original and new service type
	String service_type = Util.getString(request.getParameter("service_type"));
	String org_service_type = Util.getString(request.getParameter("org_service_type"));
	//Write Business code
	if("ADDNEW".equalsIgnoreCase(action)) {
	   if(isServiceTypeExist(request)) {
	   	// this service type already exists, so don't add again
		code = "4211";
		request.setAttribute("RESULT_CODE",code);
		return null;
	   }
	   dataList.add(insertServiceTypeSql(request));
	} else if("UPDATE".equalsIgnoreCase(action)) {

		// original and new serive type are the same
		if (org_service_type.equals(service_type)) {
			return null;
		} else if (org_service_type.equalsIgnoreCase(service_type)) {
			// case can be changed
		} else {
			if(isServiceTypeExist(request)) {
			 // this service type already exists, so don't update
			 code = "4211";
			 request.setAttribute("RESULT_CODE",code);
			 return null;
			}
		}
		
		if(isUsedInSignature(request, org_service_type)) {
			// this service type has beed used in signature table, so can't update
			code = "4221";
			request.setAttribute("RESULT_CODE", code);
			return null; 
		}
	    dataList.add(updateServiceTypeSql(request));
	} else if("DELETE".equalsIgnoreCase(action)) {
		if(isUsedInSignature(request, service_type)) {
            //this service type has beed used in signature table, so can't delete
			code = "4221";
			request.setAttribute("RESULT_CODE", code);
			return null; 
		}
		dataList.add(deleteServiceTypeSql(request));
	}
	return dataList;
  }

  /**
   * Create insert SERVICE_TYPE table sql
   * @param request (service_new.jsp request)
   * @return ArrayList
   */
  private String insertServiceTypeSql(HttpServletRequest request) {

	StringBuffer service_type_sql = new StringBuffer();
	
	String service_type = Util.getString(request.getParameter("service_type"));

	service_type_sql.append("insert into SERVICE_TYPE (SERVICE) ");
	service_type_sql.append("values ('"+service_type+"')");
	
	return service_type_sql.toString();
  }

  /**
   * Create update SERVICE_TYPE table sql
   * @param request (service_edit.jsp request)
   * @return ArrayList
   */
  private String updateServiceTypeSql(HttpServletRequest request) {
	StringBuffer service_type_sql = new StringBuffer();
	
    //retrieve original and new service type parameter
	String service_type = Util.getString(request.getParameter("service_type"));
	String org_service_type = Util.getString(request.getParameter("org_service_type"));

	service_type_sql.append("update SERVICE_TYPE set SERVICE='"+service_type+"' ");
	service_type_sql.append("where SERVICE='"+org_service_type+"'");
	return service_type_sql.toString();
  }
  
  
  /**
   * Create delete SERVICE_TYPE table sql, added by william.yang
   * @param request (service_edit.jsp request)
   * @return ArrayList
   */
  private String deleteServiceTypeSql(HttpServletRequest request) {
	StringBuffer service_type_sql = new StringBuffer();
	
	String service_type = Util.getString(request.getParameter("service_type"));
    
	service_type_sql.append("delete from SERVICE_TYPE where SERVICE='"+service_type+"'");
	return service_type_sql.toString();
  }
  
  /**
   * check if service type exists
   * @return
   */	
  private boolean isServiceTypeExist(HttpServletRequest request) {
	  StringBuffer sql = new StringBuffer();
		
	  String service_type = Util.getString(request.getParameter("service_type"));
	  
	  sql.append("select SERVICE from SERVICE_TYPE where upper(SERVICE)=upper('"+service_type+"')");
		
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
   * check if this service type has been used in table signature
   * @return
   */	
  private boolean isUsedInSignature(HttpServletRequest request, String service_type) {
	  StringBuffer sql = new StringBuffer();
		
	  sql.append("select SERVICE from SIGNATURE where upper(SERVICE)=upper('"+service_type+"')");
		
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
