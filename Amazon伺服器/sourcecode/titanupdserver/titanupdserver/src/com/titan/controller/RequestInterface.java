package com.titan.controller;

import javax.servlet.http.HttpServletRequest;
import com.titan.controller.exception.RequestException;


public interface RequestInterface
    extends ServletContextInterface {
  /**
   * find the action class by user' action name and process the reqeust
   * @param request HttpServletRequest
   * @return the result
   * @throws FrameworkException
   */
  public String doProcess(HttpServletRequest request) throws RequestException ;

}