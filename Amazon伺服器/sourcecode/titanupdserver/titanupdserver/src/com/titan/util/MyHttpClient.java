package com.titan.util;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.protocol.Protocol;

import com.titan.ssl.MyProtocolSocketFactory;

public class MyHttpClient extends HttpClient {
	
	static{
		//register https
		Protocol myhttps = new Protocol("https",new MyProtocolSocketFactory(), 443);
		Protocol.registerProtocol("https", myhttps);
	}
	
	public static void main(String[] args){
		
	}

}
