package com.titan.base.log.appender;

import java.util.Properties;

import org.apache.log4j.net.SMTPAppender;

import com.titan.base.configure.Configure;
import com.titan.base.util.Util;

public class LogSMTPAppender extends SMTPAppender{
	
	public String getTo(){
		return Util.getString(Configure.configure.getProperty("MAIL_TO"));
	}
	
	public String getFrom(){
		return Util.getString(Configure.configure.getProperty("MAIL_FROM"));
	}
	
	public String getSMTPHost(){
		return Util.getString(Configure.configure.getProperty("MAIL_HOST"));
	}
	
	/** 
	* Overrode activeOptions() to have authentication 
	*/ 
	public void activateOptions() { 
		Properties props = new Properties(System.getProperties()); 
		if (getSMTPHost() != null) { 
			props.put("mail.smtp.host", getSMTPHost()); 
		} 
		
		if (getFrom() != null) { 
			props.put("mail.smtp.from", getFrom()); 
		} 
		
		if (getTo() != null) { 
			props.put("mail.smtp.to", getTo()); 
		}
	} 

}
