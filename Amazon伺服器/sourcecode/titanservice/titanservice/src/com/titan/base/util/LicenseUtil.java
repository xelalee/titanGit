package com.titan.base.util;

public class LicenseUtil {
	
	private static final int RandomPartLen = 14;
	
	private static final int TrialLicenseKeyLen = 8;
	
	private static final int StdLicenseKeyLen = 25;
	
	private static final int PinCodeLen = 16;
	
	private static final int ServiceCodeLen = 8;
	
	//exclude those chars hard to figure out
	private static final String BasicLkCharSet = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
	private static final int BasicLkCharSetLen = BasicLkCharSet.length();
	
	public static String genLK(String serviceCode){
		return serviceCode+"-"+genPinCode();
	}
	
	private static String genPinCode(){
		String randomPart = getRandomLkStr(RandomPartLen);		
		return randomPart+getCheckSum(randomPart);
	}
	
	public static boolean validateLk(String lk){
		if(lk==null){
			return false;
		}
		if(lk.startsWith("T")){
			return (lk.length()==TrialLicenseKeyLen);
		}
		if(lk.length()!=StdLicenseKeyLen){
			return false;
		}
		String pinCode = lk.substring(ServiceCodeLen+1);
		return validatePinCode(pinCode);
	}
	
	private static boolean validatePinCode(String pinCode){
		boolean flag = false;
		if(pinCode==null || pinCode.length()!=PinCodeLen){
			return false;
		}
		String randomPart = pinCode.substring(0, RandomPartLen);
		
		if(getCheckSum(randomPart).equals(pinCode.substring(RandomPartLen))){
			flag = true;
		}
		
		return flag;
	}
	
	private static String getRandomLkStr(int len){
		StringBuffer buffer = new StringBuffer(len);
		for(int i=0;i<len;i++){
			int ra = (int)(Math.random() * BasicLkCharSetLen);
			buffer.append(BasicLkCharSet.charAt(ra));
		}
		return buffer.toString();
	}
	
	private static String getCheckSum(String randomPart){
		//generate checksum
		int hash = Math.abs(randomPart.hashCode());
		
		char ch1 = BasicLkCharSet.charAt(hash%BasicLkCharSetLen);
		char ch2 = BasicLkCharSet.charAt((hash/BasicLkCharSetLen)%BasicLkCharSetLen);
		
		StringBuffer buffer = new StringBuffer(3);
		buffer.append(ch1);
		buffer.append(ch2);
		
		return buffer.toString();		
	}
	
	public static void main(String[] args){
		for(int i=0;i<10;i++){
			String lk = LicenseUtil.genLK("S-TAV002");
			
			System.out.println(lk);

		}
		
		for(int i=0;i<10;i++){
			String lk = LicenseUtil.genLK("T-TID001");
			
			System.out.println(lk);

		}
		
		for(int i=0;i<10;i++){
			String lk = LicenseUtil.genLK("S-TID001");
			
			System.out.println(lk);

		}
		for(int i=0;i<10;i++){
			String lk = LicenseUtil.genLK("S-TID002");
			
			System.out.println(lk);

		}
		
		
	}

}
