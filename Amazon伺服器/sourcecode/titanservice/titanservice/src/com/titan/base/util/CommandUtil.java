package com.titan.base.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

import org.apache.log4j.Logger;

public class CommandUtil {
	
	static Logger logger = Logger.getLogger(CommandUtil.class);
	
	public static int runCommand(String[] command){
		return runCommand(command, null);
	}
	
	public static int runCommand(String[] command, File dir){
		int exitvalue=0;
		int waitcode=0;
		InputStreamReader is = null;
		BufferedReader br  = null;
		try {
			Process process = null;
			if(dir==null){
				process = Runtime.getRuntime().exec(command);
			}else{
				process = Runtime.getRuntime().exec(command, null, dir);
			}
			is = new InputStreamReader(process.getInputStream());
			br = new BufferedReader(is);
			waitcode = process.waitFor();
			if (waitcode == 0) {
				exitvalue = process.exitValue();
			}
			process.destroy();
		} catch (Exception ex) {
			logger.error("", ex);
			exitvalue=-1;
		} finally{
			if(br!=null){
				try{
					br.close();
				}catch(Exception ex){
				}
			}
			if(is!=null){
				try{
					is.close();
				}catch(Exception ex){
				}				
			}
		}
		if(waitcode!=0){
			exitvalue = waitcode;
		}
		return exitvalue;
	}
	
	public static String runCommandReturnMessage(String[] command){
		return runCommandReturnMessage(command, null);
	}
	
	public static String runCommandReturnMessage(String[] command, File dir){
		String msg = "";
		InputStreamReader is = null;
		BufferedReader br  = null;
		try {
			Process process = null;
			if(dir==null){
				process = Runtime.getRuntime().exec(command);
			}else{
				process = Runtime.getRuntime().exec(command, null, dir);
			}
			logger.debug("exec finish...");
			is = new InputStreamReader(process.getInputStream());
			br = new BufferedReader(is);
			logger.debug("exec finish...1");
			msg = br.readLine();
			logger.debug("exec finish...2");
			process.destroy();
		} catch (Exception ex) {
			logger.error("", ex);
		} finally{
			if(br!=null){
				try{
					br.close();
				}catch(Exception ex){
				}
			}
			if(is!=null){
				try{
					is.close();
				}catch(Exception ex){
				}				
			}
		}

		return msg;
	}

}
