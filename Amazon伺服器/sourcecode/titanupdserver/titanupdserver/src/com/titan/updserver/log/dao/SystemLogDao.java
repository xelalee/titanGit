/*
 * Created on 2012-6-5
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
package com.titan.updserver.log.dao;

import java.sql.SQLException;
import java.util.List;

import com.titan.jdbc.DAOHelper;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.SystemLogBean;

public class SystemLogDao extends LogDao {

	private static final String SQL = "INSERT INTO C_SYSTEM_LOG(LOGTIME,REGION,SERVER,MESSAGE) VALUES";
	
	@Override
	public String getSQL(List<LogBean> list){
		StringBuffer buffer = new StringBuffer(25600);
		for(LogBean logBean: list){
			SystemLogBean bean = (SystemLogBean)logBean;
			buffer.append(",(");
			
			buffer.append(bean.getLogtime()+",'");
			buffer.append(bean.getRegion()+"','");
			buffer.append(bean.getServer()+"','");
			buffer.append(bean.getMessageLimit100()+"'");
			
			buffer.append(")");
		}
		return SQL + buffer.substring(1);
	}

	/* (non-Javadoc)
	 * @see com.titan.updserver.log.dao.LogDao#deleteLogs(int)
	 */
	@Override
	public int deleteLogsBeforeTimeMillis(long timeMillis) throws SQLException {
		StringBuffer buffer = new StringBuffer();
		buffer.append("delete from C_SYSTEM_LOG where LOGTIME < "+timeMillis);
		return DAOHelper.executeSQL(buffer.toString());
	}

}
