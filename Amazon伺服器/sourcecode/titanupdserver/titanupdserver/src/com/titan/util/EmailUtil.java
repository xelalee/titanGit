package com.titan.util;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.Message;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.SendFailedException;

import org.apache.log4j.Logger;

public class EmailUtil {
	
	static Logger logger = Logger.getLogger(EmailUtil.class);
	
	private final static String default_charset = "GBK";
	
	private String mail_host = "";
	private boolean auth = false;
	private String mail_host_account = "";
	private String mail_host_password = "";
	private boolean isHtml = false;

	public EmailUtil(String mail_host){
		this.mail_host = mail_host;
	}	
	
	public EmailUtil(String mail_host, boolean auth, String account, String password){
		this.mail_host = mail_host;
		this.auth = auth;
		this.mail_host_account = account;
		this.mail_host_password = password;
	}
	
	public EmailUtil(String mail_host, boolean auth, String account, String password, boolean isHtml){
		this.mail_host = mail_host;
		this.auth = auth;
		this.mail_host_account = account;
		this.mail_host_password = password;
		this.isHtml = isHtml;
	}

	/**
	 * Send email to a single recipient or recipient string.
	 * 
	 * @param senderAddress
	 *            the sender email address
	 * @param senderName
	 *            the sender name
	 * @param receiverAddress
	 *            the recipient email address
	 * @param sub
	 *            the subject of the email
	 * @param msg
	 *            the message content of the email
	 */
	public void sendEmail(String senderAddress,
			String senderName, String receiverAddress, String sub, String msg)
			throws Exception {
		String[] address = receiverAddress.split(";");
		List recipients = new ArrayList(); 
		for(int i=0;i<address.length;i++){
			if(address[i].trim().length()>0){
				recipients.add(address[i]);
			}
		}

		this.sendEmail(senderAddress, senderName, recipients, sub, msg);
	}
	
	public void sendEmail(String senderAddress,
			String senderName, List recipients, String sub, String msg)
			throws SendFailedException {
		this.sendEmail(senderAddress, senderName, recipients, sub, msg, null);
	}
	
	public void sendEmail(String senderAddress,
			String senderName, String receiverAddress, String sub, String msg, Collection attachments)
			throws Exception {
		String[] address = receiverAddress.split(";");
		List recipients = new ArrayList(); 
		for(int i=0;i<address.length;i++){
			if(address[i].trim().length()>0){
				recipients.add(address[i]);
			}
		}

		this.sendEmail(senderAddress, senderName, recipients, sub, msg, attachments);
	}

	/**
	 * Send email to a list of recipients.
	 * @param senderAddress
	 *            the sender email address
	 * @param senderName
	 *            the sender name
	 * @param recipients
	 *            a list of receipients email addresses
	 * @param sub
	 *            the subject of the email
	 * @param msg
	 *            the message content of the email
	 * @param attachments
	 *            attachments list of the email
	 */
	public void sendEmail(String senderAddress,
			String senderName, List recipients, String sub, String msg, Collection attachments)
			throws SendFailedException {
		
		Transport transport = null;

		try {
			Properties props = System.getProperties();
			props.put("mail.smtp.host", this.mail_host);
			props.put("mail.smtp.auth", String.valueOf(this.auth));
			Session session = Session.getDefaultInstance(props,null);
			
			MimeMessage message = new MimeMessage(session);

			if(this.isHtml){
				message.addHeader("Content-type", "text/html");
			}else{
				message.addHeader("Content-type", "text/plain");
			}
			
			message.setSubject(sub,default_charset);
			message.setFrom(new InternetAddress(senderAddress, senderName));

			for (Iterator it = recipients.iterator(); it.hasNext();) {
				String email = (String) it.next();
				message.addRecipients(Message.RecipientType.TO, email);
			}
			
			Multipart mp = new MimeMultipart();
			
			//content
			MimeBodyPart contentPart = new MimeBodyPart();
			
			if(this.isHtml){
				contentPart.setContent("<meta http-equiv=Content-Type content=text/html; charset="+default_charset+">"+msg,"text/html;charset="+default_charset);
			}else{
				contentPart.setText(msg,default_charset);
			}
			
			mp.addBodyPart(contentPart);
			
			//attachment
			if(attachments!=null){
				MimeBodyPart attachPart;
                for(Iterator it = attachments.iterator(); it.hasNext();){
                	attachPart = new MimeBodyPart();
                    FileDataSource fds = new FileDataSource(it.next().toString().trim());
                    attachPart.setDataHandler(new DataHandler(fds));
                    attachPart.setFileName(fds.getName());
                    mp.addBodyPart(attachPart);
                }
				
			}
			
			message.setContent(mp);
			
			message.setSentDate(new Date());
			
			transport = session.getTransport("smtp");
			
			transport.connect((String) props.get("mail.smtp.host"), 
					this.mail_host_account,
					this.mail_host_password);
			
			transport.sendMessage(message, message.getAllRecipients());
		} catch (Exception e) {
			logger.error("send mail error",e);
			throw new SendFailedException(e.toString());
		} finally{
			if(transport!=null){
				try{
					transport.close();
				}catch(Exception ex){
					logger.error("",ex);
				}
			}
		}
	}
	
}
