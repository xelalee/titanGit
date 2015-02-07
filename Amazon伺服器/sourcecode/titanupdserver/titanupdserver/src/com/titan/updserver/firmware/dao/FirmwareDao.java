package com.titan.updserver.firmware.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import org.apache.log4j.Logger;

import com.titan.jdbc.DAOHelper;
import com.titan.updserver.firmware.FirmwareVersion;
import com.titan.updserver.firmware.InvalidFirmwareVersionException;
import com.titan.updserver.firmware.bean.FirmwareBean;

public class FirmwareDao {
	
	static Logger logger = Logger.getLogger(FirmwareDao.class);
	
	private static FirmwareDao instance = new FirmwareDao();
	
	public static FirmwareDao getInstance(){
		return instance;
	}
	
	public int insert(FirmwareBean bean) throws SQLException{
		StringBuffer sql=new StringBuffer();
		sql.append(" insert into FIRMWARE(DEVICE,VERSION,UPDATE_BY,UPDATE_DATE,CHECKSUM,FILESIZE,STATUS)");
		sql.append(" values('"+bean.getDevice()
				+"','"+bean.getVersion()
				+"','"+bean.getUpdate_by()
				+"',now()"
				+",'"+bean.getChecksum()
				+"','"+bean.getFilesize()
				+"','"+bean.getStatus()+"'");
		sql.append(")");

		return DAOHelper.executeSQL(sql.toString());
	}
	
	public int update(FirmwareBean bean) throws SQLException{		
		StringBuffer sql=new StringBuffer();
		sql.append(" update FIRMWARE");
		sql.append(" set DEVICE='"+bean.getDevice()+"'");
		sql.append("',VERSION='"+bean.getVersion()+"',FILENAME='"+bean.getFilename());
		sql.append("',UPDATE_BY='"+bean.getUpdate_by()+"',UPDATE_DATE=now()");
		sql.append(",CHECKSUM='"+bean.getChecksum());
		sql.append("',STATUS='"+bean.getStatus());
		sql.append("',FILESIZE='"+bean.getFilesize()+"'");
		sql.append(" where FIRMWARE_ID="+bean.getFirmware_id());
		
		return DAOHelper.executeSQL(sql.toString());
	}
	
	public int delete(FirmwareBean bean) throws SQLException{
		StringBuffer sql=new StringBuffer();
		sql.append(" delete from FIRMWARE where FIRMWARE_ID="+bean.getFirmware_id());
		return DAOHelper.executeSQL(sql.toString());
	}
	
	/**
	 * get latest firmware version
	 * @param device
	 * @param currentVer
	 * @return
	 */
	public FirmwareBean getLatestVersion(String device, String currentVer){
		
		StringBuffer buffer = new StringBuffer();
		buffer.append(" select * from FIRMWARE");
		buffer.append(" where DEVICE='"+device+"'");
		
		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(buffer.toString());

		FirmwareBean rst = null;
		FirmwareBean temp = null;
		String tempVer = currentVer;
		for(HashMap<String, Object> hm: col){
			temp = new FirmwareBean(hm);
			
			try{
				if(FirmwareVersion.compare(temp.getVersion(), tempVer)>0){
					rst = temp;
					tempVer = rst.getVersion();
				}				
			}catch(InvalidFirmwareVersionException e){
				logger.error("", e);
			}
		}
		return rst;
	}
	
	/**
	 * get firmwares
	 * @param device
	 * @param isDesc
	 * @return
	 */
	public List<FirmwareBean> getFirmwares(String device, boolean isDesc){
		List<FirmwareBean> rst = new ArrayList<FirmwareBean>();
		
		StringBuffer sql=new StringBuffer();
		sql.append(" select * from FIRMWARE");
		sql.append(" where 1=1");
		if(device!=null && !device.trim().equals("")){
			sql.append(" and DEVICE='"+device+"'");
		}
		
		sql.append(" order by FIRMWARE_ID ");
		if(isDesc){
			sql.append("desc");
		}
		
		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(sql.toString());
		for(HashMap<String, Object> hm: col){
			FirmwareBean bean = new FirmwareBean(hm);
			rst.add(bean);
		}
		return rst;
		
	}
	
	public FirmwareBean getFirmwareByID(String id){
		FirmwareBean bean = null;
		
		StringBuffer sql=new StringBuffer();
		sql.append(" select * from FIRMWARE");
		sql.append(" where  FIRMWARE_ID="+id);
		
		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(sql.toString());
		for(HashMap<String, Object> hm: col){
			bean = new FirmwareBean(hm);
		}
		return bean;
	}

}
