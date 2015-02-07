package com.titan.updserver.devicetype.dao;

import java.util.*;

import com.titan.jdbc.DAOHelper;
import com.titan.util.Util;


public class DeviceTypeDao {
	
	private static DeviceTypeDao instance = new DeviceTypeDao();
	
	public static DeviceTypeDao getInstance(){
		return instance;
	}

  //get device type information
  public Collection getDeviceTypeInfo() {
	StringBuffer sql = new StringBuffer();
	//Default query statement
	sql.append("select DEVICE ");
	sql.append("from DEVICE_TYPE ");
	sql.append("order by DEVICE ");
	return DAOHelper.queryQuietly(sql.toString());
  }
  
  public String getDeviceType(String DeviceType){
  	Collection col=DAOHelper.queryQuietly("select * from DEVICE_TYPE where upper(DEVICE)=upper('"+DeviceType+"')");
  	HashMap hm=new HashMap();
  	for(Iterator it=col.iterator();it.hasNext();){
  		hm=(HashMap)it.next();
  		return Util.getString(hm.get("DEVICE"));
  	}
  	return "";
  }
  
  public boolean existsDeviceType(String DeviceType){
	  Collection col=DAOHelper.queryQuietly("select * from DEVICE_TYPE where upper(DEVICE)=upper('"+DeviceType+"')");
	  return col.size()>0;
  }

}
