package com.titan.util;

import java.util.*;
import java.io.*;

import javax.xml.parsers.*;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.log4j.Logger;
import org.w3c.dom.*;
import org.xml.sax.SAXException;
//import org.apache.crimson.tree.XmlDocument;

import com.titan.util.Keys;
import com.titan.util.Util;
import com.titan.util.MyHttpClient;

/**
 * ParseXml
 */
public class ParseXml {
	
	static Logger logger = Logger.getLogger(ParseXml.class);

	private final static String FILL_STRING = "-----";
 
	
	/**
	 * read a XML file to a collection
	 * @param filename,XML file name
	 * @param record_attributes
	 * @return
	 */
	public static Collection<HashMap<String, Object>> ReadXMLFile(String filename,String[] record_attributes){
		Collection<HashMap<String, Object>> col=new ArrayList<HashMap<String, Object>>();
		String nodename="",nodevalue="";
		Document document=null;
		HashMap<String, Object> hm =null;

		try{
		    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		    factory.setValidating(false);
		    DocumentBuilder builder = factory.newDocumentBuilder();
		    document = builder.parse(new File(filename));
		    //table
		    Element table=document.getDocumentElement();
		    //record
		    NodeList records=table.getElementsByTagName(Keys.XML_RECORD);
		    for(int i=0;i<records.getLength();i++){
		    	Element record=(Element)records.item(i);
		    	hm=new HashMap<String, Object>();
		    	//field
		    	for(int j=0;j<record_attributes.length;j++){
			    	NodeList field=record.getElementsByTagName(record_attributes[j]);
		    		if(field.getLength()==1){
		    			Element e=(Element)field.item(0);
		    			Node node=e.getFirstChild();
		    			nodename=record_attributes[j].toUpperCase(Keys.DEFAULT_LOCALE);
		    			nodevalue=node.getNodeValue();
		    			if(nodevalue.equals(FILL_STRING)){
		    			    nodevalue = "";
		    			}
		    			hm.put(nodename.toUpperCase(),nodevalue);
		    		}
		    	}
		    	col.add(hm);
		    }
		}catch(Exception ex){
			logger.error("",ex);
			logger.debug("ReadXMLFile:"+ex.toString());
		}

		return col;
	}	
	
	public static Collection<HashMap<String, Object>> ReadXML(InputStream input,String root,String[] record_attributes) throws IOException{
		Collection<HashMap<String, Object>> col = new ArrayList<HashMap<String, Object>>();
		String nodename = "";
		String nodevalue = "";
		Document document = null;
		HashMap<String, Object> hm = null;

		try{
		    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		    factory.setValidating(false);
		    DocumentBuilder builder = factory.newDocumentBuilder();
		    document = builder.parse(input);
		    //table
		    Element table = document.getDocumentElement();
		    //record
		    NodeList rootList = table.getElementsByTagName(root);
		    int rootListLen = rootList.getLength();
		    int len = record_attributes.length;
		    for(int i=0;i<rootListLen;i++){
		    	Element record = (Element)rootList.item(i);
		    	
		    	hm = new HashMap<String, Object>();
		    	//field
		    	for(int j=0;j<len;j++){
			    	NodeList field = record.getElementsByTagName(record_attributes[j]);
		    		if(field.getLength()==1){
		    			Element e = (Element)field.item(0);
		    			Node node = e.getFirstChild();
		    			nodename = record_attributes[j];
		    			nodevalue = "";
		    			if(node!=null){
			    			nodevalue = node.getNodeValue();
			    			if(nodevalue==null){
			    				nodevalue = "";
			    			}		    				
		    			}
		    			hm.put(nodename.toUpperCase(),nodevalue);
		    		}
		    	}
		    	col.add(hm);
		    }
		}catch(IOException ex){
			throw ex;
		}catch(ParserConfigurationException ex){
			logger.error("ParserConfigurationException "+ex.getMessage(),ex);
		}catch(SAXException ex){
			logger.error("SAXException "+ex.getMessage(),ex);
		}

		return col;
	}	
	
	/**
	 * get XML infor from a URL,then input these infor to a collection
	 * @param sourceurl
	 * @param record_attributes
	 * @return
	 */
	public static Collection<HashMap<String, Object>> ReadXMLFromURL(String sourceurl,String[] record_attributes) throws Exception
	{
		Collection<HashMap<String, Object>> col=new ArrayList<HashMap<String, Object>>();
		String nodename="",nodevalue="";
		Document document=null;
		HashMap<String, Object> hm =null;
		
		InputStream inStream = null;
		
		MyHttpClient httpClient = new MyHttpClient();
		GetMethod getMethod = new GetMethod(sourceurl);

		getMethod.getParams().setParameter(HttpMethodParams.RETRY_HANDLER,
				new DefaultHttpMethodRetryHandler());

		try{
		    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		    factory.setValidating(false);
		    DocumentBuilder builder = factory.newDocumentBuilder();

			int statusCode = httpClient.executeMethod(getMethod);
			if (statusCode != HttpStatus.SC_OK) {
				logger.error("Method failed: "+ getMethod.getStatusLine());
				throw new Exception(getMethod.getStatusText());
			}

			inStream = getMethod.getResponseBodyAsStream();
			
		    document = builder.parse(inStream);
		    //table
		    Element table=document.getDocumentElement();
		    //record
		    NodeList records=table.getElementsByTagName(Keys.XML_RECORD);
		    for(int i=0;i<records.getLength();i++){
		    	Element record=(Element)records.item(i);
		    	hm=new HashMap();
		    	//field
		    	for(int j=0;j<record_attributes.length;j++){
			    	NodeList field=record.getElementsByTagName(record_attributes[j]);
		    		if(field.getLength()==1){
		    			Element e=(Element)field.item(0);
		    			Node node=e.getFirstChild();
		    			nodename=record_attributes[j].toUpperCase(Keys.DEFAULT_LOCALE);
		    			nodevalue=node.getNodeValue();
		    			if(nodevalue.equals(FILL_STRING)){
		    			    nodevalue = "";
		    			}
		    			hm.put(nodename.toUpperCase(),nodevalue);
		    		}
		    	}
		    	col.add(hm);
		    }
		}catch(Exception ex){
			logger.error("", ex);
			throw ex;
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

		return col;
	}	

	/**
	 * write data contained in a collection to a XML file
	 * @param data
	 * @param filename
	 * @param record_attributes
	 * @return
	 */
	public static boolean WriteXMLFile(Collection data,String filename,String[] record_attributes){		
		boolean rst=true;
        String value="";
        HashMap hm =null;
        int attributes_len=record_attributes.length;
		StringBuffer buffer=new StringBuffer();
        buffer.append("<"+Keys.XML_TABLE+">");
		for(Iterator it=data.iterator();it.hasNext();){
			hm=(HashMap)it.next();
			buffer.append("<"+Keys.XML_RECORD+">");
			
			for(int i=0;i<attributes_len;i++){
				buffer.append("<"+record_attributes[i]+">");
				value=Util.getString(hm.get(record_attributes[i].toUpperCase(Keys.DEFAULT_LOCALE)));
				if(value.equals("")) value=FILL_STRING;
				buffer.append(value);
				buffer.append("</"+record_attributes[i]+">");
			}			
			
			buffer.append("</"+Keys.XML_RECORD+">");
		}
		buffer.append("</"+Keys.XML_TABLE+">");
		try{
			File f=new File(filename);
			if(!f.exists()) f.createNewFile();
			FileWriter resultFile=new FileWriter(f);
			PrintWriter myFile=new PrintWriter(resultFile);
			myFile.println(buffer);
			resultFile.close();	
		}catch(IOException ex){
			rst=false;
			logger.error("", ex);
		}
        return rst;
	}

	/**
	 * write data contained in a collection to a XML string
	 * @param data
	 * @param record_attributes
	 * @return
	 */
	public static String WriteXMLString(Collection data,String[] record_attributes){
	    StringBuffer buffer=new StringBuffer();
		String value="";
		HashMap hm =null;
		int attributes_len=record_attributes.length;
        buffer.append("<"+Keys.XML_TABLE+">\n");
		for(Iterator it=data.iterator();it.hasNext();){
			hm=(HashMap)it.next();
			buffer.append("<"+Keys.XML_RECORD+">");
			
			for(int i=0;i<attributes_len;i++){
				buffer.append("<"+record_attributes[i]+">");
				value=Util.getString(hm.get(record_attributes[i].toUpperCase(Keys.DEFAULT_LOCALE)));
				if(value.equals("")) value=FILL_STRING;
				buffer.append(value);
				buffer.append("</"+record_attributes[i]+">");
			}
			
			buffer.append("</"+Keys.XML_RECORD+">\n");
		}
		buffer.append("</"+Keys.XML_TABLE+">\n");
        return buffer.toString();
	}
	
	/**
	* test code.
	* @param filename: XML filename.
	* @return a HashMap which contains the configure Properity.
	*/		
	public static void main(String[] args){
	    String url = "http://10.1.5.2/updserver/signature_list_interface";
	    try{
	        System.out.println(ReadXMLFromURL(url,Keys.XML_RECORD_ATTRIBUTES));
	    }catch(Exception ex){
	    	logger.error("", ex);
	    }
	    
	}
}


