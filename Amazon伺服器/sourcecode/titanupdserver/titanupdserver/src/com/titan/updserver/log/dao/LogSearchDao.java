package com.titan.updserver.log.dao;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import com.titan.jdbc.DAOHelper;
import com.titan.updserver.log.bean.DownloadLogBean;
import com.titan.updserver.log.bean.LogBean;
import com.titan.updserver.log.bean.RequestLogBean;
import com.titan.updserver.log.bean.SystemLogBean;
import com.titan.util.Util;

public class LogSearchDao {
	
	public List<LogBean> query(String cat, String region, String type, long start, long end, String keyword){
		List<LogBean> list = new ArrayList<LogBean>();
		
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" select * from "+this.getTableName(cat));
		buffer.append(" where 1=1");
		buffer.append(this.getConditionClause(cat, region, type, start, end, keyword));
		buffer.append(" order by LOGID desc");
		buffer.append(" limit 0,500");
		
		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(buffer.toString());
		
		LogBean bean = null;
		for(HashMap<String, Object> hm : col){
			if(cat.equalsIgnoreCase(RequestLogBean.CAT)){
				bean = new RequestLogBean(hm);
			}else if(cat.equalsIgnoreCase(DownloadLogBean.CAT)){
				bean = new DownloadLogBean(hm);
			}else if(cat.equalsIgnoreCase(SystemLogBean.CAT)){
				bean = new SystemLogBean(hm);
			}			
			list.add(bean);
		}
		return list;
	}
	
	public int getAmount(String cat, String region, String type, long start, long end, String keyword){
		int rst = 0;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" select count(*) NUM from "+this.getTableName(cat));
		buffer.append(" where 1=1");
		buffer.append(this.getConditionClause(cat, region, type, start, end, keyword));	
		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(buffer.toString());
		for(HashMap<String, Object> hm : col){
			rst = Util.getInteger(hm.get("NUM"));
		}
		return rst;
	}
	
	private String getConditionClause(String cat, String region, String type,
			long start, long end, String keyword){
		StringBuffer buffer = new StringBuffer();
		if(!region.equals("")){
			buffer.append(" and REGION='"+region+"'");
		}
		if(start>0){
			buffer.append(" and LOGTIME>="+start);
		}
		if(end>0){
			buffer.append(" and LOGTIME<="+end);
		}
		if(!type.equals("")){
			buffer.append(" and TYPE='"+type+"'");
		}
		if(!keyword.equals("")){
			if(cat.equalsIgnoreCase(RequestLogBean.CAT)){
				buffer.append(" and (MAC like '%"+keyword+"%' or SRCIP like '%"+keyword+"%')");
			}else if(cat.equalsIgnoreCase(DownloadLogBean.CAT)){
				buffer.append(" and (MAC like '%"+keyword+"%' or SRCIP like '%"+keyword+"%')");
			}else if(cat.equalsIgnoreCase(SystemLogBean.CAT)){
				buffer.append(" and MESSAGE like '%"+keyword+"%'");
			}
		}
		return buffer.toString();
	}
	
	private String getTableName(String cat){
		String tableName = "";
		if(cat.equalsIgnoreCase(RequestLogBean.CAT)){
			tableName = "C_REQUEST_LOG";
		}else if(cat.equalsIgnoreCase(DownloadLogBean.CAT)){
			tableName = "C_DOWNLOAD_LOG";
		}else if(cat.equalsIgnoreCase(SystemLogBean.CAT)){
			tableName = "C_SYSTEM_LOG";
		}
		return tableName;
	}

}
