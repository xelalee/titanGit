package com.titan.controller.manage;

import java.util.HashMap;
import com.titan.controller.ScheduleManageInterface;
import javax.servlet.ServletContext;


public abstract class ScheduleManageImpl implements ScheduleManageInterface
{
   protected ServletContext context;
   protected static HashMap scheduleCollection = new HashMap();
   protected static String scheduleKey = "SCHEDULE_KEY";

   public ScheduleManageImpl()
   {
   }

	public void setServletContext(ServletContext context)
   {
		this.context = context;
   }
}