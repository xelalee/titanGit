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
package com.titan.updserver.log.thread;

import java.sql.SQLException;
import java.util.List;

import org.apache.log4j.Logger;

import com.titan.updserver.log.bean.DownloadLogBean;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.RequestLogBean;
import com.titan.updserver.log.bean.SystemLogBean;
import com.titan.updserver.log.dao.DownloadLogDao;
import com.titan.updserver.log.dao.LogDao;
import com.titan.updserver.log.dao.RequestLogDao;
import com.titan.updserver.log.dao.SystemLogDao;

public class LogSaveThread extends Thread {
	static Logger logger = Logger.getLogger(LogSaveThread.class);
	
	private static long threadSequence = 0;
	
	private List<LogBean> logList;
	private long threadId = 0;
	
	public LogSaveThread(List<LogBean> logList){
		this.logList = logList;
		this.threadId = (threadSequence++);
	}
	
	public void run(){
		logger.debug("LogSaveThread "+this.threadId+" run...");
		long t1 = System.currentTimeMillis();
		
		if(this.logList==null && this.logList.size()==0){
			return;
		}
		
		String cat = this.logList.get(0).getCat();
		
		LogDao dao = null;
		
		if(cat.equalsIgnoreCase(RequestLogBean.CAT)){
			dao = new RequestLogDao();
		}else if(cat.equalsIgnoreCase(DownloadLogBean.CAT)){
			dao = new DownloadLogDao();
		}else if(cat.equalsIgnoreCase(SystemLogBean.CAT)){
			dao = new SystemLogDao();
		}
		int effects = 0;
		try {
			effects = dao.save(this.logList);
		} catch (SQLException e) {
			logger.error("", e);
		}
		
		long t2 = System.currentTimeMillis();
		logger.debug("LogSaveThread "+this.threadId+" complete... cat: "+cat+", save log "+effects+", time cost "+ (t2-t1));
	}

}
