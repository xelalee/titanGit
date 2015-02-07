
package com.titan.base.paginate;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import org.apache.log4j.Logger;

import com.titan.base.jdbc.DAOHelper;
import com.titan.base.util.Util;


public class CachedDataList{
	
	private static Logger logger = Logger.getLogger(CachedDataList.class);
	
	private static int defaultCacheSize = 200;
	
	private String sql = "";
	
	private List cacheList;
	private int cacheSize = defaultCacheSize;
	private int cacheStartIndex = 1;
	private int cacheEndIndex = 0;
	
	private int totalSize = 0;
	
	public CachedDataList(String sql) throws SQLException{
		this(sql,defaultCacheSize);
	}
	
	public CachedDataList(String sql, int cacheSize) throws SQLException{
		this.sql = sql;
		this.cacheSize = cacheSize;
		this.totalSize = this.getTotalCount();
		this.cacheStartIndex = 1;
		
		if(totalSize>=cacheSize){
			this.cacheEndIndex = cacheSize;
		}else{
			this.cacheEndIndex = this.totalSize;
		}
		logger.debug(this.sql+" this.totalSize:"+this.totalSize);
		this.refreshCacheListFromDB(this.cacheStartIndex, this.cacheEndIndex);
	}
	
    public List getCacheList() {
		return cacheList;
	}

	public void setCacheList(List cacheList) {
		this.cacheList = cacheList;
	}

	public int getCacheSize() {
		return cacheSize;
	}

	public void setCacheSize(int cacheSize) {
		this.cacheSize = cacheSize;
	}

	public int getCacheStartIndex() {
		return cacheStartIndex;
	}

	public void setCacheStartIndex(int cacheStartIndex) {
		this.cacheStartIndex = cacheStartIndex;
	}

	public int getCacheEndIndex() {
		return cacheEndIndex;
	}

	public void setCacheEndIndex(int cacheEndIndex) {
		this.cacheEndIndex = cacheEndIndex;
	}

	public int getTotalSize() {
		return totalSize;
	}

	public void setTotalSize(int totalSize) {
		this.totalSize = totalSize;
	}

	public String getSql() {
		return sql;
	}

	public void setSql(String sql) {
		this.sql = sql;
	}
	
	public List getListForPage(int page, int pagesize) throws SQLException{
		
		logger.debug("cacheSize:"+cacheSize+" totalSize:"+totalSize);
		
		List list = new ArrayList();
		
		int fromIndex = pagesize * (page-1) + 1;
		int toIndex = fromIndex + pagesize -1;
		
		if(!(fromIndex>=this.cacheStartIndex && toIndex<=this.cacheEndIndex)){
			this.cacheStartIndex = (fromIndex / this.cacheSize) * this.cacheSize + 1;
			this.cacheEndIndex = this.cacheStartIndex + this.cacheSize -1;
			
			if(this.cacheEndIndex>this.totalSize){
				this.cacheEndIndex = this.totalSize;
			}
			this.refreshCacheListFromDB(this.cacheStartIndex, this.cacheEndIndex);
		}
		logger.debug("this.cacheStartIndex:"+this.cacheStartIndex+" this.cacheEndIndex:"+this.cacheEndIndex);
		list = this.getSubListFromCache(fromIndex, toIndex);
		
		return list;
	}

	/**
	 * get total amount in db
	 * @return
	 * @throws SQLException
	 */
	private int getTotalCount() throws SQLException{
    	StringBuffer buffer = new StringBuffer();
    	buffer.append(" SELECT count(*) TOTAL FROM ");
    	buffer.append(" (");
    	buffer.append(this.sql);
    	buffer.append(" ) aaa");
    	Collection col = DAOHelper.getInstance().query(buffer.toString());
    	
    	HashMap hm = (HashMap) col.iterator().next();
    	return Util.getInteger(hm.get("TOTAL"));
    }
	
	/**
	 * refresh cache list from db
	 * @param fromIndex
	 * @param toIndex
	 * @throws SQLException
	 */
	private void refreshCacheListFromDB(int fromIndex, int toIndex) throws SQLException{
    	StringBuffer buffer = new StringBuffer();
    	buffer.append(" SELECT aaa.* FROM");
    	buffer.append(" (");
    	
    	buffer.append(this.sql);
    	
    	buffer.append(" ) aaa");
    	buffer.append(" LIMIT "+(fromIndex-1)+", "+(toIndex-fromIndex+1)); 

    	Collection col = DAOHelper.getInstance().query(buffer.toString());	
    	this.setCacheList((List)col);
    	this.cacheStartIndex = fromIndex;
    	this.cacheEndIndex = toIndex;
	}
	
	/**
	 * get sub list from cached list
	 * @param fromIndex
	 * @param toIndex
	 * @return
	 */
	private List getSubListFromCache(int fromIndex, int toIndex){
		int fromIndex1 = fromIndex;
		int toIndex1 = toIndex;
		if(toIndex>this.totalSize){
			toIndex1 = this.totalSize;
		}
		logger.debug("fromIndex1:"+fromIndex1+" toIndex1:"+toIndex1);
		if(fromIndex>this.cacheSize){
			fromIndex1 = fromIndex1 % this.cacheSize;
			toIndex1 = (toIndex1-1) % this.cacheSize +1;
		}
		logger.debug("fromIndex1:"+fromIndex1+" toIndex1:"+toIndex1);

		return (List)this.cacheList.subList(fromIndex1-1, toIndex1);
	}
	
}
