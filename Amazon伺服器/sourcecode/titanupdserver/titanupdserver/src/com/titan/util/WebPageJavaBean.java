package com.titan.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.log4j.Logger;
import com.titan.util.Util;

public class WebPageJavaBean {
	
	static Logger logger = Logger.getLogger(WebPageJavaBean.class);
	
    private ArrayList WebPage;
    
    public void setWebPage(ArrayList WebPage){
        this.WebPage = WebPage;
    }
    
    public int getPageSize(){
        return WebPage.size();
    }

    public String line(int index){
        if((WebPage != null) &&(WebPage.size() >= index)){
            return Util.getString(WebPage.get(index));
        }else{
            return null; 
        }
    }
    
    /**
     * get a web page
     * @param url1
     * @return
     * @throws Exception
     */
    public static WebPageJavaBean getWebPage(String url1) throws Exception{
        WebPageJavaBean wpjb = new WebPageJavaBean();
        ArrayList lines = new ArrayList();
        
		MyHttpClient httpClient = new MyHttpClient();
		GetMethod getMethod = new GetMethod(url1);

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
			
			BufferedReader reader = new BufferedReader(new InputStreamReader(inStream));
			String line;
			while( (line = reader.readLine()) != null){
			    lines.add(line);
			}
	        
        }catch(Exception ex){
            ex.printStackTrace();
            throw ex;
        }finally{
			if(inStream!=null){
				try{
					inStream.close();
				}catch(Exception ex){
					ex.printStackTrace();
				}
			}
			if(getMethod!=null){
				try{
					getMethod.releaseConnection();
				}catch(Exception ex){
					ex.printStackTrace();
				}
			}
        }
        
        wpjb.setWebPage(lines);
        logger.debug("url: "+url1);
        logger.debug(lines);
        return wpjb;
    }
    
    public static void main(String[] args){
        WebPageJavaBean wp = null;
        try{
            wp = WebPageJavaBean.getWebPage("https://172.25.21.101/updserver/download_status_report_interface?from_time=2004-11-11%2005:11:01&to_time=2008-11-11%2011:01:01");
        }catch(Exception ex){
            
        }
        for(int i=2;i<18;i++){
            System.out.println(wp.line(i));
        }
    }
}
