/*
 * Created on 2012-6-6
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
package com.titan.updserver.log;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.thread.LogSaveThread;


public class LogBuffer {
	
	private final static int MAX_THREAD_NUMBER = 5;
	
	private final static int MAX_LOG_QUANTITY = 50;
	
	private static ExecutorService threadpool = Executors.newFixedThreadPool(MAX_THREAD_NUMBER);
	
	static List<LogBean> systemLogs = new ArrayList<LogBean>();
	static List<LogBean> requestLogs = new ArrayList<LogBean>();
	static List<LogBean> downloadLogs = new ArrayList<LogBean>();
	
	public static void addLog(LogBean log){
		if(log!=null){
			if(log.isRequestLog()){
				requestLogs.add(log);
				if(requestLogs.size()>=MAX_LOG_QUANTITY){
					saveRequestLogs();
				}
			}else if(log.isDownloadLog()){
				downloadLogs.add(log);
				if(downloadLogs.size()>=MAX_LOG_QUANTITY){
					saveDownloadLogs();
				}
			}else if(log.isSystemLog()){
				systemLogs.add(log);
				if(systemLogs.size()>=MAX_LOG_QUANTITY){
					saveSystemLogs();
				}
			}
		}
	}
	
	public static void saveAll(){
		saveRequestLogs();
		saveDownloadLogs();
		saveSystemLogs();
	}
	
	public static void saveRequestLogs(){
		if(requestLogs.size()>1){
			List<LogBean> logs = new ArrayList<LogBean>();
			logs.addAll(requestLogs);
			requestLogs.clear();
			LogSaveThread thread = new LogSaveThread(logs);
			threadpool.execute(thread);
		}		
	}
	
	public static void saveDownloadLogs(){
		if(downloadLogs.size()>1){
			List<LogBean> logs = new ArrayList<LogBean>();
			logs.addAll(downloadLogs);
			downloadLogs.clear();
			LogSaveThread thread = new LogSaveThread(logs);
			threadpool.execute(thread);
		}		
	}
	
	public static void saveSystemLogs(){
		if(systemLogs.size()>1){
			List<LogBean> logs = new ArrayList<LogBean>();
			logs.addAll(systemLogs);
			systemLogs.clear();
			LogSaveThread thread = new LogSaveThread(logs);
			threadpool.execute(thread);
		}		
	}

}
