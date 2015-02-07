package com.titan.admin.account.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import com.titan.admin.account.bean.GroupBean;
import com.titan.base.jdbc.DAOHelper;
import com.titan.base.system.dao.Sequence_idDao;

public class GroupDAO {
	
	private static GroupDAO instance = new GroupDAO();
	public static GroupDAO getInstance(){
		return instance;
	}

	public GroupDAO() {
	}
	
	public GroupBean get(String group_id) throws SQLException{
		GroupBean group = null;
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT * FROM GROUP_NAME WHERE GROUP_ID="+group_id);
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().queryQuietly(buffer.toString());
		for(HashMap<String, Object> hm :col){
			group = new GroupBean(hm);
		}
		
		if(group!=null){
			group.setFunctions(F2GDAO.getInstance().getFunctionsByGroup_id(group_id));
		}
		
		return group;
	}
	
	public String getAllSQL(){
		StringBuffer buffer = new StringBuffer();
		buffer.append(" SELECT * FROM GROUP_NAME ORDER BY GROUP_ID");
		return buffer.toString();
	}	
	
	public List<GroupBean> getAll(){
		List<GroupBean> list = new ArrayList<GroupBean>();
		Collection<HashMap<String, Object>> col = DAOHelper.getInstance().queryQuietly(this.getAllSQL());
		for(HashMap<String, Object> hm :col){
			list.add(new GroupBean(hm));
		}
		return list;
	}
	
	public long getNewGroup_id(){
		return Sequence_idDao.getInstance().getSEQ("GROUP_NAME");
	}
	
	public String getAddSQL(GroupBean group){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" INSERT INTO GROUP_NAME(GROUP_ID, GROUP_NAME)VALUES(");
		buffer.append(group.getGroup_id());
		buffer.append(",'"+group.getGroup_name()+"')");
		
		return buffer.toString();
	}
	
	
	public int add(GroupBean group) throws SQLException {
		return DAOHelper.getInstance().executeSQL(this.getAddSQL(group));
	}
	
	public String getUpdateSQL(GroupBean group){
		StringBuffer buffer = new StringBuffer();
		
		buffer.append(" UPDATE GROUP_NAME");
		buffer.append(" SET");
		buffer.append(" GROUP_NAME='"+group.getGroup_name()+"'");
		buffer.append(" WHERE GROUP_ID="+group.getGroup_id());

		return buffer.toString();
	}	
	
	public int update(GroupBean group) throws SQLException {
		return DAOHelper.getInstance().executeSQL(this.getUpdateSQL(group));
	}
	
	public String getDeleteSQL(GroupBean group) {
		StringBuffer buffer = new StringBuffer();	
		buffer.append(" DELETE FROM GROUP_NAME");
		buffer.append(" WHERE GROUP_ID="+group.getGroup_id());
		return buffer.toString();
	}	
	
	public int delete(GroupBean group) throws SQLException {
		return DAOHelper.getInstance().executeSQL(this.getDeleteSQL(group));
	}

}
