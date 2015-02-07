package com.titan.updserver.firmware;

import org.apache.log4j.Logger;

public class FirmwareVersion {
	
	static Logger logger = Logger.getLogger(FirmwareVersion.class);
	
	private int x;
	private int y;
	private int z;
	private int i = Integer.MAX_VALUE;
	
	public FirmwareVersion(){
		
	}
	
	public FirmwareVersion(String version) throws InvalidFirmwareVersionException{
		int dashIndex = version.indexOf("-");
		String partX;
		String partY;
		String partZ;
		String temp = version;
		if(dashIndex>-1){
			String partI = version.substring(dashIndex+1);
			this.i = Integer.parseInt(partI);
			temp = version.substring(0, dashIndex);
		}
		String[] strs = temp.split("\\.");
		if(strs.length!=3){
			logger.error("length is wrong");
			throw new InvalidFirmwareVersionException();
		}else{
			partX = strs[0];
			partY = strs[1];
			partZ = strs[2];
		}
		
		try{
			this.x = Integer.parseInt(partX);
			this.y = Integer.parseInt(partY);
			this.z = Integer.parseInt(partZ);
		}catch(Exception e){
			logger.error("parse to int error", e);
			throw new InvalidFirmwareVersionException();
		}
		
	}
	
	public int getX() {
		return x;
	}

	public void setX(int x) {
		this.x = x;
	}

	public int getY() {
		return y;
	}

	public void setY(int y) {
		this.y = y;
	}

	public int getZ() {
		return z;
	}

	public void setZ(int z) {
		this.z = z;
	}

	public int getI() {
		return i;
	}

	public void setI(int i) {
		this.i = i;
	}

	/*
	 * X.Y.Z or X.Y.Z-I
	 */
	public static boolean validate(String version){
		boolean flag =true;
		try {
			new FirmwareVersion(version);
		} catch (InvalidFirmwareVersionException e) {
			flag =false;
		}

		return flag;
	}
	
	public static int compare(String versionStr1, String versionStr2) throws InvalidFirmwareVersionException{
		FirmwareVersion version1 = new FirmwareVersion(versionStr1); 
		FirmwareVersion version2 = new FirmwareVersion(versionStr2);
		if(version1.getX()!=version2.getX()){
			return version1.getX()-version2.getX();
		}
		if(version1.getY()!=version2.getY()){
			return version1.getY()-version2.getY();
		}
		if(version1.getZ()!=version2.getZ()){
			return version1.getZ()-version2.getZ();
		}
		return  version1.getI()-version2.getI();
	}
	
	

}
