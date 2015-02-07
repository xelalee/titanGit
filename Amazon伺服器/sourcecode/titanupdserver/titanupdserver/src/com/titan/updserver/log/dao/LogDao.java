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
import java.util.Calendar;
import java.util.List;

import com.titan.jdbc.DAOHelper;
import com.titan.updserver.log.bean.LogBean;

public abstract class LogDao {
	
	public static final int STEP_UNIT = 100;
	
	public int save(List<LogBean> list) throws SQLException{
		if(list==null || list.size()==0){
			return 0;
		}
		int effects = 0;
		int total = list.size();
		int steps = this.calculateSteps(total);
		for(int step=0;step<steps;step++){
			int fromIndex = step * STEP_UNIT;
			int toIndex = fromIndex + STEP_UNIT;
			if(step == steps-1){
				toIndex = total;
			}
			String sql = this.getSQL(list.subList(fromIndex, toIndex));
			effects = effects + DAOHelper.executeSQL(sql);
		}
		return effects;
	}
	
	public abstract String getSQL(List<LogBean> list);
	
	protected int calculateSteps(int total){
		int steps = total / STEP_UNIT;
		int remain = total % STEP_UNIT;
		if(remain>0){
			steps++;
		}
		return steps;
	}
	
	public abstract int deleteLogsBeforeTimeMillis(long timeMillis) throws SQLException;

}
