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

import java.text.ParseException;

import org.apache.log4j.Logger;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import com.titan.util.Keys;
import com.titan.util.Util;
import com.titan.util.Configure;

public class ScheduleJobManager {
	
	static Logger logger = Logger.getLogger(ScheduleJobManager.class);
	
	static Scheduler scheduler = null;
	
	public static void start(){
        // Use the factory to create a Scheduler instance
        try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
		} catch (SchedulerException e1) {
			logger.error("start scheduler error");
		}
        
        JobDetail jobDetail;
        CronTrigger ctrigger;
        String cronExpression = ""; 
        
        Class aclass;
        String JobName;
        
        //SignatureHandlerJob
        aclass = SignatureHandlerJob.class;
        JobName = "SignatureHandlerJob";
        jobDetail = new JobDetail(aclass.getName(), Scheduler.DEFAULT_GROUP, aclass);
        ctrigger = new CronTrigger();
        try {
        	cronExpression = Util.getString(Configure.CONFIGURE.get("SignatureHandlerJob_Cron"));
            ctrigger.setCronExpression(cronExpression);
            ctrigger.setName(JobName+"Trigger");
        } catch (ParseException e) {
        	logger.error("Error when parsing CronExpression",e);
        }       
        try {
			scheduler.scheduleJob(jobDetail, ctrigger);
			logger.info("start scheduler "+aclass.getName()+"......"+cronExpression);
		} catch (SchedulerException e) {
			logger.error("start scheduler"+aclass.getName()+" error",e);
		}
        
        //LogArrangeJob
        aclass = LogArrangeJob.class;
        JobName = "LogArrangeJob";
        jobDetail = new JobDetail(aclass.getName(), Scheduler.DEFAULT_GROUP, aclass);
        ctrigger = new CronTrigger();
        try {
        	cronExpression = Util.getString(Configure.CONFIGURE.get("LogArrangeJob_Cron"));
            ctrigger.setCronExpression(cronExpression);
            ctrigger.setName(JobName+"Trigger");
        } catch (ParseException e) {
        	logger.error("Error when parsing CronExpression",e);
        }       
        try {
			scheduler.scheduleJob(jobDetail, ctrigger);
			logger.info("start scheduler "+aclass.getName()+"......"+cronExpression);
		} catch (SchedulerException e) {
			logger.error("start scheduler"+aclass.getName()+" error",e);
		}   
        
        //LogSaveJob
        aclass = LogSaveJob.class;
        JobName = "LogSaveJob";
        jobDetail = new JobDetail(aclass.getName(), Scheduler.DEFAULT_GROUP, aclass);
        ctrigger = new CronTrigger();
        try {
        	cronExpression = Util.getString(Configure.CONFIGURE.get("LogSaveJob_Cron"));
            ctrigger.setCronExpression(cronExpression);
            ctrigger.setName(JobName+"Trigger");
        } catch (ParseException e) {
        	logger.error("Error when parsing CronExpression",e);
        }       
        try {
			scheduler.scheduleJob(jobDetail, ctrigger);
			logger.info("start scheduler "+aclass.getName()+"......"+cronExpression);
		} catch (SchedulerException e) {
			logger.error("start scheduler"+aclass.getName()+" error",e);
		}  
        
        //TokenTimeCheckJob
        aclass = TokenTimeCheckJob.class;
        JobName = "TokenTimeCheckJob";
        jobDetail = new JobDetail(aclass.getName(), Scheduler.DEFAULT_GROUP, aclass);
        ctrigger = new CronTrigger();
        try {
        	cronExpression = Util.getString(Configure.CONFIGURE.get("TokenTimeCheckJob_Cron"));
            ctrigger.setCronExpression(cronExpression);
            ctrigger.setName(JobName+"Trigger");
        } catch (ParseException e) {
        	logger.error("Error when parsing CronExpression",e);
        }       
        try {
			scheduler.scheduleJob(jobDetail, ctrigger);
			logger.info("start scheduler "+aclass.getName()+"......"+cronExpression);
		} catch (SchedulerException e) {
			logger.error("start scheduler"+aclass.getName()+" error",e);
		}       
        
        // Start the Scheduler running
        try {
			scheduler.start();
		} catch (SchedulerException e) {
			logger.error("start scheduler error",e);
		}		
 
	}
	
	public static void stop() throws SchedulerException{
		scheduler.shutdown();
	}

}
