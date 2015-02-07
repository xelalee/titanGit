package com.titan.common;

import java.util.HashMap;


public class ActionMap {
	
	public final static HashMap<String, Class> actionMap = initial();
	
	private static HashMap<String, Class> initial(){
		HashMap<String, Class> actions = new HashMap<String, Class>();
		
		actions.put("SignatureAction", com.titan.updserver.signature.action.SignatureAction.class);
		actions.put("FirmwareAction", com.titan.updserver.firmware.action.FirmwareAction.class);
		 
		return actions;
	}
	
	public static Class getClassName(String action){
		return actionMap.get(action);
	}

}
