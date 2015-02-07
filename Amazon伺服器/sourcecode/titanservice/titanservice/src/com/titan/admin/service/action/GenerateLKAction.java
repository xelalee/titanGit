package com.titan.admin.service.action;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jxl.Workbook;
import jxl.read.biff.BiffException;
import jxl.write.Label;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.biff.RowsExceededException;

import org.apache.log4j.Logger;

import com.titan.admin.account.bean.AdministratorBean;
import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;
import com.titan.base.product.bean.Model2ServiceBean;
import com.titan.base.product.dao.Model2ServiceDAO;
import com.titan.base.service.bean.LicenseBean;
import com.titan.base.service.dao.LicenseDAO;
import com.titan.base.system.bean.Sn_seqBean;
import com.titan.base.system.dao.Sequence_idDao;
import com.titan.base.system.dao.Sn_seqDAO;
import com.titan.base.util.ContentBase;
import com.titan.base.util.Keys;
import com.titan.base.util.LicenseUtil;
import com.titan.base.util.Util;

public class GenerateLKAction implements ActionInterf {
	
	static Logger logger = Logger.getLogger(GenerateLKAction.class);
	
	static Logger logger_admin = Logger.getLogger("adminLogger");

	public GenerateLKAction() {
	}

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		String dispatch = Util.getString(request.getParameter("dispatch"));
		MessageBean message = null;
		if(dispatch.equalsIgnoreCase("export")){	
			try {
				message = this.export(request, response);
			} catch (RowsExceededException e) {
				logger.error("", e);
			} catch (BiffException e) {
				logger.error("", e);
			} catch (WriteException e) {
				logger.error("", e);
			} catch (SQLException e) {
				logger.error("", e);
			}
		}else{
			message = this.generate(request);
		}
		return message;
	}
	
	private MessageBean generate(HttpServletRequest request) throws ServletException, IOException{
		MessageBean message = new MessageBean();
		message.setMenu("Service Management");
		message.setFunction("Generate License Key");
		
		String serviceCode = Util.getString(request.getParameter("serviceCode"));
		String cardType = Util.getString(request.getParameter("cardType"));
		int quantity = Util.getInteger(request.getParameter("quantity"));
		String usage = Util.getString(request.getParameter("usage"));
		
		String originalURL = "/jsp/admin/service/generateLK.jsf";
		
		message.setBackURL(originalURL);
		
		String[] serviceTypeCode = serviceCode.split("\\-");
		
		//check quantity
		
		if(usage.equalsIgnoreCase("Test") && quantity>10){
			message.setSucc(false);
			message.setMessage("You can generate up to 10 license keys for test usage.");
			return message;
		}
		
		//check card type
		Model2ServiceBean m2s = null;
		try {
			m2s = Model2ServiceDAO.getInstance().getByCardType_ServiceCode_ServiceType(cardType, serviceTypeCode[1], serviceTypeCode[0]);
		} catch (SQLException e) {
		}
		
		if(m2s==null){
			message.setSucc(false);
			message.setMessage("Service Code / Card Type does not match.");
			return message;			
		}
		
		//generate license key
		AdministratorBean bean = (AdministratorBean)request.getSession().getAttribute(Keys.ADMIN_USER_INFO);
		
		String order_id = usage+"_"+bean.getUsername()+"_"+Sequence_idDao.getInstance().getSEQ("LICENSE_ORDER");
		List<LicenseBean> lks = new ArrayList<LicenseBean>();
		for(int i=0;i<quantity;i++){
			LicenseBean license = new LicenseBean();
			license.setOrder_id(order_id);
			license.setCard_type(cardType);
			license.setLicense_key(LicenseUtil.genLK(serviceCode));
			license.setService_code(serviceTypeCode[1]);
			license.setService_type_id(serviceTypeCode[0]);
			Sn_seqBean sn;
			try {
				sn = Sn_seqDAO.getInstance().get4License();
				license.setSn(sn.generateSN());
			} catch (SQLException e) {
				logger.error("get SN error", e);
				message.setSucc(false);
				message.setMessage("Generate SN error. "+e.getMessage());
				return message;
			}
			lks.add(license);
		}
		
		//save
		int effects = 0;
		try {
			effects = LicenseDAO.getInstance().save(lks);
		} catch (SQLException e) {
			logger.error("", e);
		}
		if(effects==quantity){
			message.setSucc(true);
			message.setTargetURL(originalURL);			
		}else{
			message.setSucc(false);		
			message.setMessage("The operation is fail. [Required]: "+quantity+",[Generated]: "+effects);
		}
		
		request.setAttribute("serviceCode", serviceCode);
		request.setAttribute("cardType", cardType);
		request.setAttribute("quantity", quantity);
		request.setAttribute("usage", usage);

		
		request.setAttribute("ORDER_ID", order_id);
		request.setAttribute("GENERATED_LICENSE_KEYS", lks);
		
		AdministratorBean admin = (AdministratorBean)request.getSession().getAttribute(Keys.ADMIN_USER_INFO);
		logger_admin.info("generate license key, [order_id]: "+order_id+", [succ]: "+message.isSucc()+", "+message.getMessage()+", [account]: "+admin.getUsername());
		
		return message;
	}
	
	private MessageBean export(HttpServletRequest request,HttpServletResponse response) throws SQLException, BiffException, IOException, RowsExceededException, WriteException{
		String order_id = Util.getString(request.getParameter("order_id"));
		List<LicenseBean> lks = LicenseDAO.getInstance().getLicenseKeys(order_id);
		String create_date = "";
		if(lks!=null && lks.size()>0){
			create_date = lks.get(0).getCreate_date();
		}
		
		//write the file
		
		String fileTemp = request.getSession().getServletContext().getRealPath(File.separator+"template"+File.separator+"lk_temp.xls");
		String fileDest = ContentBase.getInstance().getTempPath()+File.separator+order_id+".xls";
		
    	Workbook workbook = Workbook.getWorkbook(new File(fileTemp));
    	
    	WritableWorkbook workbook_w = Workbook.createWorkbook(new File(fileDest),workbook);
    	WritableSheet sheet_w = workbook_w.getSheet(0);
		
		Label l=new Label(1,2,order_id);
		sheet_w.addCell(l);   
		l=new Label(1,3,create_date);
		sheet_w.addCell(l);  
		
		int index = 1;
		int row = 7;
		for(LicenseBean lk: lks){
			//index
			l=new Label(0, row, String.valueOf(index));
			sheet_w.addCell(l); 
			//license Key
			l=new Label(1, row, lk.getLicense_key());
			sheet_w.addCell(l); 
			//card type
			l=new Label(2, row, lk.getCard_type());
			sheet_w.addCell(l); 
			//sn
			l=new Label(3, row, lk.getSn());
			sheet_w.addCell(l);
			row++;
		}
		
    	workbook_w.write();
    	workbook_w.close(); 
    	
    	//response the file
    	
    	File file = new File(fileDest);
    	
        response.reset();
		response.setContentType("bin");
		response.setHeader("Content-Length",String.valueOf(file.length()));
		response.setHeader("Content-Disposition","attachment;filename="+order_id+".xls");
 
		final ServletOutputStream sos = response.getOutputStream();
		
		final BufferedInputStream inStream = new BufferedInputStream(new FileInputStream(file.getPath()));
		
		int byteread = 0;

		try{
	    	byte[]  buffer = new  byte[1024];
			while ((byteread = inStream.read(buffer))!=-1)
			 {
			   sos.write(buffer,0,byteread);
			 } 
			sos.flush();
		}finally{
			try{				
			    inStream.close();
			}catch(Exception ex){}
			try{				
				sos.close();
			}catch(Exception ex){}
		}
    	
    	return null;	
	}

}
