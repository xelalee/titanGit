package com.titan.updserver.signature.action;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

import com.titan.common.ActionInterf;
import com.titan.common.bean.MessageBean;
import com.titan.controller.exception.ActionException;
import com.titan.controller.manage.ActionManagement;
import com.titan.updserver.common.ContentBase;
import com.titan.updserver.common.uploadstatus.StatusListener;
import com.titan.updserver.signature.bean.SignatureBean;
import com.titan.updserver.signature.dao.SignatureDao;
import com.titan.util.DateUtil;
import com.titan.util.Keys;
import com.titan.util.MD5Tool;
import com.titan.util.Util;


public class SignatureAction implements ActionInterf {
	
	static Logger logger = Logger.getLogger(SignatureAction.class);
	
	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		String msg = "";
		SignatureBean sjb=new SignatureBean();
		sjb.setSignature_id(Util.getString(request.getParameter("SIGNATURE_ID")));
		sjb.setDevice(Util.getString(request.getParameter("DEVICE")));		
		sjb.setService(Util.getString(request.getParameter("SERVICE")));		
		sjb.setEngine_ver(Util.getString(request.getParameter("ENGINE_VER")));		
		sjb.setSig_ver(Util.getString(request.getParameter("SIG_VER")));
		sjb.setFullset(Util.getString(request.getParameter("FULLSET")));
		HashMap hm=(HashMap)request.getSession().getAttribute(Keys.USER_INFO);
		String UPDATE_BY=Util.getString(hm.get("USERNAME"));
		sjb.setUpdate_by(UPDATE_BY);
		sjb.setUpdate_date(DateUtil.getCurrentDateTime());
		sjb.setStatus(Util.getString(request.getParameter("STATUS")));
		
		String dispatch = Util.getString(request.getParameter("dispatch"));
		
		logger.debug("dispatch: "+dispatch);
		
		MessageBean message = new MessageBean();
		message.setBackURL("/jsp/signature/signature_list.jsp");
		
		if(dispatch.equalsIgnoreCase("newSignature")){
			message.setMenu("Signature Create");
			message.setFunction("Signature Create");
			try {
				msg = this.newSignature(request, sjb);
			} catch (Exception e) {
				logger.error("", e);
				msg = e.toString();
			}
		}else if(dispatch.equalsIgnoreCase("editSignature")){
			message.setMenu("Signature Edit");
			message.setFunction("Signature Edit");
			try {
				msg = this.editSignature(request, sjb);
			} catch (Exception e) {
				logger.error("", e);
				msg = e.toString();
			}
		}else if(dispatch.equalsIgnoreCase("deleteSignature")){
			message.setMenu("Signature Delete");
			message.setFunction("Signature Delete");
			try {
				msg = this.deleteSignature(request, sjb);
			} catch (ActionException e) {
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
	
	public String newSignature(HttpServletRequest request, SignatureBean sjb) throws Exception {	
	
		boolean isSuccess=true;
		
		StringBuffer err=new StringBuffer();
		   
		// Create a factory for disk-based file items
		DiskFileItemFactory factory = new DiskFileItemFactory();

		// Set factory constraints
		factory.setSizeThreshold(10240);

		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);

		// Set overall request size constraint
		//upload.setSizeMax(419430400);
			
		//add listener
		upload.setProgressListener(new StatusListener(request));

		List<FileItem> items = upload.parseRequest(request);
		String file_name = "";
		for (FileItem fi: items) {
			if(fi!=null){
				logger.debug("fi.getName(): "+fi.getName()+", fi.getSize(): "+fi.getSize());
				if(fi.getName()!=null){
					ContentBase.getInstance().prepareSignatureDir(sjb);
				    file_name = ContentBase.getInstance().getSignaturePath(sjb);
				    File target = new File(file_name);
				    fi.write(target);					
				}

			}
		}
			
		String checksum = MD5Tool.getMD5Checksum(file_name);
		logger.debug("checksum: "+checksum);
		sjb.setChecksum(checksum);
		
		sjb.setFilesize(String.valueOf(ContentBase.getInstance().getFileSize(sjb)));
		       
		//register in db on master
		if(isSuccess){ 
			 int effects = 0;
			 try{
				 effects = SignatureDao.getInstance().insert(sjb); 
			     if(effects != 1){
			          isSuccess=false;
			   	      err.append("Fail to update master DB!");    
			     }
			     logger.debug("register file isSuccess: "+isSuccess);
			 }catch(Exception ex){
				 isSuccess=false;
				 err.append("Fail to update master DB! Message:"+ex.toString());	
				 logger.error("Fail to update master DB!", ex);
			 }

		}
			   
		//register and upload
		//TODO
		if(isSuccess){
			String path = ContentBase.getInstance().getSignaturePath(sjb);
			sjb.setFilesize(String.valueOf(ContentBase.getInstance().getFileSize(path)));
		}
		
		return err.toString();
	}
	
	public String editSignature(HttpServletRequest request, SignatureBean sjb) throws Exception {
		boolean isSuccess=true;

		StringBuffer err=new StringBuffer();

		//old SignatureJavaBean
		SignatureBean sjb0 = SignatureDao.getInstance().getSignatureByID(sjb.getSignature_id()); 
		//nnew file name
		String file_name = ContentBase.getInstance().getSignaturePath(sjb);
		//old file name
		String file_name0 = ContentBase.getInstance().getSignaturePath(sjb0);
		File f0=new File(file_name0);
		
		// Create a factory for disk-based file items
		DiskFileItemFactory factory = new DiskFileItemFactory();

		// Set factory constraints
		factory.setSizeThreshold(10240);

		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);

		// Set overall request size constraint
		//upload.setSizeMax(419430400);
			
		//add listener
		upload.setProgressListener(new StatusListener(request));

		List<FileItem> items = upload.parseRequest(request);
		
		boolean withUpload = (items!=null && items.size()>0);
		
		FileItem item = null;
		
		for (FileItem fi: items) {
			if(fi!=null){
				logger.debug("fi.getName(): "+fi.getName()+", fi.getSize(): "+fi.getSize());
				if(fi.getName()!=null){
					withUpload = true;
					item = fi;
				}
			}
		}
	
		if(withUpload){
			item = items.get(0);
		}
		
		//save file on master
		boolean dir_prepared=ContentBase.getInstance().prepareSignatureDir(sjb);
		
		if(dir_prepared){ 
			if(withUpload){
			  sjb.setFilesize(String.valueOf(item.getSize()));
		      item.write(new File(file_name));
		      if(!file_name0.equalsIgnoreCase(file_name)) f0.delete();
		    }else{
		    //without upload
		      file_name = ContentBase.getInstance().getSignaturePath(sjb);
		      File f=new File(file_name);
		      f0.renameTo(f);		    
		    }
			//generate checksum
		    String checksum=MD5Tool.getMD5Checksum(file_name);
		    sjb.setChecksum(checksum);
		}
		else{
		   isSuccess=false;
		   err.append("Fail to create directory!");
		}  
		//register in db on master
		if(isSuccess){
		    int effects = 0;
		    try{
		       effects = SignatureDao.getInstance().update(sjb); 
		       if(effects != 1){
		    	   isSuccess=false;
		    	   err.append("Fail to update master DB!");
		       }
		    }catch(Exception ex){
		    	isSuccess=false;
		  	    err.append("Fail to update master DB! Message:"+ex.toString());
		    }

		}
		//update S3
		//TODO
		
		return err.toString();
	}
	
	public String deleteSignature(HttpServletRequest request, SignatureBean sjb) throws ActionException {
		StringBuffer err=new StringBuffer();
		boolean isSuccess=true;
		SignatureBean sjb0=SignatureDao.getInstance().getSignatureByID(sjb.getSignature_id()); 
		//old file name
		String file_name0= ContentBase.getInstance().getSignaturePath(sjb);
		File f0=new File(file_name0);
		
		if(SignatureDao.getInstance().allowDelete(sjb0)){   
			f0.delete();
			//delete in db on master
			int effects = -1;
			try {
				effects = SignatureDao.getInstance().delete(sjb0);
			} catch (SQLException e) {
				logger.error("", e);
			} 
			if(effects != 1){		      
				isSuccess=false;   	  
				err.append("Fail to update master DB!");    
			}       
			//update S3
			//TODO
		}else{      
			isSuccess=false;  
			err.append(" The signature can not be deleted. It is a fullset one, and at least one incremental signature bases on it.");   
		}
		return err.toString();
	}

}
