package com.titan.mytitan.login.action;


import java.sql.SQLException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.app.mail.EmailTool;
import com.titan.base.app.util.BundleUtil;
import com.titan.base.product.bean.MyProductBean;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.mytitan.login.bean.LocaleBean;
import com.titan.base.jdbc.DAOHelper;

public class RetrievePasswordAction {
	private Locale locale;
	public RetrievePasswordAction(){
		locale = new LocaleBean().getLocale0();
	}
	
	private String username1;
	private String username2;
	private String email;
	private String sn;
	private String mac;
	
	public String getUsername2() {
		return username2;
	}
	public void setUsername2(String username2) {
		this.username2 = username2;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getMac() {
		return mac;
	}
	public void setMac(String mac) {
		this.mac = mac;
	}
	public String getSn() {
		return sn;
	}
	public void setSn(String sn) {
		this.sn = sn;
	}
	public String getUsername1() {
		return username1;
	}
	public void setUsername1(String username) {
		this.username1 = username;
	}
	
	/**
	 * retrieve password hint by username, email
	 * @return
	 */
	public String retrievePasswordHintAction(){
		AccountBean bean = null;
		try{
			bean = AccountDAO.getInstance().getAccountByUsername(this.username1);
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.toString());
			return NavigationResults.FAILURE;
		}
		if(bean==null){
			ViewUtil.addErrorMessage(BundleUtil.getResource("","RETRIEVE_PASSWORD_HINT_EX",locale));
		}else{
			if(!bean.getEmail().equalsIgnoreCase(this.email)){
				ViewUtil.addErrorMessage(BundleUtil.getResource("","RETRIEVE_PASSWORD_HINT_EX",locale));				
			}else{
				String hint = "";
				hint = BundleUtil.getResource("","RETRIEVE_PASSWORD_HINT_SUCC",locale);
				MessageFormat mf = new MessageFormat(hint);
				String[] strs = new String[]{
						bean.getPassword_hint()
				};
				hint = mf.format(strs);
				if(bean.getPassword_hint().trim().equals("")){
					hint = BundleUtil.getResource("","RETRIEVE_PASSWORD_HINT_NULL",locale);
				}
				ViewUtil.addInfoMessage(hint);
			}
		}
		this.clear();
		return NavigationResults.RETRY;
	}
	
	/**
	 * retrieve password by username
	 * password is sent to registered email
	 * @return
	 */
	public String retrievePasswordAction(){
		AccountBean bean = null;
		try{
			bean = AccountDAO.getInstance().getAccountByUsername(this.username2);
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.getMessage());
			return NavigationResults.FAILURE;
		}
		if(bean==null){
			ViewUtil.addErrorMessage(BundleUtil.getResource("","RETRIEVE_PASSWORD_EX",locale));
		}else{
			bean.setPassword1(getRandomString(6));
			List<String> sqls = new ArrayList<String>();
			sqls.add(AccountDAO.getInstance().getChangePasswordSQL(bean));
			try{
				DAOHelper.getInstance().executeSQL(sqls);
				bean.setPassword(bean.getPassword1());
			}catch(SQLException ex){
			}
			//send mail
			EmailTool.sendRetrievePassowrdMail(bean);
			ViewUtil.addInfoMessage(BundleUtil.getResource("","RETRIEVE_PASSWORD_SUCC",locale));
		}
		this.clear();
		return NavigationResults.RETRY;	
	}
	
	/**
	 * retrieve username by serial number, mac
	 * username is sent to registered email
	 * @return
	 */
	public String retrieveUsernameAction(){
		MyProductBean mpbean = new MyProductBean();
		mpbean.setSn(this.sn);
		mpbean.setMac(this.mac);
		AccountBean bean = null;
		try{
			bean = AccountDAO.getInstance().getAccount(mpbean);
		}catch(SQLException ex){
			ViewUtil.addErrorMessage(ex.toString());
			return NavigationResults.FAILURE;
		}
		if(bean==null){
			ViewUtil.addErrorMessage(BundleUtil.getResource("","RETRIEVE_USERNAME_EX",locale));
		}else{
			List<String> sqls = new ArrayList<String>();
			String username = bean.getUsername();
			String password = bean.getPassword();
			if(username.length()>20){
				String newusername = username;
				int index;
		        if((index=username.indexOf("@")) != -1){
		        	newusername = username.substring(0,index);
		        	if(newusername.length()>20||newusername.length()<6){
		        		newusername = username.substring(0,20);
		        	}
		        }else{
		        	newusername = username.substring(0,20);
		        }
		        //check this username exist
		        AccountBean accountbean = null;
		        while(true){
			        try{
			        	accountbean = AccountDAO.getInstance().getAccountByUsername(newusername);
					}catch(SQLException ex){
								
					}
					if(accountbean != null){
						newusername = newusername.substring(0,newusername.length()-1) + getRandomString(1);
					}else{
						break;
					}
		        }
		        bean.setUsername(newusername);
			}
			bean.setPassword(getRandomString(6));
			sqls.add(AccountDAO.getInstance().getChangeUsernamePasswordSQL(bean));
			try{
				DAOHelper.getInstance().executeSQL(sqls);
			}catch(SQLException ex){
				bean.setUsername(username);
				bean.setPassword(password);
			}
			//send mail
			EmailTool.sendRetrieveUsernameMail(bean);
			ViewUtil.addInfoMessage(BundleUtil.getResource("","RETRIEVE_USERNAME_SUCC",locale));
		}
		this.clear();
		return NavigationResults.RETRY;		
	}
	
	public String cancelAction(){
		this.clear();
		return NavigationResults.LOGIN;		
	}	
	
	public void clear(){
		this.email = "";
		this.mac = "";
		this.sn = "";
		this.username1 = "";
		this.username2 = "";
	}
	
	
	public static void main(String[] args){
		try{
			EmailTool.sendEmail("jacky.gu@titan.cn","ssss","ssss");
			//EmailTool.sendEmail("glq0316@hotmail.com","ssss","ssss");
		}catch(Exception ex){
			ex.printStackTrace();
		}
	}
     
	private String getRandomString(int length){
		String buffer = new String("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"); 
	    StringBuffer sb = new StringBuffer(); 
	    Random r = new Random(); 
	    int range = buffer.length(); 
	    for (int i = 0; i < length; i ++) { 
	        sb.append(buffer.charAt(r.nextInt(range))); 
	    } 
	    return sb.toString();
	}
}
