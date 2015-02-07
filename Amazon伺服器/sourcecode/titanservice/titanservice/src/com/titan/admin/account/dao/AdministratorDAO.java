package com.titan.admin.account.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import com.titan.admin.account.bean.AdministratorBean;
import com.titan.base.jdbc.DAOHelper;
import com.titan.base.system.dao.Sequence_idDao;
import com.titan.base.util.PasswordCoder;

public class AdministratorDAO {

	private static AdministratorDAO instance = new AdministratorDAO();

	public static AdministratorDAO getInstance() {
		return instance;
	}

	public AdministratorBean get(String username) throws SQLException {
		AdministratorBean bean = null;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT A.*,G.GROUP_NAME");
		buffer.append(" FROM ADMINISTRATOR A, GROUP_NAME G");
		buffer.append(" WHERE A.GROUP_ID=G.GROUP_ID");
		buffer.append(" AND A.USERNAME='" + username + "'");
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance()
				.query(buffer.toString());
		if (col.size() > 0) {
			HashMap<String, Object> hm = col.iterator().next();
			bean = new AdministratorBean(hm);
		}
		return bean;
	}
	
	public List<AdministratorBean> getAll() throws SQLException {
		List<AdministratorBean> list = new ArrayList<AdministratorBean>();
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance()
				.query(this.getAllSQL());
		for(HashMap<String, Object> hm: col) {
			AdministratorBean bean = new AdministratorBean(hm);
			list.add(bean);
		}
		return list;
	}
	
	public String getAllSQL(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT A.*,G.GROUP_NAME");
		buffer.append(" FROM ADMINISTRATOR A, GROUP_NAME G");
		buffer.append(" WHERE A.GROUP_ID=G.GROUP_ID");
		buffer.append(" ORDER BY A.ACCOUNT_ID");
		return buffer.toString();
	}
	
	public int add(AdministratorBean bean) throws SQLException {
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" INSERT INTO ADMINISTRATOR(ACCOUNT_ID, USERNAME, PASSWORD,"); 
		buffer.append(" EMAIL, GROUP_ID)VALUES(");
		buffer.append(Sequence_idDao.getInstance().getSEQ("ADMINISTRATOR"));
		buffer.append(",'"+bean.getUsername()+"'");
		buffer.append(",'"+PasswordCoder.encode(bean.getPassword())+"'");
		buffer.append(",'"+bean.getEmail()+"'");
		buffer.append(","+bean.getGroup_id()+" )");

		return DAOHelper.getInstance().executeSQL(buffer.toString());
	}
	
	public int update(AdministratorBean bean) throws SQLException {
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" UPDATE ADMINISTRATOR");
		buffer.append(" SET");
		buffer.append(" PASSWORD='"+PasswordCoder.encode(bean.getPassword())+"'");
		buffer.append(",EMAIL='"+bean.getEmail()+"'");
		buffer.append(",GROUP_ID="+bean.getGroup_id());
		buffer.append(" WHERE USERNAME='"+bean.getUsername()+"'");

		return DAOHelper.getInstance().executeSQL(buffer.toString());
	}
	
	public int delete(AdministratorBean bean) throws SQLException {
		StringBuffer buffer = new StringBuffer();	
		buffer.append(" DELETE FROM ADMINISTRATOR");
		buffer.append(" WHERE USERNAME='"+bean.getUsername()+"'");
		return DAOHelper.getInstance().executeSQL(buffer.toString());
	}

	public Collection getLoginMenu(String account_id) {
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT DISTINCT M.*");
		buffer.append(" FROM ADMINISTRATOR A,FUNCTION2GROUP_NAME F2G,"); 
		buffer.append(" FUNCTION F, MENU M");
		buffer.append(" WHERE A.GROUP_ID=F2G.GROUP_ID");
		buffer.append(" AND F2G.FUNCTION_ID=F.FUNCTION_ID");
		buffer.append(" AND F.MENU_ID=M.MENU_ID");
		buffer.append(" AND A.ACCOUNT_ID="+account_id);
		buffer.append(" ORDER BY M.SORT_ID, F.SORT_ID");

		return DAOHelper.getInstance().queryQuietly(buffer.toString());
	}
	
	public Collection getLoginFunction(String account_id, String menu_id) {
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT F.*");
		buffer.append(" FROM ADMINISTRATOR A,FUNCTION2GROUP_NAME F2G,"); 
		buffer.append(" FUNCTION F, MENU M");
		buffer.append(" WHERE A.GROUP_ID=F2G.GROUP_ID");
		buffer.append(" AND F2G.FUNCTION_ID=F.FUNCTION_ID");
		buffer.append(" AND F.MENU_ID=M.MENU_ID");
		buffer.append(" AND A.ACCOUNT_ID="+account_id);
		buffer.append(" AND M.MENU_ID="+menu_id);
		buffer.append(" ORDER BY M.SORT_ID, F.SORT_ID");

		return DAOHelper.getInstance().queryQuietly(buffer.toString());
	}

}
