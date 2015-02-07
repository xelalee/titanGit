package com.titan.updserver.login.action;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import java.util.*;
import com.titan.controller.manage.ActionManagement;
import com.titan.controller.exception.ActionException;
import com.titan.util.Keys;
import com.titan.util.Util;

import com.titan.updserver.common.logformat.CommonLogFormatter;
import com.titan.updserver.login.dao.LoginDao;

public class LoginAction extends ActionManagement{

  /**
   * To execute transaction and return status code
   * @param request
   * @return String
   * @throws ActionException
   */


  private String username="";
  private String password="";

  private String code=null;
  
  static Logger logger = Logger.getLogger(LoginAction.class);

  public String process(HttpServletRequest request) throws ActionException {

    this.username=Util.getString(request.getParameter("USERNAME"));
    this.password=Util.getString(request.getParameter("PASSWORD"));
    
    String ip = request.getRemoteAddr();
    
    CommonLogFormatter lf = new CommonLogFormatter();
    
    HashMap user_info=new HashMap();
    Collection col = new ArrayList();
    try{
        col = LoginDao.getUserInfo_Ex(username);
    }catch(Exception ex){
        request.setAttribute("RESULT_CODE","1000");
        lf.setTitle("Login fail. [USERNAME]:"+username+" [IP]:"+ip);
        lf.setError_Code("1000");
        logger.error(lf.getFormattedLog());
        return "";
    }
    for(Iterator it=col.iterator();it.hasNext();){
    	user_info=(HashMap)it.next();
    }
    if(user_info.size()==0 || user_info==null) code="1001";
    else{
    	//String password0=CodeManager.decode(Util.getString(user_info.get("PASSWORD")));
    	String password0=Util.getString(user_info.get("PASSWORD"));
    	if(!password.equals(password0)) code="1001";
    	else{
    		request.getSession().setAttribute(Keys.USER_INFO,user_info);
    	}
    }
    request.setAttribute("RESULT_CODE",code);
    if(code != null){
        lf.setTitle("Login fail. [USERNAME]:"+username+" [IP]:"+ip);
        lf.setError_Code(code);
        logger.error(lf.getFormattedLog());
    }else{
        lf.setTitle("Login success. [USERNAME]:"+username+" [IP]:"+ip);
        logger.info(lf.getFormattedLog());
    }
    return "";
  }

}
