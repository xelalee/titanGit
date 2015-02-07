
package com.titan.base.jdbc.connection;

import java.sql.Connection;
import java.sql.SQLException;

public interface ConnectionManager {
		
	/**
	 * Get a connection
	 * @return a JDBC connection
	 * @throws SQLException
	 */
	public Connection getConnection() throws SQLException;
	/**
	 * Dispose of a used connection.
	 * @param conn a JDBC connection
	 * @throws SQLException
	 */
	public void closeConnection(Connection conn);
	/**
	 * Release all resources held by this provider. JavaDoc requires a second sentence.
	 * @throws SQLException
	 */
	public void close() throws SQLException;
}
