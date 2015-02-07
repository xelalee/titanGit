package com.titan.base.account.dao;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.*;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.bean.MyAccountBean;
import com.titan.base.account.exception.AccountActivateException;
import com.titan.base.account.exception.AccountDeleteException;
import com.titan.base.account.exception.AccountInsertException;
import com.titan.base.account.exception.AccountUpdateException;
import com.titan.base.app.util.BundleUtil;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.util.Keys;
import com.titan.base.util.PasswordCoder;
import com.titan.base.jdbc.DAOHelper;


public class AccountDAO {
	
	private static AccountDAO instance = new AccountDAO();
	public static AccountDAO getInstance(){
		return instance;
	}
    
	public int insert(AccountBean bean) throws AccountInsertException{
		try{
			return DAOHelper.getInstance().executeSQL(getInsertSQL(bean));
		}catch(SQLException ex){
			throw new AccountInsertException();
		}
	}
	
	public String getInsertSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" insert into ACCOUNT(ACCOUNT_ID, USERNAME, PASSWORD, PASSWORD_HINT, FIRST_NAME,");
		buffer.append(" LAST_NAME, COMPANY, ADDRESS, CITY, STATE, COUNTRY_CODE, POSTAL_CODE, PHONE,");
		buffer.append(" FAX, EMAIL, STATUS, REMINDER, REMINDER_LANG,");
		buffer.append(" CREATE_DATE, CREATE_BY, LOGIN_COUNT, LOGIN_STATUS, SUBSCRIPTION_CODE)");
		buffer.append(" values( "+bean.getAccount_id());
		buffer.append(" ,'"+bean.getUsername().toLowerCase(Keys.DEFAULT_LOCALE)+"'");
		buffer.append(" ,'"+PasswordCoder.encode(bean.getPassword())+"'");
		buffer.append(" ,'"+bean.getPassword_hint()+"'");
		buffer.append(" ,'"+bean.getFirst_name()+"'");
		buffer.append(" ,'"+bean.getLast_name()+"'");
		buffer.append(" ,'"+bean.getCompany()+"'");
		buffer.append(" ,'"+bean.getAddress()+"'");
		buffer.append(" ,'"+bean.getCity()+"'");
		buffer.append(" ,'"+bean.getState()+"'");
		buffer.append(" ,'"+bean.getCountry_code()+"'");
		buffer.append(" ,'"+bean.getPostal_code()+"'");
		buffer.append(" ,'"+bean.getPhone()+"'");
		buffer.append(" ,'"+bean.getFax()+"'");
		buffer.append(" ,'"+bean.getEmail().toLowerCase(Keys.DEFAULT_LOCALE)+"'");
		buffer.append(" ,'"+bean.getStatus()+"'");
		buffer.append(" ,'"+new String(bean.getReminder()==true?"T":"F")+"'");
		buffer.append(" ,'"+bean.getReminder_lang()+"'");
		buffer.append(" ,now()");
		buffer.append(" ,'"+bean.getCreate_by()+"'");
		buffer.append(" ,0");
		buffer.append(" ,'"+bean.getLogin_status()+"'");
		buffer.append(" ,'"+bean.getSubscription_code()+"')");
		return buffer.toString();
	}
	
	public int update(AccountBean bean) throws AccountUpdateException{

		
		try{
			return DAOHelper.getInstance().executeSQL(getUpdateSQL(bean));
		}catch(SQLException ex){
			throw new AccountUpdateException();
		}
	}
	
	public String getUpdateSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE ACCOUNT");
		buffer.append(" SET PASSWORD_HINT='"+bean.getPassword_hint()+"',");
		buffer.append(" FIRST_NAME='"+bean.getFirst_name()+"',");
		buffer.append(" LAST_NAME='"+bean.getLast_name()+"',");
		buffer.append(" COMPANY='"+bean.getCompany()+"',");
		buffer.append(" ADDRESS='"+bean.getAddress()+"',");
		buffer.append(" CITY='"+bean.getCity()+"',");
		buffer.append(" STATE='"+bean.getState()+"',");
		buffer.append(" COUNTRY_CODE='"+bean.getCountry_code()+"',");
		buffer.append(" POSTAL_CODE='"+bean.getPostal_code()+"',");
		buffer.append(" PHONE='"+bean.getPhone()+"',");
		buffer.append(" FAX='"+bean.getFax()+"',");
		buffer.append(" EMAIL='"+bean.getEmail().toLowerCase(Keys.DEFAULT_LOCALE)+"',");
		buffer.append(" REMINDER='"+new String(bean.getReminder()==true?"T":"F")+"',");
		buffer.append(" REMINDER_LANG='"+bean.getReminder_lang()+"',");
		buffer.append(" UPDATE_DATE=now(),");
		buffer.append(" UPDATE_BY='"+bean.getUpdate_by()+"',");
		buffer.append(" LOGIN_STATUS='"+new String(bean.getReminder()==true?"":"F")+"'");
		buffer.append(" WHERE ACCOUNT_ID="+bean.getAccount_id());
		return buffer.toString();
	}
	
	public int delete(AccountBean bean) throws AccountDeleteException{
		try{
			return DAOHelper.getInstance().executeSQL(getDeleteSQL(bean));
		}catch(SQLException ex){
			throw new AccountDeleteException();
		}
	}
	
	public String getDeleteSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" DELETE FROM ACCOUNT");
		buffer.append(" WHERE USERNAME='"+bean.getUsername()+"'");
		return buffer.toString();
	}
	
	public int activate(AccountBean bean) throws AccountActivateException{
		try{
			return DAOHelper.getInstance().executeSQL(getActivateSQL(bean));
		}catch(SQLException ex){
			throw new AccountActivateException();
		}		
	}
	
	public String getActivateSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE ACCOUNT");
		buffer.append(" set");
		buffer.append(" status='"+AccountBean.STR_ACTIVE_FLAG+"',");
		buffer.append(" UPDATE_DATE=now(),");
		buffer.append(" UPDATE_BY='"+bean.getUpdate_by()+"'");
		buffer.append(" WHERE ACCOUNT_ID="+bean.getAccount_id());
		return buffer.toString();
	}
	
	public int changePassword(AccountBean bean) throws AccountUpdateException{
		try{
			return DAOHelper.getInstance().executeSQL(getChangePasswordSQL(bean));
		}catch(SQLException ex){
			throw new AccountUpdateException();
		}		
	}
	
	public String getChangePasswordSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE ACCOUNT");
		buffer.append(" SET");
		buffer.append(" PASSWORD='"+PasswordCoder.encode(bean.getPassword1())+"',");
		buffer.append(" UPDATE_DATE=now(),");
		buffer.append(" UPDATE_BY='"+bean.getUpdate_by()+"'");
		buffer.append(" WHERE ACCOUNT_ID="+bean.getAccount_id());
		buffer.append(" AND upper(STATUS) = 'ACTIVATION'");
		return buffer.toString();		
	}
	
	public int updateLastViewedInfo(AccountBean bean) throws AccountUpdateException{
		try{
			return DAOHelper.getInstance().executeSQL(getUpdateLastViewedInfoSQL(bean));
		}catch(SQLException ex){
			throw new AccountUpdateException();
		}
	}
	
	public String getUpdateLastViewedInfoSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE ACCOUNT");
		buffer.append(" SET");
		buffer.append(" LOGIN_COUNT=LOGIN_COUNT+1,");
		buffer.append(" LAST_VIEWED_DATE=now(),");
		buffer.append(" LAST_VIEWED_IP='"+bean.getLast_viewed_ip()+"'");
		buffer.append(" WHERE ACCOUNT_ID="+bean.getAccount_id());
		return buffer.toString();
	}
	
	public AccountBean getAccountByUsername(String username) throws SQLException{
		AccountBean bean = null;
		Collection col = DAOHelper.getInstance().query("SELECT * FROM ACCOUNT WHERE lower(USERNAME)=lower('"+username+"')");

		HashMap hm;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new AccountBean(hm);
		}
		return bean;
	}
	
	public AccountBean getAccountByAccountId(String id) throws SQLException{
		AccountBean bean = null;
		Collection col = DAOHelper.getInstance().query("SELECT * FROM ACCOUNT WHERE ACCOUNT_ID="+id);
		HashMap hm = null;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new AccountBean(hm);
		}
		return bean;
	}
	
	public AccountBean getAccount(MyProductBean bean0) throws SQLException{
		AccountBean bean = null;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT a.*");
		buffer.append(" FROM ACCOUNT a,MY_PRODUCT b");
		buffer.append(" WHERE a.ACCOUNT_ID=b.ACCOUNT_ID");
		buffer.append(" AND upper(b.SN)=upper('"+bean0.getSn()+"')");
		buffer.append(" AND upper(b.MAC)=upper('"+bean0.getMac()+"')");
		Collection col = DAOHelper.getInstance().query(buffer.toString());
		HashMap hm;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new AccountBean(hm);
		}
		return bean;		
	}
	
	public String checkUsername(String username,Locale locale) throws SQLException{ 
		String rst = "";
		if(username.trim().equals("")){
			rst = BundleUtil.getResource("","USERNAME_CAN_NOT_BE_NULL",locale);
			return rst;
		}
		if(username.trim().length()<AccountBean.INT_MINIMUM_ACCOUNT_LENGTH){
			rst = BundleUtil.getResource("","USERNAME_LENGTH_IS_NOT_ENOUGH",locale);
			return rst;
		}
		if(!AccountBean.isAllCharsValid(username)){
			rst = BundleUtil.getResource("","USERNAME_VALIDATOR_SUMMARY",locale);
			return rst;
		}
		AccountBean mab = getAccountByUsername(username);
		if(mab==null){
			return BundleUtil.getResource("","USERNAME_IS_AVAILABLE",locale);
		}else{
			return BundleUtil.getResource("","USERNAME_IS_NOT_AVAILABLE",locale);
		}
	}
	
	public boolean checkAccountSubscription(BigDecimal account_id, String subscription_code) throws SQLException{
	    StringBuffer sql = new StringBuffer();
	    Collection coldata = null;
	    boolean flag = false;

	    sql.append("select * from ACCOUNT where ACCOUNT_ID=");
	    sql.append(account_id);
	    sql.append(" and SUBSCRIPTION_CODE='");
	    sql.append(subscription_code + "'");
        
	    coldata = DAOHelper.getInstance().query(sql.toString());

	    if(coldata != null && coldata.size() >0) {
	    	flag = true;
	    }  //IF end
	    return flag;
	  }
	
	public boolean checkAccountStatus(BigDecimal account_id, String subscription_code) throws SQLException{
	    StringBuffer sql = new StringBuffer();
	    Collection col = null;
	    boolean flag = false;

	    sql.append("SELECT * FROM ACCOUNT WHERE ACCOUNT_ID=");
	    sql.append(account_id);
	    sql.append(" AND SUBSCRIPTION_CODE='");
	    sql.append(subscription_code + "'");
	    sql.append(" AND STATUS='INITIATION' ");

	    col = DAOHelper.getInstance().query(sql.toString());

	    if(col != null && col.size() >0) {
	    	flag = true;
	    }
	    return flag;
	  }
	
	public String getChangeUsernamePasswordSQL(AccountBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE ACCOUNT");
		buffer.append(" SET");
		buffer.append(" USERNAME='"+bean.getUsername()+"',");
		buffer.append(" PASSWORD='"+PasswordCoder.encode(bean.getPassword())+"',");
		buffer.append(" UPDATE_DATE=now()");
		buffer.append(" WHERE ACCOUNT_ID="+bean.getAccount_id());
		buffer.append(" AND upper(STATUS) = 'ACTIVATION'");
		return buffer.toString();		
	}
	
	public int clearActivationExpired() throws SQLException{
		 StringBuffer buffer = new StringBuffer();
		 buffer.append(" DELETE FROM ACCOUNT WHERE STATUS = 'INITIATION'");
		 buffer.append(" AND to_days(now()) - to_days(CREATE_DATE) >  7");
		 return DAOHelper.getInstance().executeSQL(buffer.toString());
	}
	
	public MyAccountBean getMyAccountByUsername(String username) throws SQLException{
		MyAccountBean bean = null;
		Collection col = DAOHelper.getInstance().query("SELECT * FROM ACCOUNT WHERE lower(USERNAME)=lower('"+username+"')");

		HashMap hm;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new MyAccountBean(hm);
		}
		return bean;
	}
	
	public MyAccountBean getMyAccountByAccountId(String id) throws SQLException{
		MyAccountBean bean = null;
		Collection col = DAOHelper.getInstance().query("SELECT * FROM ACCOUNT WHERE ACCOUNT_ID="+id);

		HashMap hm = null;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new MyAccountBean(hm);
		}
		return bean;
	}
}
