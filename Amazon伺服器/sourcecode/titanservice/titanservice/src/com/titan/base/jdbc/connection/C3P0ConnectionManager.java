package com.titan.base.jdbc.connection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

import javax.sql.DataSource;

import org.apache.log4j.Logger;



import com.mchange.v2.c3p0.DataSources;
import com.mchange.v2.c3p0.PoolConfig;
import com.titan.base.configure.Configure;


public class C3P0ConnectionManager implements ConnectionManager {
	
	static Logger logger = Logger.getLogger(C3P0ConnectionManager.class);
	
	private DataSource ds;
	
	public C3P0ConnectionManager(){
		configure();
	}
	
	public Connection getConnection() throws SQLException {
		return ds.getConnection();
	}
	
	public void closeConnection(Connection conn) {
		try {
			conn.close();
		} catch (SQLException e) {
			logger.error("",e);
		}
	}
	
	public void close() throws SQLException {
		try {
			DataSources.destroy(ds);
		}
		catch (SQLException sqle) {
			logger.warn("could not destroy C3P0 connection pool", sqle);
		}
	}
	
	private void configure(){
		
		Properties props = Configure.dbConfigure;
	    
		String jdbcDriverClass = props.getProperty("db.connection.driver_class");
		String jdbcUrl = props.getProperty("db.connection.url");
		
		logger.debug("initial C3P0Connection......");

		try {
			Class.forName(jdbcDriverClass);
		}catch (ClassNotFoundException cnfe) {
			String msg = "JDBC Driver class not found: " + jdbcDriverClass;
			logger.error(msg);
			return;
		}

		try {

			PoolConfig pcfg = new PoolConfig();
			pcfg.setInitialPoolSize(Integer.parseInt(props.getProperty("db.c3p0.min_size")));
			pcfg.setMinPoolSize(Integer.parseInt(props.getProperty("db.c3p0.min_size")));
			pcfg.setMaxPoolSize(Integer.parseInt(props.getProperty("db.c3p0.max_size")));
			pcfg.setAcquireIncrement(Integer.parseInt(props.getProperty("db.c3p0.acquire_increment")));
			pcfg.setIdleConnectionTestPeriod(Integer.parseInt(props.getProperty("db.c3p0.idle_test_period")));
			pcfg.setMaxIdleTime(Integer.parseInt(props.getProperty("db.c3p0.timeout")));
			
			Properties p = new Properties();
			p.setProperty("user",props.getProperty("db.connection.username"));
			p.setProperty("password",props.getProperty("db.connection.password"));
			p.setProperty("useUnicode","true");
			p.setProperty("characterEncoding","utf8");
			p.setProperty("jdbcCompliantTruncation","false");

			DataSource unpooled = DataSources.unpooledDataSource(jdbcUrl, p);
			ds = DataSources.pooledDataSource(unpooled, pcfg);
			
			logger.info("Datasource initial complete: [URL]:"+jdbcUrl);

		}catch (Exception e) {
			logger.error("could not instantiate C3P0 connection pool", e);			
			return;
		}
	}
}
