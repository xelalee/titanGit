package com.titan.mytitan.login.bean;

import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionBindingEvent;

public class SessionListener implements  HttpSessionBindingListener{
	
	private String username;
	private String sessionid;
	
	public SessionListener(String username,String sessionid){
		this.username = username;
		this.sessionid = sessionid;
	}

	public void valueBound(HttpSessionBindingEvent e) {	
		//do nothing			
	}

	public void valueUnbound(HttpSessionBindingEvent e) {			
		String session1 = SessionBean.getAppSessionID(this.username);
		String session2 = this.sessionid;
		if(session1.equals(session2)){
			SessionBean.removeAppSessionID(this.username);
		}
	}
}
