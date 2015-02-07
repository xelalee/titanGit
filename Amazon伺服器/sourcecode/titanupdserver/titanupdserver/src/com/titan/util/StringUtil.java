package com.titan.util;

public class StringUtil {

	private static final String BasicCharSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	private static final int BasicCharSetLen = BasicCharSet.length();

	public static String getRandomStr(int len){
		StringBuffer buffer = new StringBuffer(len);
		for(int i=0;i<len;i++){
			int ra = (int)(Math.random() * BasicCharSetLen);
			buffer.append(BasicCharSet.charAt(ra));
		}
		return buffer.toString();
	}
	
}
