package com.titan.base.schedulejob;

import java.text.ParseException;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import com.titan.base.configure.Configure;

public class ScheduleJobManager {
	
	static Logger logger = Logger.getLogger(ScheduleJobManager.class);
	
	static Scheduler scheduler = null;
	
	public static void start() throws SchedulerException{
        // Use the factory to create a Scheduler instance
        scheduler = StdSchedulerFactory.getDefaultScheduler();
        
        JobDetail jobDetail;
        CronTrigger ctrigger;
        String cronExpression = "";  
        
        Properties configure = Configure.jobConfigure;
        
        Class aclass;
        String JobName;
		
		//check service status
        aclass = ServiceStatusJob.class;
        JobName = "ServiceStatusJob";
        jobDetail = new JobDetail(aclass.getName(), Scheduler.DEFAULT_GROUP, aclass);
        ctrigger = new CronTrigger();
        try {
        	cronExpression = configure.getProperty("ServiceStatusJob");
            ctrigger.setCronExpression(cronExpression);
            ctrigger.setName(JobName+"Trigger");
        } catch (ParseException e) {
        	logger.error("Error when parsing CronExpression",e);
        }       
        try {
			scheduler.scheduleJob(jobDetail, ctrigger);
			logger.info("start scheduler "+aclass.getName()+"......"+cronExpression);
		} catch (SchedulerException e1) {
			logger.error("start scheduler"+aclass.getName()+" error",e1);
		}
		
		//check account activate in 7 days
		aclass = AccountCheckJob.class;
        JobName = "AccountCheckJob";
        jobDetail = new JobDetail(aclass.getName(), Scheduler.DEFAULT_GROUP, aclass);
        ctrigger = new CronTrigger();
        try {
        	cronExpression = configure.getProperty("AccountJob");
            ctrigger.setCronExpression(cronExpression);
            ctrigger.setName(JobName+"Trigger");
        } catch (ParseException e) {
        	logger.error("Error when parsing CronExpression",e);
        }       
        try {
			scheduler.scheduleJob(jobDetail, ctrigger);
			logger.info("start scheduler "+aclass.getName()+"......"+cronExpression);
		} catch (SchedulerException e1) {
			logger.error("start scheduler"+aclass.getName()+" error",e1);
		}

        // Start the Scheduler running
        scheduler.start();		
 
	}
	
	public static void stop() throws SchedulerException{
		scheduler.shutdown();
	}

}
