
package com.titan.base.controller;

import java.util.HashMap;


public class ActionMap {
	
	public final static HashMap<String, Class> actionMap = initial();
	
	private static HashMap<String, Class> initial(){
		HashMap<String, Class> actions = new HashMap<String, Class>();
		
		actions.put("AdministratorAction", com.titan.admin.account.action.AdministratorAction.class);
		actions.put("ImportMACAction", com.titan.admin.product.action.ImportMACAction.class);
		actions.put("GenerateLKAction", com.titan.admin.service.action.GenerateLKAction.class);
		actions.put("QueryXAction", com.titan.admin.service.action.QueryXAction.class);
		actions.put("ServiceResetAction", com.titan.admin.service.action.ServiceResetAction.class);
		
		actions.put("HandleMACAction", com.titan.admin.product.action.HandleMACAction.class);	
		
		actions.put("GroupAction", com.titan.admin.account.action.GroupAction.class);
		
		return actions;
	}
	
	public static Class getClassName(String action){
		return actionMap.get(action);
	}

}
