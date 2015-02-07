package com.titan.schedulejob;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.titan.updserver.common.token.TokenPool;

public class TokenTimeCheckJob implements Job {
	
	static Logger logger = Logger.getLogger(TokenTimeCheckJob.class);
	
	public TokenTimeCheckJob(){	
	}
	
	private int run(){
		return TokenPool.getInstance().check();
	}

	/* (non-Javadoc)
	 * @see org.quartz.Job#execute(org.quartz.JobExecutionContext)
	 */
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		
		logger.debug("Scheduler: " + this.getClass().getName()
				+ " run......");
		int count = this.run();
		logger.debug("Scheduler: " + this.getClass().getName()
				+ " complete......[Clear Token]: "+count);
		
		
	}
}