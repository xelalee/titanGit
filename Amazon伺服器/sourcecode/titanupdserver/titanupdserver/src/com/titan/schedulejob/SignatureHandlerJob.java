/*
 * Created on 2012-5-28
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

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.titan.util.Configure;

public class SignatureHandlerJob extends Thread implements Job {
	
	static Logger logger = Logger.getLogger(SignatureHandlerJob.class);
	
	private static boolean newItemAddedWhenRunning = false;
	
	private static boolean running = false;
	
	public static boolean isRunning(){
		return running;
	}

	@Override
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		if(running){
			logger.debug("thread running, skip this round...");
			return;
		}
		this.run();
	}
	
	public synchronized void run(){
		logger.info("SignatureHandlerJob schedule running...");
		try{
			running = true;
			newItemAddedWhenRunning = false;
			this.handleSignature();				
		}catch(Exception ex){
			logger.error("", ex);
		}finally{
			running = false;
		}
		
		logger.info("Signature handle complete...");
		
		if(newItemAddedWhenRunning){
			this.run();
		}
	}
	
	private void handleSignature(){
		
	}
	
	public static void startJob(){
		if(running){
			newItemAddedWhenRunning = true;
			logger.debug("thread running, open flag newItemAddedWhenRunning");
			return;
		}
		SignatureHandlerJob job = new SignatureHandlerJob();
		job.start();
	}

}
