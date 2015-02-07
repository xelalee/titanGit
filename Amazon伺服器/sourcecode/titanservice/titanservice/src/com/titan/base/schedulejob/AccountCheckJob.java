package com.titan.base.schedulejob;

import java.sql.SQLException;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.titan.base.account.dao.AccountDAO;

public class AccountCheckJob implements Job {
	private static Logger logger = Logger.getLogger(ServiceStatusJob.class);
	
    public AccountCheckJob() {
    }
	
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		logger.info("Scheduler: "+this.getClass().getName()+" run......");

		int effects = 0;
		try {
			effects = AccountDAO.getInstance().clearActivationExpired();
		} catch (SQLException e) {
			logger.error("clear activation expired fail");
		}
		   
		logger.info("Scheduler: "+this.getClass().getName()+" complete......[effects]: "+effects);
	}

}
