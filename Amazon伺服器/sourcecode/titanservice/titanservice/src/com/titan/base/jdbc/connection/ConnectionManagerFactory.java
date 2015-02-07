
package com.titan.base.jdbc.connection;



public class ConnectionManagerFactory {
	private static ConnectionManager connManager = new C3P0ConnectionManager();
	
	public static ConnectionManager getConnManager(){
		return connManager;
	}
	
	public static ConnectionManager regetConnManager(){
		try{
			connManager.close();
		}catch(Exception e){
			e.printStackTrace();
		}
		connManager = new C3P0ConnectionManager();
		return connManager;
	}

}
