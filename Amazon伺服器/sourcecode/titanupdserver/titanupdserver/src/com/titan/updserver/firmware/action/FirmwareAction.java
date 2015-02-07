package com.titan.updserver.firmware.action;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;

import org.apache.commons.io.FileUtils;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.titan.common.ActionInterf;
import com.titan.common.bean.MessageBean;
import com.titan.updserver.common.ContentBase;
import com.titan.updserver.common.uploadstatus.StatusListener;
import com.titan.updserver.firmware.FirmwareVersion;
import com.titan.updserver.firmware.bean.FirmwareBean;
import com.titan.updserver.firmware.dao.FirmwareDao;
import com.titan.util.DateUtil;
import com.titan.util.Keys;
import com.titan.util.MD5Tool;
import com.titan.util.Util;

public class FirmwareAction implements ActionInterf{

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		String msg = "";
		FirmwareBean fwb=new FirmwareBean();
		fwb.setFirmware_id(Util.getString(request.getParameter("FIRMWARE_ID")));
		fwb.setDevice(Util.getString(request.getParameter("DEVICE")));		
		fwb.setVersion(Util.getString(request.getParameter("VERSION")));
		HashMap hm=(HashMap)request.getSession().getAttribute(Keys.USER_INFO);
		String UPDATE_BY=Util.getString(hm.get("USERNAME"));
		fwb.setUpdate_by(UPDATE_BY);
		fwb.setUpdate_date(DateUtil.getCurrentDateTime());
		fwb.setStatus(Util.getString(request.getParameter("STATUS")));
		
		String dispatch = Util.getString(request.getParameter("dispatch"));
		
		logger.debug("dispatch: "+dispatch);
		
		MessageBean message = new MessageBean();
		message.setBackURL("/jsp/firmware/firmware_list.jsp");
		
		if(dispatch.equalsIgnoreCase("newFirmware")){
			message.setMenu("Firmware Create");
			message.setFunction("Firmware Create");
			//message.setTargetURL("/jsp/firmware/firmware_new_progress.jsp");
			try {
				msg = this.newFirmware(request, fwb);
			} catch (Exception e) {
				logger.error("", e);
				msg = e.toString();
			}
		}else if(dispatch.equalsIgnoreCase("deleteFirmware")){
			message.setMenu("Firmware Delete");
			message.setFunction("Firmware Delete");
			try {
				msg = this.deleteFirmware(request, fwb);
			} catch (Exception e) {
				logger.error("", e);
				msg = e.toString();
			}
		}

		if(msg.equals("")){
			message.setSucc(true);
			message.setMessage(MessageBean.DefaultSuccHint);
		}else{
			message.setSucc(false);
			message.setMessage(msg);
		}
		
		return message;
	}
	
	public String newFirmware(HttpServletRequest request, FirmwareBean fwb) throws Exception {
		
		StringBuffer err=new StringBuffer();
		
		if(!FirmwareVersion.validate(fwb.getVersion())){
			return "Invalid firmware version!";
		}		
		   
		boolean isSuccess=true;
		
		String srcFilename = Util.getString(request.getParameter("FIRMWARE"));
		
		File srcFile = new File(ContentBase.getInstance().getFirmwareTempPath(srcFilename));
		
		String file_name = "";
		
		ContentBase.getInstance().prepareFirmwareDir(fwb);
	    file_name = ContentBase.getInstance().getFirmwarePath(fwb);
	    File destFile = new File(file_name);
		
		FileUtils.copyFile(srcFile, destFile);
		
		logger.debug("start to get checksum, file name: "+file_name);
		String checksum = "N/A";
		
		try{
			checksum = MD5Tool.getMD5Checksum(file_name);
		}catch(Exception ex){
			logger.error("fail to generate checksum", ex);
		}
		
		logger.debug("checksum: "+checksum);
		fwb.setChecksum(checksum);
		
		long fileSize = ContentBase.getInstance().getFileSize(fwb);
		fwb.setFilesize(String.valueOf(fileSize));
		       
		//register in db on master
		if(isSuccess){ 
			 int effects = 0;
			 try{
				 effects = FirmwareDao.getInstance().insert(fwb); 
			     if(effects != 1){
			          isSuccess=false;
			          logger.error("Fail to update master DB!");    
			          err.append("Fail to update master DB!");
			     }
			     logger.debug("register file isSuccess: "+isSuccess);
			 }catch(Exception ex){
				 isSuccess=false;	
				 logger.error("Fail to update master DB!", ex);
				 err.append("Fail to update master DB!");
			 }

		}
		
		if(isSuccess){
			FileUtils.deleteQuietly(srcFile);
		}
		
		
		logger.debug("FirmwareProcessor start...");
		
		return err.toString();
	}
	
	public String deleteFirmware(HttpServletRequest request, FirmwareBean fwb) throws Exception {
		StringBuffer err=new StringBuffer();
		boolean isSuccess=true;
		FirmwareBean fwb0=FirmwareDao.getInstance().getFirmwareByID(fwb.getFirmware_id()); 
		//old file name
		String file_name0= ContentBase.getInstance().getFirmwarePath(fwb0);
		File f0=new File(file_name0);
		
		boolean flag = f0.delete();
		
		logger.debug("file delete, path: "+file_name0+", flag: "+flag);
		
		//delete in db on master
		int effects = -1;
		try {
			effects = FirmwareDao.getInstance().delete(fwb0);
		} catch (SQLException e) {
			logger.error("", e);
		} 
		if(effects != 1){		      
			isSuccess=false;   	  
			err.append("Fail to update master DB!");    
		}       
		//update S3
		//TODO
		return err.toString();
	}

}
