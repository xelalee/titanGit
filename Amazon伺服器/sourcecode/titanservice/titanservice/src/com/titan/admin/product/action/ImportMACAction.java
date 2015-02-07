package com.titan.admin.product.action;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jxl.read.biff.BiffException;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

import com.titan.admin.account.bean.AdministratorBean;
import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;
import com.titan.base.product.bean.ProductBean;
import com.titan.base.product.dao.ProductDAO;
import com.titan.base.uploadstatus.StatusListener;
import com.titan.base.util.ContentBase;
import com.titan.base.util.ExcelUtil;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;

public class ImportMACAction implements ActionInterf {
	
	static Logger logger = Logger.getLogger(ImportMACAction.class);
	
	static Logger logger_admin = Logger.getLogger("adminLogger");

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		
		//remove from session
		request.getSession().removeAttribute("previous_imported_products");
		
		MessageBean message = new MessageBean();
		message.setMenu("Product Management");
		message.setFunction("Import MAC");
		message.setBackURL("/jsp/admin/product/importMAC.jsf");
		
		String model_id = Util.getString(request.getParameter("model_id"));
		
		logger.debug("model_id: "+model_id);
		
		//save file
		// Create a factory for disk-based file items
		DiskFileItemFactory factory = new DiskFileItemFactory();

		// Set factory constraints
		factory.setSizeThreshold(10240);

		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);
			
		//add listener
		upload.setProgressListener(new StatusListener(request));

		List<FileItem> items = null;
		try {
			items = upload.parseRequest(request);
		} catch (FileUploadException e) {
			throw new ServletException("File Upload error, "+e.getMessage());
		}
		String file_name = "";
		for (FileItem fi: items) {
			if(fi!=null){
				logger.debug("fi.getName(): "+fi.getName()+", fi.getSize(): "+fi.getSize());
				if(fi.getName()!=null){
					String dir = ContentBase.getInstance().getTempPath();
				    file_name = dir + File.separator +fi.getName();
				    File target = new File(file_name);
				    try {
						fi.write(target);
					} catch (Exception e) {
						throw new ServletException("File Upload error, "+e.getMessage());
					}					
				}
			}
		}
		
		//read file
		
		Collection<HashMap<String, Object>> col = null;
		
		col = ExcelUtil.readCsv(new File(file_name),new String[]{"SN","MAC"});
		
		if(col==null){
			message.setSucc(false);
			message.setMessage("Read excel file fail.");
			return message;
		}
		
		boolean isValid = true; 
		
		List<ProductBean> products = new ArrayList<ProductBean>();
		for(HashMap<String, Object> hm: col){
			ProductBean product = new ProductBean(hm);
			
			if(product.validateSnMac()==false){
				isValid = false;
				break;
			}
			
			product.setModel_id(model_id);
			products.add(product);
		}
		
		//add to session
		request.getSession().setAttribute("previous_imported_products", products);
		
		if(!isValid){
			message.setSucc(false);
			message.setMessage("Invalid SN/MAC is detected. Please check.");
			return message;
		}		
		
		int total = products.size();
		
		int effects = 0;
		try {
			effects = ProductDAO.getInstance().save(products);
		} catch (SQLException e) {
			throw new ServletException("Save error, "+e.getMessage());
		}
		
		if(effects<total){
			message.setSucc(false);
			message.setMessage("At least one item is not saved. Total "+total+" items, save "+effects+" items.");			
		}else{
			message.setSucc(true);
			message.setMessage("Total "+total+" items, save "+effects+" items.");
		}
		
		AdministratorBean bean = (AdministratorBean)request.getSession().getAttribute(Keys.ADMIN_USER_INFO);
		logger_admin.info("import MAC, [succ]: "+message.isSucc()+", "+message.getMessage()+", [account]: "+bean.getUsername());
				
		return message;
	}

}
