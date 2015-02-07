package com.titan.util;

import java.util.Calendar;
import java.util.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import org.apache.log4j.Logger;


public class DateUtil{
	
	static Logger logger = Logger.getLogger(DateUtil.class);
	
	public DateUtil(){	
	}
	
	/**
	 * get current date,format YYYY-MM-DD
	 * @return
	 */
	public static String getCurrentDate(){
		Calendar cal=Calendar.getInstance();
		String year=String.valueOf(cal.get(Calendar.YEAR));
		//the method cal.get(Calendar.MONTH) get value 0~11,so +1
		String month=intToStr(cal.get(Calendar.MONTH)+1);
		String date=intToStr(cal.get(Calendar.DATE));
		return year+"-"+month+"-"+date;
	}

	/**
	 * get current time,format hh:mm:ss
	 * @return
	 */	
	public static String getCurrentTime(){
		Calendar cal=Calendar.getInstance();
		String hour=intToStr(cal.get(Calendar.HOUR_OF_DAY));
		String minute=intToStr(cal.get(Calendar.MINUTE));
		String second=intToStr(cal.get(Calendar.SECOND));
		return hour+":"+minute+":"+second;
	}
	
	/**
	 * get current datetime, format YYYY-MM-DD hh:mm:ss
	 * @return
	 */
	public static String getCurrentDateTime(){
		Calendar cal=Calendar.getInstance();
		String year=String.valueOf(cal.get(Calendar.YEAR));
		//the method cal.get(Calendar.MONTH) get value 0~11,so +1
		String month=intToStr(cal.get(Calendar.MONTH)+1);
		String date=intToStr(cal.get(Calendar.DATE));
		String hour=intToStr(cal.get(Calendar.HOUR_OF_DAY));
		String minute=intToStr(cal.get(Calendar.MINUTE));
		String second=intToStr(cal.get(Calendar.SECOND));
		return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;		
	}
	
	/**
	 * get current date plus n days,format YYYY-MM-DD
	 * @return
	 */
	public static String getCurrentDatePlus(int n){
		Calendar cal=Calendar.getInstance();
		cal.add(Calendar.DATE,n);
		String year=String.valueOf(cal.get(Calendar.YEAR));
		//the method cal.get(Calendar.MONTH) get value 0~11,so +1
		String month=intToStr(cal.get(Calendar.MONTH)+1);
		String date=intToStr(cal.get(Calendar.DATE));
		return year+"-"+month+"-"+date;
	}	

	/**
	 * get current datetime plus n seconds,format YYYY-MM-DD hh:mi:ss
	 * @param n
	 * @return
	 */
	public static String getCurrentDateTimePlusSeconds(int n){
		Calendar cal=Calendar.getInstance();
		cal.add(Calendar.SECOND,n);
		
		String year=String.valueOf(cal.get(Calendar.YEAR));
		String month=intToStr(cal.get(Calendar.MONTH)+1);
		String date=intToStr(cal.get(Calendar.DATE));
		String hour=intToStr(cal.get(Calendar.HOUR_OF_DAY));
		String minute=intToStr(cal.get(Calendar.MINUTE));
		String second=intToStr(cal.get(Calendar.SECOND));
		return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;	
	}	
	
	public static String intToStr(int i){
		if(i<10) return "0"+String.valueOf(i);
		else return String.valueOf(i);
	}
	
	public static boolean validateDateFormat(String date0, String format0){
	    boolean rst = true;
	    try{
	    	 DateFormat format = new SimpleDateFormat(format0);
	    	 Date d = format.parse(date0);
	    }catch(Exception ex){
	        rst = false;
	    }
	    return rst;
	}
	
	public static String longToStr(long time, DateFormat format){
		 Calendar cal = Calendar.getInstance();
		 cal.setTimeInMillis(time);
		 return format.format(cal.getTime());
	}
	
	public static String formatDate(String date){
		String rst = "";
		int dot_index = date.indexOf(".");
		if(dot_index != -1){
			rst = date.substring(0,dot_index).trim();
		}else{
			rst = date.trim();
		}
		return rst;
	}
	
	public static long getTime(String dateStr, int hourOfDay, int minute){
		long time = 0;
		try {
			int year = Util.getInteger(dateStr.substring(0, 4));
			int month = Util.getInteger(dateStr.substring(5, 7))-1;
			int day = Util.getInteger(dateStr.substring(8));
			
			Calendar cal = Calendar.getInstance();
			cal.set(Calendar.YEAR, year);
			cal.set(Calendar.MONTH, month);
			cal.set(Calendar.DAY_OF_MONTH, day);
			cal.set(Calendar.HOUR_OF_DAY, hourOfDay);
			cal.set(Calendar.MINUTE, minute);
			time = cal.getTimeInMillis();
		} catch (Exception e) {
			logger.error("", e);
		}
		
		return time;
	}
	
	public static void main(String[] args){
		Calendar cal = Calendar.getInstance();
		System.out.println(cal.getTimeInMillis());
		
		System.out.println(getTime("2012-06-08", 14, 58));

	    
	}
}