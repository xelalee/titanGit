package com.titan.updserver.firmware.action;

import java.io.File;
import java.util.List;

import org.apache.commons.fileupload.FileItem;

import org.apache.log4j.Logger;

import com.titan.updserver.common.ContentBase;

import com.titan.updserver.firmware.bean.FirmwareBean;
import com.titan.updserver.firmware.dao.FirmwareDao;
import com.titan.util.MD5Tool;


public class FirmwareProcessor extends Thread {
	
	static Logger logger = Logger.getLogger(FirmwareProcessor.class);
	
	private List<FileItem> items;
	
	private FirmwareBean fwb;
	
	public FirmwareProcessor(List<FileItem> items, FirmwareBean fwb){
		this.items = items;
		this.fwb = fwb;
	}
	
	public void run(){
		try {
			this.handle();
		} catch (Exception e) {
			logger.error("", e);
		}
	}
	
	public void handle() throws Exception {
		
		
		boolean isSuccess=true;
		
		String file_name = "";
		for (FileItem fi: this.items) {
			if(fi!=null){
				logger.debug("fi.getName(): "+fi.getName()+", fi.getSize(): "+fi.getSize());
				if(fi.getName()!=null){
					ContentBase.getInstance().prepareFirmwareDir(this.fwb);
				    file_name = ContentBase.getInstance().getFirmwarePath(this.fwb);
				    File target = new File(file_name);
				    fi.write(target);	
				    logger.debug("write target: "+file_name);
				}

			}
		}
		
		logger.debug("start to get checksum, file name: "+file_name);
		String checksum = MD5Tool.getMD5Checksum(file_name);
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
			     }
			     logger.debug("register file isSuccess: "+isSuccess);
			 }catch(Exception ex){
				 isSuccess=false;	
				 logger.error("Fail to update master DB!", ex);
			 }

		}		
		
	}
	
	
	public synchronized static void startThreads(List<FileItem> items, FirmwareBean fwb){
		FirmwareProcessor porocessor = new FirmwareProcessor(items, fwb);		
		porocessor.start();
	}

}
