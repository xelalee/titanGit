/*
 * Created on 2012-9-29
 *
 * COPYRIGHT (C) 2012, Titan Corporation   Co., Ltd                  
 * Protected as an unpublished work. All Rights Reserved.
 * Titan PROPRIETARY/CONFIDENTIAL.                                               
 *                                  
 * The computer program listings, specifications, and 
 * documentation herein are the property of Titan 
 * Corporation and shall not be reproduced, copied, 
 * disclosed, or used in whole or in part for any reason 
 * without the prior express written permission of     
 * Titan Corporation.  
 */
package com.titan.schedulejob;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.Logger;
import org.quartz.SchedulerException;

import com.titan.util.Keys;

public class ScheduleJobLoader implements ServletContextListener {
	
	static Logger logger = Logger.getLogger(ScheduleJobLoader.class);

	/* (non-Javadoc)
	 * @see javax.servlet.ServletContextListener#contextDestroyed(javax.servlet.ServletContextEvent)
	 */
	public void contextDestroyed(ServletContextEvent arg0) {
		try {
			logger.info("Scheculer stoping......");
			ScheduleJobManager.stop();
		} catch (SchedulerException e) {
			logger.error("Scheduler stop error",e);
		}

	}

	/* (non-Javadoc)
	 * @see javax.servlet.ServletContextListener#contextInitialized(javax.servlet.ServletContextEvent)
	 */
	public void contextInitialized(ServletContextEvent arg0) {
		//do nothing
	}

}
