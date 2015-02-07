package com.titan.base.service.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.apache.log4j.Logger;

import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.service.bean.MyServiceBean;
import com.titan.base.util.Keys;
import com.titan.base.jdbc.DAOHelper;

public class MyServiceDAO {

	public final static String CHECK_PRODUCT_SUPPORT_SERVICE = "CHECK_PRODUCT_SUPPORT_SERVICE";
	public final static String CHECK_TRIAL_NEVER_ACTIVATED = "CHECK_TRIAL_NEVER_ACTIVATED";
	public final static String CHECK_LK_EXIST = "CHECK_LK_EXIST";
	public final static String CHECK_LK_NEVER_USED = "CHECK_LK_NEVER_USED";
	public final static String CHECK_ICARD_TYPE_MATCH_PRODUCT = "CHECK_ICARD_TYPE_MATCH_PRODUCT";
	public final static String CHECK_LK_REUSED = "CHECK_LK_REUSED";
	
	static Logger logger = Logger.getLogger(MyServiceDAO.class);
	
	private static MyServiceDAO instance = new MyServiceDAO();
	public static MyServiceDAO getInstance(){
		return instance;
	}
	
	public MyServiceBean getMyServiceByID(String my_service_id) throws SQLException{
		MyServiceBean bean = new MyServiceBean();
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT ms.*,sn.SERVICE_NAME FROM MY_SERVICE ms LEFT JOIN SERVICE sn");
		buffer.append(" on ms.SERVICE_ID=sn.SERVICE_ID");
		buffer.append(" WHERE ms.MY_SERVICE_ID="+my_service_id);
		Collection col  = DAOHelper.getInstance().query(buffer.toString());
		HashMap hm;
		for(Iterator it=col.iterator();it.hasNext();){
			hm = (HashMap)it.next();
			bean = new MyServiceBean(hm);
		}
		return bean;
	}
	
	/**
	 * get myservice by MY_PRODUCT_ID AND service_id
	 * @param my_product_id
	 * @param service_id
	 * @return
	 * @throws SQLException 
	 */
	public MyServiceBean getMyService(String my_product_id, String service_id) throws SQLException{
		MyServiceBean myservice = null;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT ms.*,sn.SERVICE_NAME FROM MY_SERVICE ms LEFT JOIN SERVICE sn");
		buffer.append(" on ms.SERVICE_ID=sn.SERVICE_ID");
		buffer.append(" WHERE ms.MY_PRODUCT_ID="+my_product_id);
		buffer.append(" AND ms.SERVICE_ID="+service_id);
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			myservice = new MyServiceBean(hm);
		}
		return myservice;		
	}
	
	public List<MyServiceBean> getServicesByProductId(String my_product_id) throws SQLException{
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" SELECT ms.*,sn.SERVICE_NAME FROM MY_SERVICE ms LEFT JOIN SERVICE sn");
		buffer.append(" on ms.SERVICE_ID=sn.SERVICE_ID");
		buffer.append(" WHERE ms.MY_PRODUCT_ID="+my_product_id);
		buffer.append(" ORDER BY ms.SERVICE_ID");
		
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(buffer.toString());

		List<MyServiceBean> list = new ArrayList<MyServiceBean>();
		
		if(col!=null){
			for(HashMap<String, Object> hm : col){
				MyServiceBean bean = new MyServiceBean(hm);
				list.add(bean);
			}
		}
		
		return list;
	}
	
	public List<MyServiceBean> getServicesBySN(String sn) throws SQLException{
		
		List<MyServiceBean> list = new ArrayList<MyServiceBean>();
		
		MyProductBean product = MyProductDAO.getInstance().getProductBySn(sn);
		
		if(product==null){
			return list;
		}
		
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" SELECT ms.*,sn.SERVICE_NAME FROM MY_SERVICE ms LEFT JOIN SERVICE sn");
		buffer.append(" on ms.SERVICE_ID=sn.SERVICE_ID");
		buffer.append(" WHERE ms.MY_PRODUCT_ID="+product.getMy_product_id());
		buffer.append(" ORDER BY ms.SERVICE_ID");
		
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().query(buffer.toString());

		
		if(col!=null){
			for(HashMap<String, Object> hm : col){
				MyServiceBean bean = new MyServiceBean(hm);
				list.add(bean);
			}
		}
		
		return list;
	}
	
	public int insert(MyServiceBean msbean) throws SQLException{
		return DAOHelper.getInstance().executeSQL(getInsertSQL(msbean));

	}
	
	public String getInsertSQL(MyServiceBean msbean){
		StringBuffer buffer = new StringBuffer();

		buffer.append(" INSERT INTO MY_SERVICE(MY_SERVICE_ID,MY_PRODUCT_ID,SERVICE_ID,SERVICE_TYPE_ID,");
		buffer.append(" SERVICE_CODE,EXPIRATION_DATE,SUSPEND_COUNT,STATUS,REMARK,BEGIN_DATE,");
		buffer.append(" VALUE,ORIGINAL_DATE,UPDATE_DATE)");
		buffer.append(" values("+msbean.getMy_service_id());
		buffer.append(" ,"+msbean.getMy_product_id());
		buffer.append(" ,"+msbean.getService_id());
		buffer.append(" ,'"+msbean.getService_type_id() + "'");
		buffer.append(" ,'"+msbean.getService_code()+"'");
		buffer.append(" ,'"+msbean.getExpiration_date()+"'");
		buffer.append(" ,0");
		buffer.append(" ,'"+MyServiceBean.STR_INSTALLED+"'");
		buffer.append(" ,'"+msbean.getRemark()+"'");
		buffer.append(" ,'"+msbean.getBegin_date()+"'");
		buffer.append(" ,"+msbean.getValue());
		buffer.append(" ,'"+msbean.getExpiration_date()+"'");
		buffer.append(" ,now())");
		
		return buffer.toString().trim();
	}
	
	public int update(MyServiceBean msbean) throws SQLException{
		return DAOHelper.getInstance().executeSQL(getUpdateSQL(msbean));

	}
       
	public String getUpdateSQL(MyServiceBean msbean){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" UPDATE MY_SERVICE");
		buffer.append(" SET EXPIRATION_DATE = '"+msbean.getExpiration_date()+"'");
		buffer.append(" ,ORIGINAL_DATE = '"+msbean.getOriginal_date()+"'");
		buffer.append(" ,SERVICE_TYPE_ID = '"+msbean.getService_type_id()+"'");
		buffer.append(" ,SERVICE_CODE = '"+msbean.getService_code()+"'");
		buffer.append(" ,STATUS='"+Keys.STR_INSTALLED+"'");
		buffer.append(" ,REMARK='"+msbean.getRemark()+"'");
        buffer.append(" ,VALUE='" +msbean.getValue() +"'");
        buffer.append(" ,UPDATE_DATE=now()");
		buffer.append(" WHERE MY_SERVICE_ID = "+msbean.getMy_service_id());
		
		return buffer.toString();
	}	
	
	/**
	 * to check whether device has activated trial service
	 * @param MY_PRODUCT_ID
	 * @param SERVICE_ID
	 * @return boolean
	 * @throws SQLException 
	 */
	public boolean isTrialActivated(String MY_PRODUCT_ID, String SERVICE_ID) throws SQLException{
		boolean rst = false;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT * FROM MY_SERVICE");
		buffer.append(" WHERE MY_PRODUCT_ID="+MY_PRODUCT_ID);
		buffer.append(" AND SERVICE_ID="+SERVICE_ID);
		
		Collection col = DAOHelper.getInstance().query(buffer.toString());

		if(col!=null){
			if(col.size()>0){
				rst = true;
			}
		}
		return rst;		
	}
	
	/**
	 * get whether product support service information
	 * @param mac
	 * @param lk
	 * @return
	 * @throws SQLException 
	 */
	public Collection getCheckTrialInfo(String mac, String lk) throws SQLException{
		Collection rst = null;
		if(mac.equals("")||lk.equals("")||lk.length()!=8){
			return rst;
		}
		String service_type_id = lk.substring(0, 1);
		String service_code = lk.substring(2, 8);
		
		StringBuffer buffer = new StringBuffer();

		buffer.append(" SELECT 1 seq, '"+MyServiceDAO.CHECK_PRODUCT_SUPPORT_SERVICE+"' REG_CHECK,"); 
		buffer.append(" case when count(*)>0 then 'true'");
		buffer.append(" else 'false' end VALUE");
		buffer.append(" FROM MY_PRODUCT mp LEFT JOIN MODEL2SERVICE m2s");
		buffer.append(" on mp.MODEL_ID=m2s.MODEL_ID");
		buffer.append(" WHERE mp.MAC='"+mac+"'"); 
		buffer.append(" AND m2s.SERVICE_TYPE_ID='"+service_type_id+"'");
		buffer.append(" AND m2s.SERVICE_CODE='"+service_code+"'");
		
		rst = DAOHelper.getInstance().query(buffer.toString());

		return rst;
	}
	
	/**
	 * get check information before register service
	 * @param mac
	 * @param lk
	 * @return
	 * @throws SQLException 
	 */
	public Collection getCheckInfo(String mac, String lk) throws SQLException{
		Collection rst = null;
		if(mac.equals("")||lk.equals("")||lk.length()<8){
			return rst;
		}
		String service_type_id = lk.substring(0, 1);
		String service_code = lk.substring(2, 8);
		
		StringBuffer buffer = new StringBuffer();

		buffer.append(" SELECT 1 seq, '"+MyServiceDAO.CHECK_PRODUCT_SUPPORT_SERVICE+"' REG_CHECK,"); 
		buffer.append(" case when count(*)>0 then 'true'");
		buffer.append(" else 'false' end VALUE");
		buffer.append(" FROM MY_PRODUCT mp LEFT JOIN MODEL2SERVICE m2s");
		buffer.append(" on mp.MODEL_ID=m2s.MODEL_ID");
		buffer.append(" WHERE mp.MAC='"+mac+"'"); 
		buffer.append(" AND m2s.SERVICE_TYPE_ID='"+service_type_id+"'");
		buffer.append(" AND m2s.SERVICE_CODE='"+service_code+"'");

		buffer.append(" union");

		buffer.append(" SELECT 2 seq, '"+MyServiceDAO.CHECK_LK_EXIST+"' REG_CHECK,"); 
		buffer.append(" case when count(*)>0 then 'true'");
		buffer.append(" else 'false' end VALUE");
		buffer.append(" FROM LICENSE");
		buffer.append(" WHERE LICENSE_KEY='"+lk+"'");

		buffer.append(" union");
		
		buffer.append(" SELECT 3 seq, '"+MyServiceDAO.CHECK_LK_NEVER_USED+"' REG_CHECK,"); 
		buffer.append(" case when count(*)>0 then 'true'");
		buffer.append(" else 'false' end VALUE");
		buffer.append(" FROM LICENSE");
		buffer.append(" WHERE LICENSE_KEY='" + lk + "'");
		buffer.append(" AND MY_SERVICE_ID is null");

		buffer.append(" union");
		
		buffer.append(" SELECT 4 seq, '"+MyServiceDAO.CHECK_ICARD_TYPE_MATCH_PRODUCT+"' REG_CHECK,"); 
		buffer.append(" case when count(*)>0 then 'true'"); 
		buffer.append(" else 'false' end VALUE"); 
		buffer.append(" FROM"); 
		buffer.append(" (SELECT m2i.CARD_TYPE"); 
		buffer.append(" FROM MY_PRODUCT mp LEFT JOIN MODEL m2i"); 
		buffer.append(" on mp.MODEL_ID = m2i.MODEL_ID"); 
		buffer.append(" WHERE mp.MAC='"+mac+"'");
		buffer.append(" ) a,"); 
		buffer.append(" (SELECT * FROM LICENSE lk"); 
		buffer.append(" WHERE lk.LICENSE_KEY='"+lk+"') b"); 
		buffer.append(" WHERE b.CARD_TYPE like concat(a.CARD_TYPE,'%')");	
 
		buffer.append(" union");
		buffer.append(" SELECT 5 seq, '"+MyServiceDAO.CHECK_LK_REUSED+"' REG_CHECK,"); 
		buffer.append(" case when count(*)>0 then 'true'");
		buffer.append(" else 'false' end VALUE");
		buffer.append(" FROM LICENSE lk,MY_SERVICE ms,MY_PRODUCT mp");
		buffer.append(" WHERE lk.MY_SERVICE_ID=ms.MY_SERVICE_ID");
		buffer.append(" AND ms.MY_PRODUCT_ID=mp.MY_PRODUCT_ID");
		buffer.append(" AND lk.LICENSE_KEY='" + lk + "'");
		buffer.append(" AND mp.MAC='"+mac+"'");
		
		rst = DAOHelper.getInstance().query(buffer.toString());
		
		return rst;
	}
	
	public boolean hasStandardService(String sn) throws SQLException{
   	    boolean result = false;
        List<MyServiceBean> list = getServicesBySN(sn);

        if(list != null && list.size() > 0){
        	for (MyServiceBean myservice: list){
        		if(myservice.getService_type_id().equalsIgnoreCase("S")){
        			return true;
        		}
        	}
        }
        return result;
   }
	
	public boolean hasTrialService(String sn) throws SQLException{
   	    boolean result = false;
        List<MyServiceBean> list = getServicesBySN(sn);

        if(list != null && list.size() > 0){
        	for (MyServiceBean myservice: list){
        		if(myservice.getService_type_id().equalsIgnoreCase("T")){
        			return true;
        		}
        	}
        }
        return result;
   }

	public String getDelServiceSQL(String myproductid){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" DELETE FROM MY_SERVICE WHERE MY_PRODUCT_ID = ");
		buffer.append(myproductid);
		return buffer.toString();
	}
	
	public int arrangeServiceStatus() throws SQLException{
		 StringBuffer buffer = new StringBuffer();
		 buffer.append("UPDATE MY_SERVICE SET STATUS='Expired' ");
		 buffer.append("WHERE now()>EXPIRATION_DATE AND upper(STATUS)!='EXPIRED' ");
		 return DAOHelper.getInstance().executeSQL(buffer.toString());
	}

}
