package com.titan.base.product.dao;

import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.product.bean.ProductBean;
import com.titan.base.util.Util;
import com.titan.base.jdbc.DAOHelper;

public class ProductDAO {
	
	static Logger logger = Logger.getLogger(ProductDAO.class);
	
	private static ProductDAO instance = new ProductDAO();
	
	public static ProductDAO getInstance(){
		return instance;
	}
	
	public int save(List<ProductBean> products) throws SQLException{
		int effects = 0;
		if(products!=null){
			List<String> sqls = new ArrayList<String>();
			for(ProductBean bean: products){
				String sql = this.getInsertSQL(bean);
				sqls.add(sql);
			}
			effects = DAOHelper.getInstance().executeSQL(sqls);
		}
		
		return effects;
	}
	
	public int insert_or_update(ProductBean bean){
		int effects = 0;
		try {
			effects = insert(bean);
		} catch (SQLException e) {
			e.printStackTrace();
		}
		if(effects==0){
			try {
				effects = update(bean);
			} catch (SQLException e) {
				e.printStackTrace();
			}			
		}
		return effects;
	}
	
    public int insert(ProductBean bean) throws SQLException{
    	return DAOHelper.getInstance().executeSQL(this.getInsertSQL(bean));
    }
    
    public String getInsertSQL(ProductBean bean){
    	StringBuffer buffer = new StringBuffer();
    	buffer.append(" INSERT INTO PRODUCT(SN,MAC,MODEL_ID,CREATE_DATE)");
    	buffer.append(" VALUES(");
    	buffer.append(" '"+bean.getSn()+"',");
    	buffer.append(" '"+bean.getMac()+"',");
    	buffer.append(" "+bean.getModel_id()+",");
		buffer.append("now())");
		
    	return buffer.toString();
    }
    
    public int update(ProductBean bean) throws SQLException{
    	StringBuffer buffer = new StringBuffer();
    	buffer.append(" UPDATE PRODUCT");
    	buffer.append(" SET SN='"+bean.getSn()+"',");
    	buffer.append(" MODEL_ID="+bean.getModel_id()+",");
    	buffer.append(" CREATE_DATE=now()");
    	buffer.append(" WHERE MAC='"+bean.getMac()+"'");
    	return DAOHelper.getInstance().executeSQL(buffer.toString());
    }
    
    public static Collection getByMacOrSn(String mac, String sn) throws SQLException{
    	StringBuffer buffer = new StringBuffer();
    	buffer.append(" SELECT *");
    	buffer.append(" FROM PRODUCT");
    	buffer.append(" WHERE SN='"+sn.trim()+"'");
    	buffer.append(" or MAC='"+mac.trim()+"'");
    	return DAOHelper.getInstance().query(buffer.toString());
    }
	
	public ProductBean getProductBySN(String sn) throws SQLException{
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT * FROM PRODUCT");
		buffer.append(" WHERE upper(SN)=upper('"+sn+"')");
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		ProductBean bean = null;
		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			bean = new ProductBean(hm);
		}
		return bean;
	}
	
	public ProductBean getProductByMAC(String mac) throws SQLException {
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT * FROM PRODUCT");
		buffer.append(" WHERE upper(MAC)=upper('"+mac+"')");
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		ProductBean bean = null;
		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			bean = new ProductBean(hm);
		}
		return bean;		
	}

	public Collection getInforBySn(String sn) throws SQLException{
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT c.MODEL_NAME,a.MODEL_ID");
        sql.append(" FROM PRODUCT a LEFT JOIN MODEL c on a.MODEL_ID=c.MODEL_ID");
        sql.append(" WHERE upper(a.SN) = upper('"+sn+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());

        return col;
    }
	
	public Collection<HashMap<String,Object>> getProductBySnMac(String sn, String mac) throws SQLException{
		if(sn.equals("") && mac.equals("")){
			return new ArrayList();
		}
        StringBuffer sql = new StringBuffer();
        
        sql.append(" SELECT a.*,c.MODEL_NAME");
        sql.append(" FROM PRODUCT a LEFT JOIN MODEL c on a.MODEL_ID=c.MODEL_ID");
        sql.append(" WHERE 1=1");
        if(!sn.equalsIgnoreCase("")){
        	sql.append(" and upper(a.SN) = upper('"+sn+"')");
        }
        if(!mac.equals("")){
        	sql.append(" and upper(a.MAC) = upper('"+mac+"')");  
        }
        
        Collection<HashMap<String,Object>> col = DAOHelper.getInstance().query(sql.toString());

        return col;
    }	
	
	public Collection getCheckACInfo(String sn,String ac) throws SQLException {
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT MODEL_ID");
        sql.append(" FROM PRODUCT");
        sql.append(" WHERE upper(SN) =upper('");
        sql.append(sn+"')");
        sql.append(" AND upper(MAC) =upper('");
        sql.append(ac+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
    
        return col;
    }
	
    public boolean isNewACMatchSN(String ac,String sn) throws SQLException{
   	    boolean result = false;
        StringBuffer sql = new StringBuffer();
        sql.append(" SELECT * FROM PRODUCT");
        sql.append(" WHERE upper(MAC) = upper('");
        sql.append(ac + "') AND upper(SN) = upper('");
        sql.append(sn + "')");
        Collection col = DAOHelper.getInstance().query(sql.toString());
     
        if(col != null && col.size() > 0){
            result = true;
        }
        return result;
   }
    
    public String getSerialNumberByAC(String mac) throws SQLException{
        String SerialNumber = "";
        StringBuffer sql = new StringBuffer();

        sql.append("SELECT SN FROM PRODUCT ");
        sql.append("WHERE UPPER(MAC) = UPPER('"+mac+"')");
        Collection col = DAOHelper.getInstance().query(sql.toString());

        if(col != null){
            for(Iterator it=col.iterator(); it.hasNext(); ){
                HashMap hmp = (HashMap)it.next();
                SerialNumber = Util.getString(hmp.get("SN"));
            }
        }
        return SerialNumber;
    }
    
    public List<ProductBean> getByDate(String start_date, String end_date) throws SQLException{
        StringBuffer sql = new StringBuffer();
        
        sql.append(" SELECT p.*,m.MODEL_NAME");
        sql.append(" FROM PRODUCT p, MODEL m");
        sql.append(" WHERE p.MODEL_ID=m.MODEL_ID");
        sql.append(" AND  DATE_FORMAT(p.CREATE_DATE,'%Y-%c-%d')>=STR_TO_DATE('"+start_date+"','%Y-%c-%d')");
        sql.append(" AND DATE_FORMAT(p.CREATE_DATE,'%Y-%c-%d')<=STR_TO_DATE('"+end_date+"','%Y-%c-%d')");
        
        Collection<HashMap<String,Object>> col = DAOHelper.getInstance().query(sql.toString());
        
        List<ProductBean> products = new ArrayList<ProductBean>();
        
        for(HashMap<String,Object> hm: col){
        	ProductBean bean = new ProductBean(hm);
        	products.add(bean);
        }
        
        return products;
        
    }
    
    public int deleteByMac(String[] macList) throws SQLException{
    	List<String> sqls = new ArrayList<String>();
    	
    	for(String mac: macList){
    		sqls.add(this.getDeleteByMacSQL(mac));
    	}
    	
    	return DAOHelper.getInstance().executeSQL(sqls);
    }
    
    public String getDeleteByMacSQL(String mac){
        StringBuffer sql = new StringBuffer();
        
        sql.append(" DELETE FROM PRODUCT");    	
        sql.append(" WHERE MAC='"+mac+"'"); 
    	return sql.toString();
    	
    }
    
    public int deleteByDate(String targetDate) throws SQLException{
        StringBuffer sql = new StringBuffer();
        
        sql.append(" DELETE FROM PRODUCT");    	
        sql.append(" WHERE CREATE_DATE='"+targetDate+"'");    
        
        return DAOHelper.getInstance().executeSQL(sql.toString());
    }
}
