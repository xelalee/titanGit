package com.titan.controller;

//import java.io.Serializable;

import javax.servlet.ServletContext;

public interface ScheduleManageInterface extends ServletContextInterface
{
   public void setServletContext(ServletContext context);
	public void runSchedule();
}