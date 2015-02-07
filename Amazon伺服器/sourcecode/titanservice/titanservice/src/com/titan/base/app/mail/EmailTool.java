package com.titan.base.app.mail;

import java.util.List;
import java.util.Locale;
import java.text.MessageFormat;
import org.apache.log4j.Logger;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.app.util.BundleUtil;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.service.bean.MyServiceBean;
import com.titan.base.util.DateUtil;
import com.titan.base.util.Util;
import com.titan.base.util.EmailUtil;
import com.titan.base.configure.Configure;


public class EmailTool {
	static Logger logger = Logger.getLogger(EmailTool.class);
	
	private static String activate_service_notice_subject = "";
	private static String activate_service_notice_content = "";
	
	private static String mail_host = Util.getString(Configure.configure.getProperty("MAIL_HOST"));
	private static String mail_from = Util.getString(Configure.configure.getProperty("MAIL_FROM"));
	
	private static int mail_port = Util.getInteger(Configure.configure.getProperty("MAIL_PORT"), 25);
	private static int encryption_type = 
			Util.getInteger(Configure.configure.getProperty("ENCRYPTION_TYPE"), 0);
			
	private static String mail_sender = "admin";
	private static String mytitan_server = Util.getString(Configure.configure.getProperty("DOMAIN_NAME"));
	
	private static boolean mail_auth = Util.getBoolean(Configure.configure.getProperty("MAIL_AUTH"), false);
	private static String mail_user = Util.getString(Configure.configure.getProperty("MAIL_USER"));
	private static String mail_pass = Util.getString(Configure.configure.getProperty("MAIL_PASS"));
	
	private static boolean isHtml = true;
    
	public static void sendEmail(String receiverAddress, String sub, String msg) throws Exception {
		try{
			EmailUtil email = 
					new EmailUtil(mail_host, mail_port, encryption_type, mail_auth, mail_user, mail_pass, isHtml);
			email.sendEmail(mail_from, mail_from, receiverAddress, sub, msg);
		}catch(Exception ex){
			logger.error("send mail error",ex);
			throw ex;
		}
	}
	
	public static void sendEmail(List recipients, String sub, String msg) throws Exception {
		try{
			EmailUtil email = 
					new EmailUtil(mail_host, mail_port, encryption_type, mail_auth, mail_user, mail_pass, isHtml);
			email.sendEmail(mail_from, mail_from, recipients, sub, msg); 
		}catch(Exception ex){
			logger.error("send mail error",ex);
			throw ex;
		}
	}
	
	public static boolean sendRetrievePassowrdMail(AccountBean bean){
		return sendRetrievePassowrdMail(bean, null);		
	}
	
	private static boolean sendRetrievePassowrdMail(AccountBean bean, Locale locale0){
		boolean flag = true;
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject=BundleUtil.getMailResource("RETRIEVE_PASSWORD_NOTICE_SUBJECT",locale);
		String content=BundleUtil.getMailResource("RETRIEVE_PASSWORD_NOTICE_CONTENT",locale);
		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				bean.getPassword(),mytitan_server
		};
		content = mf.format(strs);
		try{
			EmailTool.sendEmail(bean.getEmail(),subject,content);
			flag = true;
		}catch(Exception ex){
			flag = false;
		}		
		return flag;
	}	
	
	public static boolean sendRetrieveUsernameMail(AccountBean bean){
		return sendRetrieveUsernameMail(bean, null);	
	}
	
	private static boolean sendRetrieveUsernameMail(AccountBean bean, Locale locale0){
		boolean flag = true;
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject=BundleUtil.getMailResource("RETRIEVE_USERNAME_NOTICE_SUBJECT",locale);
		String content=BundleUtil.getMailResource("RETRIEVE_USERNAME_NOTICE_CONTENT",locale);
		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				bean.getUsername(),bean.getPassword(),mytitan_server
		};
		content = mf.format(strs);
		try{
			EmailTool.sendEmail(bean.getEmail(),subject,content);
			flag = true;
		}catch(Exception ex){
			flag = false;
		}		
		return flag;
	}
	
	public static boolean sendCreateAccountMail(AccountBean mab){
		return sendCreateAccountMail(mab,null);				
	}
	
	private static boolean sendCreateAccountMail(AccountBean mab, Locale locale0){
		boolean flag = true;
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject = BundleUtil.getMailResource("ACCOUNT_REGISTER_NOTICE_SUBJECT",locale);
		String content = BundleUtil.getMailResource("ACCOUNT_REGISTER_NOTICE_CONTENT",locale);
		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				mab.getUsername(),
				mab.getPassword(),
				mytitan_server,
				mab.getAccount_id(),
				mab.getSubscription_code()
		};
		content = mf.format(strs);
		try{
			EmailTool.sendEmail(mab.getEmail(),subject,content);
			flag = true;
		}catch(Exception ex){
			flag = false;
		}			
		return flag;
	}
	
	/**
	 * send device activate service mail
	 * @param msb
	 * @param mpb
	 * @return 
	 */
	public static boolean sendDeviceActivateServiceMail(String mailReceiver, MyServiceBean msb, MyProductBean mpb){
		return sendDeviceActivateServiceMail(mailReceiver, msb,mpb,null);
	}
	
	private static boolean sendDeviceActivateServiceMail(String mailReceiver, MyServiceBean msb, MyProductBean mpb,Locale locale0){
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String infor = BundleUtil.getMailResource("DEVICE_ACTIVATE_SERVICE_NOTICE_INFOR",locale);
		MessageFormat mf = new MessageFormat(infor);
		String[] strs = new String[]{
				mpb.getModel().getModel_name(),
				mpb.getFriendly_name(),
				mpb.getMac(),
				msb.getService_id(),//TODO
				msb.getService_type(),
				DateUtil.toShortDate(msb.getBegin_date()),
				DateUtil.toShortDate(msb.getExpiration_date())
		};
		infor = mf.format(strs);
		return sendActivateServiceMail(mailReceiver, infor, locale);
	}
	
	/**
	 * fill in information, url in template, then send mail
	 * @param infor
	 * @return 
	 */
	private static boolean sendActivateServiceMail(String mailReceiver, String infor){
		//template
		return sendActivateServiceMail(mailReceiver,infor,null);	
	}
	
	private static boolean sendActivateServiceMail(String mailReceiver, String infor, Locale locale0){
		boolean flag = true;
		//template
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject = getACTIVATE_SERVICE_NOTICE_SUBJECT(locale);
		String content = getACTIVATE_SERVICE_NOTICE_CONTENT(locale);

		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				infor,
				mytitan_server
		};
		content = mf.format(strs);
		try{
			sendEmail(mailReceiver,subject,content);
			flag = true;
		}catch(Exception ex){
			flag = false;
		}		
		return flag;
	}
	
	private static String getACTIVATE_SERVICE_NOTICE_SUBJECT(Locale locale){
		activate_service_notice_subject = BundleUtil.getMailResource("ACTIVATE_SERVICE_NOTICE_SUBJECT",locale);
		return activate_service_notice_subject;
	}
	
	private static String getACTIVATE_SERVICE_NOTICE_CONTENT(Locale locale){
		activate_service_notice_content = BundleUtil.getMailResource("ACTIVATE_SERVICE_NOTICE_CONTENT",locale);
		return activate_service_notice_content;
	}
	
	/**
	 *  send product transfer mail to sender
	 * @param mpb
	 * @param sender
	 * @param receiver
	 */
	public static boolean sendProductTransferMailToSender(MyProductBean mpb,AccountBean sender,AccountBean receiver){
		return sendProductTransferMailToSender(mpb,sender,receiver,null);
	}	
	
	private static boolean sendProductTransferMailToSender(MyProductBean mpb,AccountBean sender,AccountBean receiver,Locale locale0){
		boolean flag = true;
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject = BundleUtil.getMailResource("TRANSFER_PRODUCT_NOTICE_SENDER_SUBJECT",locale);
		String content = BundleUtil.getMailResource("TRANSFER_PRODUCT_NOTICE_SENDER_CONTENT",locale);
		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				mpb.getFriendly_name(),
				receiver.getUsername(),
				mytitan_server
		};
		content = mf.format(strs);
		try{
			sendEmail(sender.getEmail(),subject,content);
		}catch(Exception ex){
			flag = false;
		}
		return flag;
	}
	
	/**
	 * send product transfer mail to receiver
	 * @param mpb
	 * @param sender
	 * @param receiver
	 */
	public static boolean sendProductTransferMailToReceiver(MyProductBean mpb,AccountBean sender,AccountBean receiver){
		return sendProductTransferMailToReceiver(mpb,sender,receiver,null);
	}	
	
	private static boolean sendProductTransferMailToReceiver(MyProductBean mpb,AccountBean sender,AccountBean receiver,Locale locale0){
		boolean flag = true;
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject = BundleUtil.getMailResource("TRANSFER_PRODUCT_NOTICE_RECEIVER_SUBJECT",locale);
		String content = BundleUtil.getMailResource("TRANSFER_PRODUCT_NOTICE_RECEIVER_CONTENT",locale);
		MessageFormat mf = new MessageFormat(content);
		String[] strs = new String[]{
				mpb.getFriendly_name(),
				sender.getUsername(),
				mytitan_server
		};
		content = mf.format(strs);
		try{
			sendEmail(receiver.getEmail(),subject,content);
		}catch(Exception ex){
			flag = false;
		}
		return flag;
	}

	/**
	 * send product reinstall mail to receiver
	 * @param mpb
	 */
	public static void sendProductReinstallMail(MyProductBean mpb,AccountBean accountbean){
		sendProductReinstallMail(mpb,accountbean,null);
	}	
	
	private static void sendProductReinstallMail(MyProductBean mpb,AccountBean accountbean,Locale locale0){
		Locale locale = locale0;
		if(locale0==null){
			locale = Locale.ENGLISH;
		}
		String subject = BundleUtil.getMailResource("REINSTALL_PRODUCT_NOTICE_SUBJECT",locale);
		String content1 = BundleUtil.getMailResource("REINSTALL_PRODUCT_NOTICE_CONTENT1",locale);
		MessageFormat mf1 = new MessageFormat(content1);
		String[] strs1 = new String[]{
				mpb.getFriendly_name()
		};
		content1 = mf1.format(strs1);
		
		String content3 = BundleUtil.getMailResource("REINSTALL_PRODUCT_NOTICE_CONTENT3",locale);
		MessageFormat mf3 = new MessageFormat(content3);
		String[] strs3 = new String[]{
				mytitan_server
		};
		content3 = mf3.format(strs3);
		String mailContent = content1 + content3;
		try{
			sendEmail(accountbean.getEmail(),subject,mailContent);
		}catch(Exception ex){
			ex.printStackTrace();
		}
	}
	
}
