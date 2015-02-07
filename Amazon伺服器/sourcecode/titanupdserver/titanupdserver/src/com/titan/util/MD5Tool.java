package com.titan.util;

import java.io.File;
import java.io.FileInputStream;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.log4j.Logger;

public class MD5Tool {
	
	static Logger logger = Logger.getLogger(MD5Tool.class);
	
	public static void main(String[] args)
	{	
		File testFileA = new File("g:/temp/1.0.1-29.img");
		//File testFileB = new File("c.doc");
		
		byte[] bytes = getRawBytes(testFileA);
		
		String fileAMD5 = DigestUtils.md5Hex(bytes);
		
		System.out.println("MD5 test file fingerprint: " + fileAMD5);
		
		//bytes = getRawBytes(testFileB);
		
		//String fileBMD5 = DigestUtils.md5Hex(bytes);
		
		//System.out.println("MD5 test file fingerprint: " + fileBMD5);
		
		String md5 = MD5Tool.getMD5Checksum("g:/temp/1.0.1-29.img");
		System.out.println("md5: "+md5);
		md5 = MD5Tool.getMD5Checksum("g:/temp/1.0.1-29.img1");
		System.out.println("md5: "+md5);
	}
	
	public final static String getMD5Checksum(String file) {
		
		String checkSum = "";
		File f = new File(file);
		
		if (!f.exists()) return checkSum;
		
		byte[] bytes = getRawBytes(f);
		checkSum = DigestUtils.md5Hex(bytes);
		
		return checkSum;
		
	}
	
	public final static byte[] getRawBytes(File f) {
		try {
			if (!f.exists())
				return null;
			FileInputStream fin = new FileInputStream(f);
			byte[] buffer = new byte[(int) f.length()];
			fin.read(buffer);
			fin.close();
			return buffer;
		} catch (Exception err) {
			logger.error("", err);
			return null;
		}

	}

}
