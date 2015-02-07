package com.titan.controller;

import com.titan.controller.exception.ActionException;
import javax.servlet.http.HttpServletRequest;


public interface ActionInterface extends ServletContextInterface
{
   public void init()throws ActionException;
   public String process(HttpServletRequest request)throws ActionException;
}

