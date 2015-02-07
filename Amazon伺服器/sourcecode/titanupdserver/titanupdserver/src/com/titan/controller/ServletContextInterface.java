package com.titan.controller;

import java.io.Serializable;
import javax.servlet.ServletContext;

public interface ServletContextInterface extends Serializable
{
   public void setServletContext(ServletContext context);
}