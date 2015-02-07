
package com.titan.jdbc.connection;

import org.apache.log4j.Logger;


public class ConnectionManagerFactory {
	
	static Logger logger = Logger.getLogger(ConnectionManagerFactory.class);
	
	private static ConnectionManager connManager = new C3P0ConnectionManager();

	
	public static ConnectionManager getConnManager(){
		return connManager;
	}
	
	public static ConnectionManager regetConnManager(){
		try{
			connManager.close();
		}catch(Exception e){
			logger.error("", e);
		}
		connManager = new C3P0ConnectionManager();
		return connManager;
	}

}
