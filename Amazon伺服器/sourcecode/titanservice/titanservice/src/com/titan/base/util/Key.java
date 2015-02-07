package com.titan.base.util;

import java.util.HashMap;

public class Key {
	
	// a map of username AND SessionID
	public static HashMap ONLINE_USER_MAP = new HashMap();
	
	public static String MODULE = "register";

	public final static String LOCAL_IP = getLOCAL_IP();

	public final static String LOCAL_HOST = getLOCAL_HOST();

	private static String getLOCAL_IP() {
		String localip = "";
		try {
			localip = java.net.InetAddress.getLocalHost().getHostAddress();
		} catch (Exception ex) {
		}
		return localip;
	}

	private static String getLOCAL_HOST() {
		String localhost = "";
		try {
			localhost = java.net.InetAddress.getLocalHost().toString();
		} catch (Exception ex) {
		}
		return localhost;
	}

}
