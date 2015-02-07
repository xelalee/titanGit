package com.titan.updserver.servicetype.dao;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import com.titan.jdbc.DAOHelper;
import com.titan.util.Util;

public class ServiceTypeDao {

	private static ServiceTypeDao instance = new ServiceTypeDao();

	public static ServiceTypeDao getInstance() {
		return instance;
	}

	// get service type information
	public Collection getServiceTypeInfo() {
		StringBuffer sql = new StringBuffer();
		// Default query statement
		sql.append("select SERVICE ");
		sql.append("from SERVICE_TYPE ");
		sql.append("order by SERVICE ");
		return DAOHelper.queryQuietly(sql.toString());
	}

	public String getServiceType(String ServiceType) {
		Collection col = DAOHelper
				.queryQuietly("select * from SERVICE_TYPE where upper(SERVICE)=upper('"
						+ ServiceType + "')");
		HashMap hm = new HashMap();
		for (Iterator it = col.iterator(); it.hasNext();) {
			hm = (HashMap) it.next();
			return Util.getString(hm.get("SERVICE"));
		}
		return "";
	}

	public boolean existsServiceType(String ServiceType) {
		Collection col = DAOHelper
				.queryQuietly("select * from SERVICE_TYPE where upper(SERVICE)=upper('"
						+ ServiceType + "')");
		return col.size()>0;
	}

}
