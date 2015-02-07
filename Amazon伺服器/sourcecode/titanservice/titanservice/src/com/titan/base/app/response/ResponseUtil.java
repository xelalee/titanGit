
package com.titan.base.app.response;

import java.text.MessageFormat;
import java.util.ResourceBundle;
import javax.servlet.http.HttpServletResponse;

import com.titan.base.app.error.bean.ErrorBean;
import com.titan.base.app.util.BundleUtil;


public class ResponseUtil {

	private static ResourceBundle response_resources;

	public static String ACCOUNT_CHECK;
	public static String PRODUCT_REGISTER;
	public static String SERVICE_SKU;
	public static String SERVICE;

	public static String NOT_SUPPORTED_ACTION;
	public static String FATAL_ERROR;

	
	static{
		response_resources = BundleUtil.getResponseResources();
		ACCOUNT_CHECK = response_resources.getString("ACCOUNT_CHECK");
		PRODUCT_REGISTER = response_resources.getString("PRODUCT_REGISTER");
		SERVICE_SKU = response_resources.getString("SERVICE_SKU");
		SERVICE = response_resources.getString("SERVICE");
		NOT_SUPPORTED_ACTION = response_resources.getString("NOT_SUPPORTED_ACTION");
		FATAL_ERROR = response_resources.getString("FATAL_ERROR");
	}
	
	/**
	 * send response to client
	 * @param response :HttpServletResponse
	 * @param template :web page content template
	 * @param paras :web page content parameters
	 * @return
	 */
	public static boolean responseContent(HttpServletResponse response, String template, String[] paras){
		boolean flag = true;
		MessageFormat mf = new MessageFormat(template);
		String content = mf.format(paras);
		flag = responseContent(response, content);
		return flag;
	}
	
	/**
	 * send an error response to client
	 * @param response
	 * @param template
	 * @param error
	 * @return
	 */
	public static boolean responseError(HttpServletResponse response, String template, ErrorBean error){
		boolean flag = true;
		MessageFormat mf = new MessageFormat(template);
		int paraCount = mf.getFormats().length;
		String[] paras;
		String content = template;
		if(paraCount>=2){
			paras = new String[paraCount];
			for(int i=0;i<paraCount;i++){
				paras[i] = "N/A";
			}
			paras[0] = error.getCode();
			paras[1] = error.getMessage();
			content = mf.format(paras);
		}
		
		flag = responseContent(response, content);
		return flag;		
	}
	
	/**
	 * send response to client
	 * @param response :HttpServletResponse
	 * @param content :web page content
	 * @return
	 */
	public static boolean responseContent(HttpServletResponse response, String content){
		boolean flag = true;
		try{
			response.reset();
			response.setContentType("text/html");
			response.getOutputStream().println(content);
		}catch(Exception ex){
			flag = false;
		}
		return flag;
	}
	
	/**
	 * get response content
	 * @param template :response template
	 * @param paras :web page content
	 * @return
	 */
	public static String getResponseContent(String template, String[] paras){
		MessageFormat mf = new MessageFormat(template);
		String content = mf.format(paras);
		return content;
	}
	
	/**
	 * get error response content
	 * @param template :response template
	 * @param paras :web page content
	 * @return
	 */
	public static String getResponseError(String template, ErrorBean error){
		MessageFormat mf = new MessageFormat(template);
		int paraCount = mf.getFormats().length;
		String[] paras;
		String content = template;
		if(paraCount>=2){
			paras = new String[paraCount];
			for(int i=0;i<paraCount;i++){
				paras[i] = "N/A";
			}
			paras[0] = error.getCode();
			paras[1] = error.getMessage();
			content = mf.format(paras);
		}
		return content;	
	}
}
