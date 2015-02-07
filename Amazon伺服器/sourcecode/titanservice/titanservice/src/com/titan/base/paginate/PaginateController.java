package com.titan.base.paginate;

import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.base.util.Util;

public class PaginateController {
	
	private static Logger logger = Logger.getLogger(PaginateController.class);
	
	public final static String paginatedDataListName = "paginatedDataList"; 
	
	private HttpServletRequest request;
	private HttpServletResponse response;
	private String sql;
	private int cacheSize = 200;
	private int pagesize = 20;
	
	private boolean isEmpty = false;
	
	public PaginateController(HttpServletRequest request, HttpServletResponse response, String sql){
		this.request = request;
		this.response = response;
		this.sql =sql;
	}	
	
	public int getCacheSize() {
		return cacheSize;
	}

	public void setCacheSize(int cacheSize) {
		this.cacheSize = cacheSize;
	}	

	public int getPagesize() {
		return pagesize;
	}

	public void setPagesize(int pagesize) {
		this.pagesize = pagesize;
	}

	public String getSql() {
		return sql;
	}

	public void setSql(String sql) {
		this.sql = sql;
	}	
	
	public boolean isEmpty() {
		return isEmpty;
	}

	public void setEmpty(boolean isEmpty) {
		this.isEmpty = isEmpty;
	}

	public void handle() throws SQLException{
		PaginatedListHelper helper = new PaginatedListHelper();
		int pagesize = Util.getInteger(request.getParameter("pagesize"), this.pagesize);
		int page = Util.getInteger(request.getParameter("page"), 1);
		helper.setPageNumber(page);
		helper.setObjectsPerPage(pagesize);
		
		logger.debug(request.getSession().getAttribute("pagesize"));
		logger.debug(request.getAttributeNames());
		
		logger.debug("page:"+page
				+" pagesize:"+pagesize
				+" request.getParameter(pagesize):"+request.getParameter("pagesize"));
		
		if(page==1){
			request.getSession().removeAttribute("cacheddatalist");
		}
		CachedDataList cacheddatalist = (CachedDataList)request.getSession().getAttribute("cacheddatalist");
		if(cacheddatalist==null){
			cacheddatalist = new CachedDataList(this.sql, this.cacheSize);
		}
		
		helper.setFullListSize(cacheddatalist.getTotalSize());
		
		logger.debug("cacheddatalist.getTotalSize():"+cacheddatalist.getTotalSize());
		
		this.setEmpty(cacheddatalist.getTotalSize()==0);
		
		List list1 = cacheddatalist.getListForPage(page, pagesize);
		helper.setList(list1);
		
		request.getSession().setAttribute("cacheddatalist", cacheddatalist);
		
		request.setAttribute(paginatedDataListName, helper);
	}

}
