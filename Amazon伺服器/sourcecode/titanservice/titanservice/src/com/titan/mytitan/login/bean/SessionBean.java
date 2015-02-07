package com.titan.mytitan.login.bean;

import org.apache.log4j.Logger;

import com.titan.base.util.Key;
import com.titan.base.util.Keys;
import com.titan.base.util.Util;
import com.titan.mytitan.app.util.ViewUtil;



public class SessionBean{
	static Logger logger = Logger.getLogger(SessionBean.class);
	public final static String TIME_OUT = "timeout";
	public final static String KICK_OFF = "kickoff";
	public final static String NORMAL = "normal";
	
	public String checkSession(){
		String rst = NORMAL;
		LoginBean bean = (LoginBean) ViewUtil.getSession(Keys.USER_INFO);
		if(bean == null){	
			rst = TIME_OUT;
		}else{
			String username = bean.getAccountbean().getUsername();
			String session1 = getAppSessionID(username);
			String session2 = ViewUtil.getSessionID();
			if(!session1.equals(session2)){
				rst = KICK_OFF;
			}
		}
		return rst;
	}
	
	/**
	 * get SessionID of user in application scope
	 * @param username
	 * @return
	 */
	public static String getAppSessionID(String username){
		return Util.getString(Key.ONLINE_USER_MAP.get(username));
	}
	
	/**
	 * remove SessionID of user in application scope
	 * @param username
	 * @return
	 */
	public synchronized static void removeAppSessionID(String username){
		logger.debug("removeAppSessionID:"+username);
		Key.ONLINE_USER_MAP.remove(username);
		logger.debug(Key.ONLINE_USER_MAP);
	}
	
	/**
	 * SET username:SessionID in application scope
	 * @param username
	 * @param SessionID
	 */
	public synchronized static void setAppSessionID(String username,String SessionID){
		logger.debug("setAppSessionID:"+username+" "+SessionID);
		Key.ONLINE_USER_MAP.put(username,SessionID);
		logger.debug(Key.ONLINE_USER_MAP);
	}
	
	public static boolean doesAppSessionIDExist(String SessionID){
		return Key.ONLINE_USER_MAP.containsValue(SessionID);
	}
}
