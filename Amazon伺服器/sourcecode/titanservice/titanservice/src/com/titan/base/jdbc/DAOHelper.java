package com.titan.base.jdbc;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Iterator;
import java.util.Collection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSetMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.apache.log4j.Logger;

import com.titan.base.jdbc.connection.*;
import com.titan.base.util.Util;

public class DAOHelper{
	
    private static final Logger logger = Logger.getLogger(DAOHelper.class);
    
    private ConnectionManager connManager = null;
    
    private static DAOHelper helper = new DAOHelper(ConnectionManagerFactory.getConnManager());
    
    /**
     * get DAOHelper instance for mytitan
     * @return
     */
    public static DAOHelper getInstance(){
    	if(helper == null){
    		helper = new DAOHelper(ConnectionManagerFactory.getConnManager());
    	}
    	return helper;
    }

    public DAOHelper(ConnectionManager connManager){
    	this.connManager = connManager;
    }
    
    public int executeSQLQuietly(String sql){
    	int rst = 0;
    	try {
			rst = this.executeSQL(sql);
		} catch (SQLException e) {
			//do nothing
		}
    	return rst;
    }
	
	/**
	 * use this method to run a single sql clause
	 * @param sql
	 * @return
	 * @throws SQLException
	 */
	public int executeSQL(String sql) throws SQLException {
		int rst = 0;
		Connection conn = null;
		Statement st = null;
		try{
			conn = connManager.getConnection();
			conn.setAutoCommit(false);
			st = conn.createStatement();
			rst = st.executeUpdate(sql);
			conn.commit();
			logger.debug("executeSQL: "+sql);
		}catch(SQLException ex){
			if(conn!=null){
				try{
					conn.rollback();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			logger.error("executeSQL(String sql) errr, [SQL]:"+sql, ex);
			throw ex;
		}finally{
			if(st!=null){
				try{
					st.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			if(conn!=null){
				try{
					conn.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
		}
		return rst;
	}
	
	/**
	 * use this method to run multiple sql clauses
	 * @param sqls
	 * @return
	 * @throws SQLException
	 */
	public int executeSQL(List<String> sqls) throws SQLException {
		int rst = 0;
		Connection conn = null;
		Statement st = null;
		String sql = "";
		try{
			conn = connManager.getConnection();
			conn.setAutoCommit(false);
			st = conn.createStatement();
			for(Iterator<String> it=sqls.iterator();it.hasNext();){
				sql = it.next();
				int effects = st.executeUpdate(sql);			
				rst += effects;
				logger.debug("executeSQL: "+sql+", effects: "+effects);
			}
			conn.commit();
		}catch(SQLException ex){
			if(conn!=null){
				try{
					conn.rollback();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			logger.error("executeSQL(List) errr, [SQL]:"+sql, ex);
			throw ex;
		}finally{
			if(st!=null){
				try{
					st.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			if(conn!=null){
				try{
					conn.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
		}
		return rst;
	}
	
	/**
	 * query, not throw exception, only return a empty Collection
	 * @param sql
	 * @return
	 */
	public Collection<HashMap<String,Object>> queryQuietly(String sql){
		Collection<HashMap<String,Object>> col = new ArrayList<HashMap<String,Object>>();
		try {
			col = query(sql);
		} catch (SQLException e) {
			//do nothing
		}
		return col;
	}
	
	/**
	 * use this method to query data
	 * @param sql
	 * @return
	 * @throws SQLException
	 */
	public Collection<HashMap<String,Object>> query(String sql) throws SQLException {
		Collection<HashMap<String,Object>> col = new ArrayList<HashMap<String,Object>>();
		Connection conn = null;
		PreparedStatement st = null;
		ResultSet rs = null;
		try{
			conn = connManager.getConnection();
			st = conn.prepareStatement(sql,
					  ResultSet.TYPE_SCROLL_INSENSITIVE,
					  ResultSet.CONCUR_READ_ONLY);
			rs =st.executeQuery();
			ResultSetMetaData rsmd = rs.getMetaData();
			while(rs.next()){
				HashMap<String,Object> record = new HashMap<String,Object>();
				for (int i = 1; i <= rsmd.getColumnCount(); i++) {
					String key = rsmd.getColumnName(i).toUpperCase();
 					if (rsmd.getColumnType(i) == java.sql.Types.VARCHAR) {
						record.put(key, rs.getString(i));
					}else if (rsmd.getColumnType(i) == java.sql.Types.DATE) {
						String str = Util.getString(rs.getObject(i));
						int dot_index = str.indexOf(".");
						if(dot_index>0){
							str = str.substring(0, dot_index);
						}
						record.put(key, str);
					}else {
						record.put(key, rs.getObject(i));
					}
				}
				col.add(record);
			} 
			logger.debug("Query SQL: "+sql);
		}catch(SQLException ex){
			if(conn!=null){
				try{
					conn.rollback();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			logger.error("query(sql) errr, [SQL]:"+sql, ex);
			throw ex;
		}finally{
			if(rs!=null){
				try{
					rs.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			if(st!=null){
				try{
					st.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
			if(conn!=null){
				try{
					conn.close();
				}catch(SQLException ex1){
					ex1.printStackTrace();
				}
			}
		}
		
		return col;
	}


}
