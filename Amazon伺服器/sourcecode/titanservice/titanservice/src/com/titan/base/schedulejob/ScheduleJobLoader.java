package com.titan.base.schedulejob;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.Logger;
import org.quartz.SchedulerException;

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
