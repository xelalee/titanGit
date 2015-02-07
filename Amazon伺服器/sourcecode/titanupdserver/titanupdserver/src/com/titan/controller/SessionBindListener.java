package com.titan.controller;

import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.ServletContext;
import java.util.HashMap;
//import com.titan.util.Util;
import java.io.Serializable;
import javax.servlet.http.HttpServletRequest;

public class SessionBindListener implements HttpSessionBindingListener, Serializable {

  String sessionId;
  ServletContext context;
  String userName;
  HttpServletRequest request;

  public SessionBindListener(ServletContext context, String userName, HttpServletRequest request) {
    this.context = context;
    this.userName = userName;
    this.request = request;
  }
  /**
   *
   * @param event (event happening)
   */
  public void valueBound(HttpSessionBindingEvent event) {
  }
  /**
   *
   * @param event (event happening)
   */
  public void valueUnbound(HttpSessionBindingEvent event) {
    HashMap userMap = (HashMap)context.getAttribute("userMap");
    if(userName != null && !userName.equals("")) {
       userMap.remove(userName);
    }
  }

}
