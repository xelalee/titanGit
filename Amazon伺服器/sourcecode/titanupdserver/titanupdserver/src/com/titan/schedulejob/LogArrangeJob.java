package com.titan.schedulejob;

import java.sql.SQLException;
import java.util.Calendar;

import com.titan.updserver.log.dao.DownloadLogDao;
import com.titan.updserver.log.dao.SystemLogDao;
import com.titan.updserver.log.dao.RequestLogDao;
import com.titan.updserver.log.dao.LogDao;
import com.titan.util.Configure;
import com.titan.util.Util;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class LogArrangeJob implements Job {
	
	static Logger logger = Logger.getLogger(LogArrangeJob.class);
	
	public LogArrangeJob(){	
	}
	
	public void run(){
		
		int days = Util.getInteger(Configure.CONFIGURE.get("LOG_RESERVE_DURATION"), 90);
		
		long timeMillis = this.getTimeMillis(days);
		
		try {
			LogDao dao = new DownloadLogDao();
			int effects = dao.deleteLogsBeforeTimeMillis(timeMillis);
			logger.info("remove download log "+effects);
		} catch (SQLException e) {
			logger.error("", e);
		}
		
		try {
			LogDao dao = new SystemLogDao();
			int effects = dao.deleteLogsBeforeTimeMillis(timeMillis);
			logger.info("remove system log "+effects);
		} catch (SQLException e) {
			logger.error("", e);
		}
		
		try {
			LogDao dao = new RequestLogDao();
			int effects = dao.deleteLogsBeforeTimeMillis(timeMillis);
			logger.info("remove request log "+effects);
		} catch (SQLException e) {
			logger.error("", e);
		}
		
	}
	
	/**
	 * get time millis before <reserveDuration> days
	 * @param reserveDuration
	 * @return
	 */
	protected long getTimeMillis(int reserveDuration){
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DAY_OF_MONTH, 0-reserveDuration);
		return cal.getTimeInMillis();
	}	

	/* (non-Javadoc)
	 * @see org.quartz.Job#execute(org.quartz.JobExecutionContext)
	 */
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		
		logger.info("Scheduler: " + this.getClass().getName()
				+ " run......");
		this.run();
		logger.info("Scheduler: " + this.getClass().getName()
				+ " complete......");
		
		
	}
}