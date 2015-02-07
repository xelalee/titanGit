package com.titan.base.product.dao;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Collection;
import java.util.Iterator;
import java.util.HashMap;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.product.bean.ModelBean;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.exception.MyProductInsertException;
import com.titan.base.product.exception.MyProductReinstallException;
import com.titan.base.product.exception.MyProductRenameException;
import com.titan.base.service.dao.MyServiceDAO;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.base.jdbc.DAOHelper;

public class MyProductDAO {
	
	private static MyProductDAO instance = new MyProductDAO();
	public static MyProductDAO getInstance(){
		return instance;
	}

	public int insert(MyProductBean bean) throws MyProductInsertException{
		try{
			return DAOHelper.getInstance().executeSQL(getInsertSQL(bean));
		}catch(SQLException ex){
			throw new MyProductInsertException();
		}		
	}
	
	public String getInsertSQL(MyProductBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" insert into MY_PRODUCT(MY_PRODUCT_ID,ACCOUNT_ID,");
		buffer.append(" MODEL_ID,SN,MAC,");
		buffer.append(" FRIENDLY_NAME,STATUS,CREATE_DATE,CREATE_BY,");
		buffer.append(" UPDATE_DATE,UPDATE_BY,COUNT");
		buffer.append(" ) values(");
		buffer.append(bean.getMy_product_id());
		buffer.append(" ,"+bean.getAccount_id().toLowerCase(Keys.DEFAULT_LOCALE));
		buffer.append(" ,"+bean.getModel_id());
		buffer.append(" ,'"+bean.getSn().toUpperCase(Keys.DEFAULT_LOCALE)+"'");
		buffer.append(" ,'"+bean.getMac().toUpperCase(Keys.DEFAULT_LOCALE)+"'");
		buffer.append(" ,'"+bean.getFriendly_name()+"'");
		buffer.append(" ,'"+bean.getStatus()+"'");
		buffer.append(" ,now()");
		buffer.append(" ,'"+bean.getCreate_by()+"'");
		buffer.append(" ,now()");
		buffer.append(" ,'"+bean.getUpdate_by()+"'");
		buffer.append(" ,"+bean.getCount());
		buffer.append(" )");
		return buffer.toString();
	}
	
    public String getRenameSQL(MyProductBean bean){
        StringBuffer buffer = new StringBuffer();
        buffer.append(" UPDATE MY_PRODUCT");
        buffer.append(" SET FRIENDLY_NAME='"+bean.getFriendly_name()+"',");
        buffer.append(" UPDATE_DATE=now(),");
        buffer.append(" UPDATE_BY='"+bean.getUpdate_by()+"'");
        buffer.append(" WHERE MY_PRODUCT_ID="+bean.getMy_product_id());
        return buffer.toString();       
    }
    
    public String getUpdateAcSQL(MyProductBean bean){
        StringBuffer buffer = new StringBuffer();
        buffer.append(" UPDATE MY_PRODUCT");
        buffer.append(" SET MAC='" + bean.getMac() +"'");
        buffer.append(" WHERE MY_PRODUCT_ID=" + bean.getMy_product_id());
        return buffer.toString();
    }
    
	public int rename(MyProductBean bean) throws MyProductRenameException{		
		try{
			return DAOHelper.getInstance().executeSQL(getRenameSQL(bean));
		}catch(SQLException ex){
			throw new MyProductRenameException();
		}
	}
	
	/**
	 * reinstall product
	 * @param oldsn
	 * @param newsn
	 * @param newmac
	 * @return
	 * @throws SQLException 
	 * @throws MyProductReinstallException
	 */
	public int reinstall(String oldsn, String newsn,String newmac,AccountBean accountBean) throws SQLException {
		//reset device
		resetProduct(newsn);

		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE MY_PRODUCT");
		buffer.append(" SET SN='"+newsn.trim().toUpperCase(Keys.DEFAULT_LOCALE)+"',");
		buffer.append(" MAC='"+newmac.trim().toUpperCase(Keys.DEFAULT_LOCALE)+"',");
		buffer.append(" UPDATE_DATE=now(),");
		buffer.append(" UPDATE_BY='"+accountBean.getUsername()+"'");
		buffer.append(" WHERE upper(SN)=upper('"+oldsn.trim()+"')");
		
		return DAOHelper.getInstance().executeSQL(buffer.toString());

	}
	
	/**
	 * reset registered device
	 * @param sn
	 * @throws SQLException 
	 */
	public void resetProduct(String sn) throws SQLException {
		MyProductBean bean = getProductBySn(sn.trim());
		if(bean!=null){
			List<String> sqls=new ArrayList<String>();
			StringBuffer buffer;
			//update my_service
			buffer = new StringBuffer();
			buffer.append(" DELETE FROM MY_SERVICE");
			buffer.append(" WHERE MY_PRODUCT_ID="+bean.getMy_product_id());
			sqls.add(buffer.toString());
			
			//update license key
			buffer = new StringBuffer();
			buffer.append(" delete FROM MY_PRODUCT");
			buffer.append(" WHERE MY_PRODUCT_ID="+bean.getMy_product_id());
			sqls.add(buffer.toString());
			DAOHelper.getInstance().executeSQL(sqls);				
		}
	}
	
	public int delete(MyProductBean bean) throws SQLException{
		return DAOHelper.getInstance().executeSQL(getDeleteSQL(bean));

	}
	
	public String getDeleteSQL(MyProductBean bean){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" DELETE FROM MY_PRODUCT");
		buffer.append(" WHERE MY_PRODUCT_ID="+bean.getMy_product_id());
		return buffer.toString();
	}
	
	/**
	 * get product by serial number
	 * @param sn
	 * @return
	 * @throws SQLException 
	 */
    public MyProductBean getProductBySn(String sn) throws SQLException{
    	MyProductBean bean = null;
        StringBuffer sql = new StringBuffer();
        
        sql.append(" SELECT a.*,b.MODEL_NAME");
        sql.append(" FROM MY_PRODUCT a LEFT JOIN MODEL b on a.MODEL_ID=b.MODEL_ID");
        sql.append(" WHERE upper(a.SN)=upper('"+sn.trim()+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());

        HashMap hm;
        for(Iterator it=col.iterator();it.hasNext();){
        	hm = (HashMap)it.next();
        	bean = new MyProductBean(hm);
        	bean.setModel(new ModelBean(hm));
        }
        return bean;
    }
    
    public MyProductBean getByMyProductId(String my_product_id) throws SQLException{
    	MyProductBean bean = null;
        StringBuffer sql = new StringBuffer();
        
        sql.append(" SELECT a.*,b.MODEL_NAME");
        sql.append(" FROM MY_PRODUCT a LEFT JOIN MODEL b on a.MODEL_ID=b.MODEL_ID");
        sql.append(" WHERE a.MY_PRODUCT_ID="+my_product_id);
        Collection col = DAOHelper.getInstance().query(sql.toString());
     
        HashMap hm;
        for(Iterator it=col.iterator();it.hasNext();){
        	hm = (HashMap)it.next();
        	bean = new MyProductBean(hm);
        	bean.setModel(new ModelBean(hm));
        }
        return bean;
    }    
    
	/**
	 * get product by mac address
	 * @param mac
	 * @return
	 * @throws SQLException 
	 */
    public MyProductBean getProductByMac(String mac) throws SQLException {
    	MyProductBean bean = null;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT a.*,b.MODEL_NAME");
        sql.append(" FROM MY_PRODUCT a LEFT JOIN MODEL b on a.MODEL_ID=b.MODEL_ID");  
        sql.append(" WHERE upper(a.MAC)=upper('"+mac.trim()+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        HashMap hm;
        for(Iterator it=col.iterator();it.hasNext();){
        	hm = (HashMap)it.next();
        	bean = new MyProductBean(hm);
        	bean.setModel(new ModelBean(hm));
        }
        return bean;
    } 
    
    /**
     * get product by serial number or mac address
     * @param sn
     * @param mac
     * @return
     * @throws SQLException
     */
    public MyProductBean getProductBySnMac(String sn, String mac) throws SQLException {
    	MyProductBean bean = null;
    	if(sn.trim().equals("") && mac.trim().equals("")){
    		return null;
    	}
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT a.*,b.MODEL_NAME");
        sql.append(" FROM MY_PRODUCT a LEFT JOIN MODEL b on a.MODEL_ID=b.MODEL_ID");  
        sql.append(" WHERE 1=1");
        if(!sn.trim().equals("")){
        	sql.append(" AND upper(a.SN)=upper('"+sn.trim()+"')");
        }
        if(!mac.trim().equals("")){
        	sql.append(" AND upper(a.MAC)=upper('"+mac.trim()+"')");
        }
        
        Collection col = DAOHelper.getInstance().query(sql.toString());
        HashMap hm;
        for(Iterator it=col.iterator();it.hasNext();){
        	hm = (HashMap)it.next();
        	bean = new MyProductBean(hm);
        	bean.setModel(new ModelBean(hm));
        }
        return bean;
    } 
    
    /**
     * get by serial number AND friendly name
     * @param sn
     * @param fn
     * @return
     * @throws SQLException 
     */
    public MyProductBean getProductBySn_Fn(String sn,String fn) throws SQLException{
    	MyProductBean bean = null;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT a.*,b.MODEL_NAME");
        sql.append(" FROM MY_PRODUCT a LEFT JOIN MODEL b on a.MODEL_ID=b.MODEL_ID");   
        sql.append(" WHERE upper(a.SN)=upper('"+sn.trim()+"')");
        sql.append(" AND a.FRIENDLY_NAME='"+fn.trim()+"'");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        HashMap hm;
        for(Iterator it=col.iterator();it.hasNext();){
        	hm = (HashMap)it.next();
        	bean = new MyProductBean(hm);
        	bean.setModel(new ModelBean(hm));
        }
        return bean;
    }
    
    public Collection getProductByAccount_id(String account_id) throws SQLException{
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT a.*,b.MODEL_NAME");
        sql.append(" FROM MY_PRODUCT a LEFT JOIN MODEL b on a.MODEL_ID=b.MODEL_ID");  
        sql.append(" WHERE a.ACCOUNT_ID="+account_id);
        sql.append(" AND COALESCE(upper(a.STATUS),' ') not in ('DELETE','TRAN_DELETE','REINSTALL_DELETE')");
        sql.append(" order by a.MY_PRODUCT_ID desc");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        return col;
    }
    
	/**
	 * to check is any standard service activated on the device
	 * @param sn
	 * @return
	 * @throws SQLException 
	 */
	public boolean isAnyStandardServiceActivated(String sn) throws SQLException{
		return MyServiceDAO.getInstance().hasStandardService(sn.trim());

	}
	
	public Collection getExistProductInfo(String serial_num) throws SQLException {
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT *");
        sql.append(" FROM MY_PRODUCT");
        sql.append(" WHERE COALESCE(upper(STATUS),' ') not in ('DELETE','TRAN_DELETE','REINSTALL_DELETE')");
        sql.append(" AND upper(SN) =upper('"+serial_num+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        return col;
    }
	
    public boolean CheckDupAC(String ac) throws SQLException{
        boolean result = false;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT MODEL_ID");
        sql.append(" FROM MY_PRODUCT");
        sql.append(" WHERE COALESCE(upper(STATUS),' ') not in ('DELETE','TRAN_DELETE','REINSTALL_DELETE')");
        sql.append(" AND upper(MAC) =upper('");
        sql.append(ac+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        if(col != null && col.size() >0) {
            result = true;
        }
        return result;
    }
    
    public String getTransferSQL(String old_account_id, String new_account_id, String my_product_id){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE MY_PRODUCT");
		buffer.append(" SET ACCOUNT_ID="+new_account_id);
		buffer.append(" ,UPDATE_DATE=now()");
		buffer.append(" WHERE MY_PRODUCT_ID="+my_product_id);
		return buffer.toString();
	}
    
    public boolean hasService(String new_sn) throws SQLException{
   	    boolean result = false;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT my_service_id ");
        sql.append(" FROM MY_PRODUCT mp, MY_SERVICE ms ");
        sql.append(" WHERE ");
        sql.append(" mp.my_product_id = ms.my_product_id ");
        sql.append(" AND upper(mp.SN) = upper('");
        sql.append(new_sn + "')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        if(col != null && col.size() > 0){
            result = true;
        }
        return result;
   }
    
	public String getDelProdSQL(String myproductid){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" DELETE FROM MY_PRODUCT WHERE MY_PRODUCT_ID = ");
		buffer.append(myproductid);
		return buffer.toString();
	}
	
	public String getSNByAC(String ac) throws SQLException{
        String sn = "";
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT MODEL_ID,ACCOUNT_ID,SN FROM MY_PRODUCT WHERE upper(MAC) = upper('");
        sql.append(ac+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
        if(col != null){
            for(Iterator it=col.iterator(); it.hasNext(); ){
                HashMap hmp = (HashMap)it.next();
                sn = Util.getString(hmp.get("SN"));
            }
        }
        return sn;
    }
	
	public boolean hasServiceByName(String sn,BigDecimal nameID) throws SQLException{
        boolean result = false;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT MY_SERVICE_ID ");
        sql.append(" FROM MY_PRODUCT mp, MY_SERVICE ms ");
        sql.append(" WHERE ");
        sql.append(" mp.MY_PRODUCT_ID = ms.MY_PRODUCT_ID ");
        sql.append(" AND upper(mp.SN) = upper('");
        sql.append(sn + "') AND ms.MY_SERVICE_ID_ID = ");
        sql.append(nameID);
        Collection col = DAOHelper.getInstance().query(sql.toString());
        if(col != null && col.size() > 0){
            result = true;
        }
        return result;
	}
	
	public String getUpdateProductSQL(String new_sn,String new_ac,String old_sn){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" UPDATE MY_PRODUCT");
		buffer.append(" SET SN='");
		buffer.append(new_sn + "',MAC='");
		buffer.append(new_ac + "',UPDATE_DATE=now()");
		buffer.append(" WHERE UPPER(SN) = UPPER('");
		buffer.append(old_sn + "')");
		buffer.append(" AND COALESCE(upper(STATUS),' ') not in ('DELETE','TRAN_DELETE','REINSTALL_DELETE')");
		return buffer.toString();
	}
	
	public String getUpdateServiceSQL(String new_sn,String old_sn){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" UPDATE MY_SERVICE"); 
		buffer.append(" SET MY_PRODUCT_ID = ");
		buffer.append("(SELECT MY_PRODUCT_ID FROM MY_PRODUCT WHERE upper(SN)='"+new_sn.toUpperCase()+"')");
		buffer.append(" WHERE MY_PRODUCT_ID = ");
		buffer.append("(SELECT MY_PRODUCT_ID FROM MY_PRODUCT WHERE upper(SN)='"+old_sn.toUpperCase()+"')");
		
		return buffer.toString();
	}

	
}
