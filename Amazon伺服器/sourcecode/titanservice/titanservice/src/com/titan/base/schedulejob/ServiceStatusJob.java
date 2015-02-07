package com.titan.base.schedulejob;

import java.sql.SQLException;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.titan.base.service.dao.MyServiceDAO;


public class ServiceStatusJob implements Job{
	private static Logger logger = Logger.getLogger(ServiceStatusJob.class);
	
    public ServiceStatusJob() {
    }
	
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
	       
		logger.info("Scheduler: "+this.getClass().getName()+" run......");

		int effects = 0;
		try {
			effects = MyServiceDAO.getInstance().arrangeServiceStatus();
		} catch (SQLException e) {
			logger.error("arrange service status fail");
		}
		   
		logger.info("Scheduler: "+this.getClass().getName()+" complete......[effects]: "+effects);
	}

}
