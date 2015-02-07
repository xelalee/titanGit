package com.titan.updserver.common.mail;

import com.titan.util.Configure;
import com.titan.util.DateUtil;

import com.titan.util.Util;
import com.titan.util.EmailUtil;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

public class MailJavaBean{
	
	static Logger logger = Logger.getLogger(MailJavaBean.class);
	
    private EmailUtil mail;
    
    private static final String RESOURCES = MailJavaBean.class.getPackage().getName() + ".MailResources";
    
    private static String mailHost = Util.getString(Configure.CONFIGURE.getProperty("MAIL_HOST"));
    private static String mailFrom = Util.getString(Configure.CONFIGURE.getProperty("MAIL_FROM"));
    private static boolean mailAuth = false;
    private static String mailUser = Util.getString(Configure.CONFIGURE.getProperty("SMTPUsername"));
    private static String mailPass = Util.getString(Configure.CONFIGURE.getProperty("SMTPPassword"));

    private static ResourceBundle resources;

    private static ResourceBundle getResources(){
    	if (resources == null){
            try {
            	resources = ResourceBundle.getBundle(RESOURCES);
            } catch (MissingResourceException x) {
                throw new InternalError(x.getMessage());
            }
    	}
    	return resources;
    }

    public static String getResource(String key){
    	return getResources().getString(key);
    }    
    
	public MailJavaBean(boolean isHtml){
		if(mailUser.equals("") && mailPass.equals("")){
			mailAuth = false;
		}else{
			mailAuth = true;
		}
		this.mail = new EmailUtil(mailHost,mailAuth,mailUser,mailPass,isHtml);
	}
	
	public MailJavaBean(){
		if(mailUser.equals("") && mailPass.equals("")){
			mailAuth = false;
		}else{
			mailAuth = true;
		}
		this.mail = new EmailUtil(mailHost,mailAuth,mailUser,mailPass);
	}
	
	public void CommunicationFailNotify(String serverip,String message){
		String content = getResource("CommunicationFailNotify");
		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				DateUtil.getCurrentDate()+" "+DateUtil.getCurrentTime(),
				Configure.LOCAL_IP,
				serverip,
				message
		};
		content = mf.format(strs);
		this.sendmail("Update Server error",content.toString());			
	}
	
	public void CommonNotify(String loginfor){
		StringBuffer buffer=new StringBuffer();
		buffer.append(DateUtil.getCurrentDate()+" "+DateUtil.getCurrentTime());
        buffer.append("\n");
		buffer.append("Mail notify from "+Configure.LOCAL_IP);
		buffer.append(".\n");
		buffer.append(loginfor);
		buffer.append("\n");			
		this.sendmail("Update Server error",buffer.toString());		
	}
	
	/**
	 * send mail
	 * @param title
	 * @param content
	 */
	public void sendmail(String title,String content){
		ArrayList al = getMailList();
		try {
			this.mail.sendEmail(mailFrom, mailFrom, al, title, content);
		} catch (Exception e) {
			logger.error("", e);
		}

	}
	
	private ArrayList getMailList(){
		
		String mails = Util.getString(Configure.CONFIGURE.getProperty("MAIL_TO"));
		
		String[] mailArray = mails.split(";");
		
	    ArrayList al = new ArrayList();

        for(String email:mailArray){
            if(!email.equals("")){
	            al.add("<"+email+">");
            }
        }
	    
	    return al;
	}
	
}