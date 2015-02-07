package com.titan.schedulejob;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.titan.updserver.log.LogBuffer;

public class LogSaveJob implements Job {
	
	static Logger logger = Logger.getLogger(LogSaveJob.class);

	/* (non-Javadoc)
	 * @see org.quartz.Job#execute(org.quartz.JobExecutionContext)
	 */
	@Override
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		int count = 0;
		logger.info("Scheduler: " + this.getClass().getName()
				+ " run......");
		LogBuffer.saveAll();
		logger.info("Scheduler: " + this.getClass().getName()
				+ " complete......handle "+count+" logs");
	}

}
