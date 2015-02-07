package com.titan.mytitan.service.action;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.app.log.CommonLog;
import com.titan.base.app.mail.EmailTool;
import com.titan.base.product.bean.MyProductBean;

import com.titan.base.product.dao.MyProductDAO;

import com.titan.base.product.exception.InvalidAuthCodeOrSerialNumException;
import com.titan.base.product.exception.InvalidAuthenticationCodeException;
import com.titan.base.product.exception.InvalidUsernameException;
import com.titan.base.product.exception.MyProductReinstallException;
import com.titan.base.product.exception.MyProductRenameException;
import com.titan.base.product.exception.MyProductTransferException;
import com.titan.base.product.exception.ReinstallNotSameModelException;
import com.titan.base.product.exception.ReinstallToDeviceWithStandardServiceException;
import com.titan.base.product.exception.ReinstallToOtherAccountException;
import com.titan.base.product.exception.ReinstallToSameDeviceException;
import com.titan.base.product.exception.TransferToSelfException;
import com.titan.base.product.exception.UsernameEmailNotMatchException;
import com.titan.base.service.bean.LicenseBean;
import com.titan.base.service.bean.MyServiceBean;
import com.titan.base.service.dao.LicenseDAO;
import com.titan.base.service.dao.MyServiceDAO;
import com.titan.base.system.dao.Sequence_idDao;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.mytitan.login.bean.LoginBean;
import com.titan.mytitan.login.exception.UserInactivatedException;
import com.titan.mytitan.product.business.ProductReinstall;
import com.titan.mytitan.product.business.ProductTransfer;
import com.titan.mytitan.service.bean.SubMyServiceBean;
import com.titan.base.jdbc.DAOHelper;

public class MyServiceAction {
	public final static String STR_SESSAION_SERIAL_NUMBER = "MYSERVICE_SESSAION_SERIAL_NUMBER";
	public final static String STR_SESSAION_MAC = "MYSERVICE_SESSAION_MAC";
	
	static Logger logger = Logger.getLogger(MyServiceAction.class);
	
	protected MyProductBean myproductbean;
	
	protected LicenseBean licensekeybean;
	
	protected SubMyServiceBean myservicebean;
	
	protected String new_username;
	protected String new_sn;
	protected String new_email;
	protected String new_mac;
	
	protected List myservicebeans;
	
	protected boolean withStandard = false;
	protected boolean reinstallButtonRendered = false;

	protected boolean trial_rendered = false;
	
	public MyServiceAction(){
		this.myproductbean = new MyProductBean();
		this.myservicebean = new SubMyServiceBean();
		this.licensekeybean = new LicenseBean();
	}

	public String getNew_username() {
		return new_username;
	}

	public void setNew_username(String new_username) {
		this.new_username = new_username;
	}

	public String getNew_mac() {
		return new_mac;
	}

	public void setNew_mac(String new_mac) {
		this.new_mac = new_mac;
	}

	public String getNew_email() {
		return new_email;
	}

	public void setNew_email(String new_email) {
		this.new_email = new_email;
	}

	public String getNew_sn() {
		return new_sn;
	}

	public void setNew_sn(String new_sn) {
		this.new_sn = new_sn;
	}

	public MyProductBean getMyproductbean() {
		return myproductbean;
	}

	public void setMyproductbean(MyProductBean myproductbean) {
		this.myproductbean = myproductbean;
	}

	public LicenseBean getLicensekeybean() {
		return licensekeybean;
	}

	public void setLicensekeybean(LicenseBean licensekeybean) {
		this.licensekeybean = licensekeybean;
	}	

	public SubMyServiceBean getMyservicebean() {
		return myservicebean;
	}

	public void setMyservicebean(SubMyServiceBean myservicebean) {
		this.myservicebean = myservicebean;
	}

	public List getMyservicebeans() {
		return myservicebeans;
	}

	public boolean isWithStandard() {
		return withStandard;
	}

	public void setWithStandard(boolean withStandard) {
		this.withStandard = withStandard;
	}
	
	public boolean isTrial_rendered() {
		return trial_rendered;
	}

	public void setTrial_rendered(boolean trial_rendered) {
		this.trial_rendered = trial_rendered;
	}

	public boolean isReinstallButtonRendered() {
		return reinstallButtonRendered;
	}

	public void setReinstallButtonRendered(boolean reinstallButtonRendered) {
		this.reinstallButtonRendered = reinstallButtonRendered;
	}	

	/**
	 * load myservice_main.jsp
	 * @return
	 */
	public String loadAction(){
		String serial_number = Util.getString(ViewUtil.getRequestParameter("serial_number"));
		if(!serial_number.equals("")){
			ViewUtil.setSession(STR_SESSAION_SERIAL_NUMBER, serial_number);
		}else{
			serial_number = Util.getString(ViewUtil.getSession(STR_SESSAION_SERIAL_NUMBER));
		}
		
		logger.debug("loadAction() serial_number:"+serial_number);

		try{
			this.myproductbean = MyProductDAO.getInstance().getProductBySn(serial_number);
		}catch(SQLException ex){
			logger.error("MyProductDAO.getProductBySn(serial_number) error", ex);
			ViewUtil.addErrorMessage(ex.getMessage());
			return NavigationResults.FAILURE;
		}
		
		//set mac into session
		ViewUtil.setSession(STR_SESSAION_MAC, this.myproductbean.getMac());

		List beans = new ArrayList();
		List<MyServiceBean> list = null;

		try{
			list = MyServiceDAO.getInstance().getServicesBySN(this.myproductbean.getSn());
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.getMessage());
			return NavigationResults.FAILURE;			
		}
	
		SubMyServiceBean msbean;
		this.withStandard = false;
		this.reinstallButtonRendered = false;
		int i = 0;
		for(MyServiceBean bean: list){
			msbean = new SubMyServiceBean(bean);
			i++;
			msbean.setId(i);
			beans.add(msbean);
			if(msbean.getService().getService_type_id().equalsIgnoreCase("S")){
				this.withStandard = true;
				this.reinstallButtonRendered = true;
			}
		}
		this.myservicebeans = beans;

		this.clear();
		return "myservice_main";
	}
	
	public String renameProductAction(){
		String rst = NavigationResults.SUCCESS;
		try{
			int effects = MyProductDAO.getInstance().rename(this.myproductbean);
			if(effects < 1){
				rst = NavigationResults.FAILURE;
			}
		}catch(MyProductRenameException ex){
			rst = NavigationResults.FAILURE;
		}
		if(rst.equals(NavigationResults.FAILURE)){
			MyProductRenameException ex = new MyProductRenameException();
			ViewUtil.addErrorMessage(ex);
		}
		return rst;		
	}

	public String transferProductAction(){
		String rst = NavigationResults.SUCCESS;
		AccountBean newuser = new AccountBean();
		LoginBean loginbean = (LoginBean)(ViewUtil.getSession(Keys.USER_INFO));
		AccountBean currentUser = new AccountBean();
		if(loginbean!=null){
			currentUser = loginbean.getAccountbean();
		}
		try{
			newuser = AccountDAO.getInstance().getAccountByUsername(this.new_username.trim());
			if(newuser==null){
				InvalidUsernameException ex = new InvalidUsernameException();
				ViewUtil.addErrorMessage(ex);
				return NavigationResults.FAILURE;
			}else{
                //check new user
		        ProductTransfer.checkNewUser(newuser,this.new_email.trim(),this.myproductbean);
			}
		}catch(UsernameEmailNotMatchException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(UserInactivatedException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(TransferToSelfException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.toString());
			return NavigationResults.FAILURE;
		}
		//db operation
		try{
		    ProductTransfer.transfer(newuser,currentUser,this.myproductbean);
		}catch(SQLException ex){
			MyProductTransferException e = new MyProductTransferException();
			ViewUtil.addErrorMessage(e);
			rst = NavigationResults.FAILURE;
		}	
		//send mail
		if(rst.equals(NavigationResults.SUCCESS)){
		    EmailTool.sendProductTransferMailToSender(this.myproductbean,currentUser,newuser);
		    EmailTool.sendProductTransferMailToReceiver(this.myproductbean,currentUser,newuser);
		}
		//log
		CommonLog clog = new CommonLog();
		if(rst.equalsIgnoreCase(NavigationResults.FAILURE)){
			clog.setTitle("Transfer product fail. [MAC]:"
					+this.myproductbean.getMac()
					+" [Sender]:"+currentUser.getUsername()
					+" [Receiver]:"+newuser.getUsername());
			logger.error(clog.toString());
		}else{
			clog.setTitle("Transfer product success. [MAC]:"
					+this.myproductbean.getMac()
					+" [Sender]:"+currentUser.getUsername()
					+" [Receiver]:"+newuser.getUsername());	
			logger.info(clog.toString());
		}
		this.clear();
		return rst;			
	}
	
	public String reinstallProductAction(){
		String rst = NavigationResults.SUCCESS;
		String new_ac = this.new_mac.trim().toUpperCase();
		String new_sn = this.new_sn.trim().toUpperCase();
		MyProductBean newprod;
		try{
			ProductReinstall.checkProduct(new_ac,new_sn,this.myproductbean);
			newprod = MyProductDAO.getInstance().getProductByMac(new_ac);
			if(newprod!=null){
				ProductReinstall.checkNewProduct(newprod,this.myproductbean);
			}
		}catch(ReinstallToSameDeviceException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(InvalidAuthCodeOrSerialNumException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(ReinstallToDeviceWithStandardServiceException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(ReinstallToOtherAccountException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(ReinstallNotSameModelException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(InvalidAuthenticationCodeException ex){
			ViewUtil.addErrorMessage(ex);
			return NavigationResults.FAILURE;
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.getMessage());
			return NavigationResults.FAILURE;	
		}
		//DB operation
		ArrayList<String> sqls = new ArrayList<String>();
		try{
			if(newprod!=null){
				sqls.addAll(deleteNewProdInfo(new_ac,new_sn,newprod));
			}
            //Update AC to MY_PRODUCT
			sqls.add(MyProductDAO.getInstance().getUpdateProductSQL(new_sn,new_ac,this.myproductbean.getSn()));
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.getMessage());
			return NavigationResults.FAILURE;	
		}
		try{
			DAOHelper.getInstance().executeSQL(sqls);
		}catch(SQLException ex){
			rst = NavigationResults.FAILURE;
		}
		if(rst.equalsIgnoreCase(NavigationResults.FAILURE)){
			MyProductReinstallException ex = new MyProductReinstallException();
			ViewUtil.addErrorMessage(ex);
		}
		//send mail
		if(rst.equalsIgnoreCase(NavigationResults.SUCCESS)){
			MyProductBean productbean = new MyProductBean();
			productbean.setFriendly_name(this.myproductbean.getFriendly_name());
			LoginBean loginbean = (LoginBean)(ViewUtil.getSession(Keys.USER_INFO));
			AccountBean currentUser = null;
			if(loginbean!=null){
				currentUser = loginbean.getAccountbean();
			}
			EmailTool.sendProductReinstallMail(productbean,currentUser);
		}
		//log
		CommonLog clog = new CommonLog();
		if(rst.equalsIgnoreCase(NavigationResults.FAILURE)){
			clog.setTitle("Reinstall product fail. [MAC]:"
					+this.myproductbean.getMac()
					+" [New MAC]:"+this.new_mac);
			logger.error(clog.toString());
		}else{
			clog.setTitle("Reinstall product success. [MAC]:"
					+this.myproductbean.getMac()
					+" [New MAC]:"+this.new_mac);	
			logger.info(clog.toString());
		}		
		this.clear();
		return rst;			
	}
	
	public void clear(){
		this.new_mac = "";
		this.new_email = "";
		this.new_sn = "";
		this.new_username = "";
		this.licensekeybean.setLicense_key("");
	}
	
	public String toMyServiceMainAction(){
		this.clear();
		return "myservice_main";
	}
	
	public String toMyProductListAction(){
		this.clear();
		return "myproduct_list";		
	}
	
	private Collection<String> deleteNewProdInfo(String newAC,String newSN,MyProductBean newprod) throws SQLException {
		ArrayList<String> delSqls = new ArrayList<String>();
		if(MyProductDAO.getInstance().hasService(newSN)){
            //delete new SN FROM MY_SERVICE table
			delSqls.add(MyServiceDAO.getInstance().getDelServiceSQL(newprod.getMy_product_id()));
            //delete new AC FROM LICENSE table
			delSqls.add(LicenseDAO.getInstance().getDelLKSQL(newprod.getMy_product_id()));
		}
        //delete new AC FROM my_product table
		delSqls.add(MyProductDAO.getInstance().getDelProdSQL(newprod.getMy_product_id()));
		return delSqls;
	}
}
