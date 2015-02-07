package com.titan.admin.account.action;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.admin.account.bean.GroupBean;
import com.titan.admin.account.dao.GroupDAO;
import com.titan.admin.account.dao.F2GDAO;
import com.titan.base.controller.ActionInterf;
import com.titan.base.controller.bean.MessageBean;
import com.titan.base.jdbc.DAOHelper;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;


public class GroupAction implements ActionInterf{
	
	static Logger logger = Logger.getLogger(GroupAction.class);
	
	static Logger logger_admin = Logger.getLogger("adminLogger");
	
	private GroupBean groupbean;

	public GroupAction() {
		this.groupbean = new GroupBean();
	}
	
	public List<GroupBean> getGroups(){
		
		List<GroupBean> groups = new ArrayList<GroupBean>();
		groups = GroupDAO.getInstance().getAll();
		return groups;
		
	}
	
	public String loadAction(){
		String group_id = Util.getString(ViewUtil.getRequestParameter("group_id"));
		try {
			this.groupbean = GroupDAO.getInstance().get(group_id);
		} catch (SQLException e) {
			logger.error("get group error");
		}
		
		return "group_edit";
	}

	@Override
	public MessageBean process(HttpServletRequest request,
			HttpServletResponse response, ServletConfig config)
			throws ServletException, IOException {
		String dispatch = Util.getString(request.getParameter("dispatch"));
		
		GroupBean bean = new GroupBean();
		
		bean.setGroup_id(Util.getString(request.getParameter("group_id")));
		bean.setGroup_name(Util.getString(request.getParameter("group_name")));
		
		String function_ids = Util.getString(request.getParameter("function_ids"));
		String[] arr = function_ids.split(",");
		List<String> functions = new ArrayList<String>();
		for(String id: arr){
			functions.add(id);
		}
		
		bean.setFunctions(functions);
		
		MessageBean message = new MessageBean();
		message.setBackURL("/jsp/admin/account/group_list.jsf");
		message.setMenu("Group Management");
		if(dispatch.equalsIgnoreCase("add")){
			message.setFunction("Group Add");
			message.setSucc(false);
			try {
				String group_id = String.valueOf(GroupDAO.getInstance().getNewGroup_id());
				bean.setGroup_id(group_id);
				String group_sql = GroupDAO.getInstance().getAddSQL(bean);
				List<String> function_sqls = F2GDAO.getInstance().getInsertSQLs(group_id, functions);
		
				List<String> sqls = new ArrayList<String>();
				
				sqls.add(group_sql);
				sqls.addAll(function_sqls);
				
				int effects = DAOHelper.getInstance().executeSQL(sqls);
				
				if(effects>0){
					message.setSucc(true);
					message.setMessage("The group is added successfully.");
				}
			} catch (SQLException e) {
				logger.error("Add group fail.");
				message.setMessage("Operation fail, "+e.getMessage());
			}
		}else if(dispatch.equalsIgnoreCase("edit")){
			message.setFunction("Group Edit");
			message.setSucc(false);
			
			String group_id = bean.getGroup_id();
			
			try {
				String group_sql = GroupDAO.getInstance().getUpdateSQL(bean);
				String clear_function_sql = F2GDAO.getInstance().getDeleteByGroup_idSQL(group_id);
				List<String> function_sqls = F2GDAO.getInstance().getInsertSQLs(group_id, functions);
		
				List<String> sqls = new ArrayList<String>();
				
				sqls.add(group_sql);
				sqls.add(clear_function_sql);
				sqls.addAll(function_sqls);
				
				int effects = DAOHelper.getInstance().executeSQL(sqls);
				
				if(effects>0){
					message.setSucc(true);
					message.setMessage("The group is updated successfully.");
				}
			} catch (SQLException e) {
				logger.error("Update group fail.");
				message.setMessage("Operation fail, "+e.getMessage());
			}			
		}else if(dispatch.equalsIgnoreCase("delete")){
			message.setFunction("Group Delete");
			message.setSucc(false);
			try {
				String clear_function_sql = F2GDAO.getInstance().getDeleteByGroup_idSQL(bean.getGroup_id());
				String group_sql = GroupDAO.getInstance().getDeleteSQL(bean);
				
				List<String> sqls = new ArrayList<String>();
				
				sqls.add(clear_function_sql);
				sqls.add(group_sql);
				
				int effects = DAOHelper.getInstance().executeSQL(sqls);
				
				if(effects==1){
					message.setSucc(true);
					message.setMessage("The group is deleted successfully.");
				}
			} catch (SQLException e) {
				logger.error("Delete group fail.");
				message.setMessage("Operation fail, "+e.getMessage());
			}			
		}
		return message;
	}

}
