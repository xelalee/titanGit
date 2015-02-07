package com.titan.register.controller;

import java.util.HashMap;

public class ActionMap {
	public HashMap<String,Class> action = new HashMap<String,Class>();
	private static ActionMap instance = new ActionMap();
	
	public static ActionMap instance(){
		return instance;
	}
	
	private ActionMap(){
		
		//pre-define the maping between action AND action-class
		action.put(ActionName.ACCOUNT_CHECK, com.titan.register.account.action.AccountCheckAction.class);
		action.put(ActionName.PRODUCT_REGISTER, com.titan.register.product.action.ProductAction.class);
		action.put(ActionName.SERVICE_TRIAL, com.titan.register.service.action.ServiceAction.class);
		action.put(ActionName.SERVICE_UPGRADE, com.titan.register.service.action.ServiceAction.class);
		action.put(ActionName.SERVICE_REFRESH, com.titan.register.service.action.ServiceRefreshAction.class);
		
	}
	
	public Class getAction(String action){
		return this.action.get(action);
	}

}
