/*
 * Created on 2012-6-7
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
package com.titan.updserver.log.action;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import com.titan.controller.manage.ActionManagement;
import com.titan.updserver.log.bean.DownloadLogBean;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.RequestLogBean;
import com.titan.updserver.log.bean.SystemLogBean;
import com.titan.updserver.log.dao.LogSearchDao;
import com.titan.util.DateUtil;
import com.titan.util.Util;

public class LogSearchAction extends ActionManagement {
	
	static Logger logger = Logger.getLogger(LogSearchAction.class);
	
	public String process(HttpServletRequest request){
		
		String code = null;
		
		String cat = "";
		String type = "";
		
		String category = Util.getString(request.getParameter("Category"));	
		if(category.equalsIgnoreCase("System")){
			cat = SystemLogBean.CAT;
		}else if(category.equalsIgnoreCase("Signature Request")){
			cat = RequestLogBean.CAT;
			type = LogBean.LOG_TYPE_SIGNATURE;
		}else if(category.equalsIgnoreCase("Firmware Request")){
			cat = RequestLogBean.CAT;
			type = LogBean.LOG_TYPE_FIRMWARE;
		}else if(category.equalsIgnoreCase("Signature Download")){
			cat = DownloadLogBean.CAT;
			type = LogBean.LOG_TYPE_SIGNATURE;
		}else if(category.equalsIgnoreCase("Firmware Download")){
			cat = DownloadLogBean.CAT;
			type = LogBean.LOG_TYPE_FIRMWARE;
		}
		
		String region = Util.getString(request.getParameter("Region"));
		
		String startDay = Util.getString(request.getParameter("startDay"));
		int StartTimeHH = Util.getInteger(request.getParameter("StartTimeHH"));
		int StartTimemm = Util.getInteger(request.getParameter("StartTimemm"));
		
		long start = DateUtil.getTime(startDay, StartTimeHH, StartTimemm);
		
		String endDay = Util.getString(request.getParameter("endDay"));
		int EndTimeHH = Util.getInteger(request.getParameter("EndTimeHH"));
		int EndTimemm = Util.getInteger(request.getParameter("EndTimemm"));
		
		long end = DateUtil.getTime(endDay, EndTimeHH, EndTimemm);
		
		String keyword = Util.getString(request.getParameter("keyword"));
		
		logger.debug("cat: "+cat+", region: "+region+", type: "+type+", start: "+start+", end: "+end+", keyword: "+keyword);
		
		LogSearchDao dao = new LogSearchDao();
		List<LogBean> list = dao.query(cat, region, type, start, end, keyword);
		
		int amount = dao.getAmount(cat, region, type, start, end, keyword);
		
		logger.debug("list.size(): "+list.size());
		
		request.setAttribute("RESULT_CODE",code);
		
		request.setAttribute("TOTAL_AMOUNT",amount);
		request.setAttribute("SHOW_AMOUNT",list.size());
		
		request.getSession().setAttribute("LOG_LIST", list);
		
		return "";
		
	}

}
