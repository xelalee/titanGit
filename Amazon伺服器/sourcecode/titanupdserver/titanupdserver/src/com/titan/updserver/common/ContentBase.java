package com.titan.updserver.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.InputStream;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.log4j.Logger;

import com.titan.updserver.common.logformat.CommonLogFormatter;
import com.titan.util.Configure;
import com.titan.util.Keys;
import com.titan.util.MyHttpClient;
import com.titan.updserver.common.exception.FetchFileException;
import com.titan.updserver.firmware.bean.FirmwareBean;
import com.titan.updserver.signature.bean.SignatureBean;


public class ContentBase{
	
	static Logger logger = Logger.getLogger(ContentBase.class);
	
	private static ContentBase instance = new ContentBase();
	public static ContentBase getInstance(){
		return instance;
	}
	
	public static String CONTENT_HOME = Configure.CONFIGURE.getProperty("CONTENT_HOME");
	
	public ContentBase(){
		
	}
	
	public boolean isCharValid(char ch){
		//'a'~'z','A'~'Z','0'~'9','.'
		int ascii=(int)ch;
		if((ascii>=97&&ascii<=122)||(ascii>=65&&ascii<=90)||(ascii>=48&&ascii<=57)||(ch=='.'))
			return true;
		else return false;
	}
	
	public boolean isValidFileName(String filename){
		boolean valid=true;
		int i=0;
		int len=filename.length();
		while((i<len) && valid){
			if(!isCharValid(filename.charAt(i))) valid=false;
			i++;
		}
		return valid;		
	}
	
	public boolean prepareSignatureDir(SignatureBean bean){
		boolean mksucc=true;
		File dir=new File(this.getSignatureDir(bean));
		if(!dir.exists()) mksucc=dir.mkdirs();		
		return mksucc;
	}
	
	public String getSignatureDir(SignatureBean bean){
		return CONTENT_HOME+"/"+Keys.SIGNATURE_ROOT+"/"+bean.getDevice()+"/"+bean.getService();
	}
	
	public String getSignaturePath(SignatureBean bean){
		return this.getSignatureDir(bean)+"/"+bean.getFilename();
	}
	
	public boolean prepareSignatureTempDir(SignatureBean bean){
		boolean mksucc=true;
		File dir=new File(CONTENT_HOME+"/"+Keys.SIGNATURE_ROOT+"/temp/"+bean.getDevice()+"/"+bean.getService());
		if(!dir.exists()) mksucc=dir.mkdirs();	
		return mksucc;
	}
	
	public String getSignatureTempDir(SignatureBean bean){
		return CONTENT_HOME+"/"+Keys.SIGNATURE_ROOT+"/temp/"+bean.getDevice()+"/"+bean.getService();
	}
	
	public String getSignatureTempPath(SignatureBean bean){
		return this.getSignatureTempDir(bean)+"/"+bean.getFilename();
	}
	
	public boolean prepareFirmwareDir(FirmwareBean bean){
		boolean mksucc=true;
		File dir=new File(CONTENT_HOME+"/"+Keys.FIRMWARE_ROOT+"/"+bean.getDevice());
		if(!dir.exists()) mksucc=dir.mkdirs();		
		return mksucc;
	}
	
	public String getFirmwareDir(FirmwareBean bean){
		return CONTENT_HOME+"/"+Keys.FIRMWARE_ROOT+"/"+bean.getDevice();
	}	
	
	public String getFirmwarePath(FirmwareBean bean){
		return this.getFirmwareDir(bean)+"/"+bean.getFilename();
	}
	
	public boolean prepareFirmwareTempDir(){
		boolean mksucc=true;
		File dir=new File(CONTENT_HOME+"/"+Keys.FIRMWARE_ROOT+"/temp");
		if(!dir.exists()) mksucc=dir.mkdirs();	
		return mksucc;
	}
	
	public String getFirmwareTempDir(){
		String dirStr = CONTENT_HOME+"/"+Keys.FIRMWARE_ROOT+"/temp";
		
		File dir=new File(dirStr);
		
		if(!dir.exists()){
			dir.mkdirs();
		}
		
		return dirStr;
	}
	
	public String getFirmwareTempPath(String filename){
		return getFirmwareTempDir()+"/"+filename;
	}
	
	/**
	 * fetch a file from the sourceurl to destpath
	 * @param destpath
	 * @param sourceurl
	 * @return
	 */
	public boolean fetchFile(String destpath,String sourceurl) throws FetchFileException{
	    boolean succ = true;

		int byteread=0;
		
		MyHttpClient httpClient = new MyHttpClient();
		GetMethod getMethod = new GetMethod(sourceurl);

		getMethod.getParams().setParameter(HttpMethodParams.RETRY_HANDLER,
				new DefaultHttpMethodRetryHandler());
		
		InputStream inStream = null;
		
		try{
			
			int statusCode = httpClient.executeMethod(getMethod);
			if (statusCode != HttpStatus.SC_OK) {
				logger.error("Method failed: "+ getMethod.getStatusLine());
				throw new Exception(getMethod.getStatusText());
			}

			inStream = getMethod.getResponseBodyAsStream();
			
			FileOutputStream fs=new FileOutputStream(destpath);
			byte[]  buffer =new  byte[Keys.BUFFER_SIZE];
			while ((byteread=inStream.read(buffer))!=-1)
			{
			    fs.write(buffer,0,byteread);
			}	
			fs.close();
		}catch(Exception ex){
			CommonLogFormatter lf = new CommonLogFormatter();
			lf.setTitle("Fail when fetch the file "+sourceurl+".");
			lf.setError_Message(ex.toString());
			logger.error(lf.getFormattedLog(), ex);
			succ = false;
			throw new FetchFileException(ex.getMessage());
		}finally{
			if(inStream!=null){
				try{
					inStream.close();
				}catch(Exception ex){
					logger.error("", ex);
				}
			}
			if(getMethod!=null){
				try{
					getMethod.releaseConnection();
				}catch(Exception ex){
					logger.error("", ex);
				}
			}
        }
		return succ;
	}	
	
	public void copyFile(String source,String dest) 
	        throws FileNotFoundException,IOException{

		int byteread=0; 
		InputStream inStream=new FileInputStream(source);
		FileOutputStream fs=new FileOutputStream( dest);
		byte[]  buffer =new  byte[Keys.BUFFER_SIZE];
		while ((byteread=inStream.read(buffer))!=-1)
		 {
		   fs.write(buffer,0,byteread);
		 } 
		fs.close();
		inStream.close(); 
	}
	
	public boolean fileExists(String path){
		File f=new File(path);
		boolean flag = (f.exists() && f.length()>0);
		logger.debug("path: "+path+", flag: "+flag);
		return flag;
	}	

	/**
	 * get file size(Bytes)
	 * @param FullDir
	 * @return
	 */
	public long getFileSize(String fullPath){
		File f=new File(fullPath);
		if(f.exists()){
			return f.length();
		}
		else return 0;
	}
	
	public long getFileSize(SignatureBean bean){
		String path = this.getSignaturePath(bean);
		return this.getFileSize(path);
	}
	
	public long getFileSize(FirmwareBean bean){
		String path = this.getFirmwarePath(bean);
		return this.getFileSize(path);
	}
	
	public void deleteFile(String dir){
		File f=new File(dir);
		if(f.exists()) f.delete();
	}
	
	public boolean prepareDir(String dir){
		boolean flag = false;
		File f = new File(dir);
		if(!f.exists()){
			flag = f.mkdirs();
		}
		return flag;
	}
}