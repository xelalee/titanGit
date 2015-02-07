package com.titan.controller;

//import java.io.Serializable;
import javax.servlet.http.HttpServletRequest;

import com.titan.controller.exception.FlowManageException;

public interface FlowInterface
    extends ServletContextInterface {
  /**
   * Return the next page according the user's aciton key and result.
   * If the result is null, the default page will be return, but the page must
   * be contained full path.
   *
   * @param request
   * @return The next page
   * @throws FrameworkException
   */
  public String getNextView(HttpServletRequest request) throws
      FlowManageException;
}
