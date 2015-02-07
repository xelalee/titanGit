package com.titan.base.util;

import java.util.Calendar;
import java.util.Date;
import java.util.StringTokenizer;
import java.text.DateFormat;
import java.text.SimpleDateFormat;



public class DateUtil{
	public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
	public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
	public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";
	
	public DateUtil(){	
	}
	
	/**
	 * get current date,format YYYY-MM-DD
	 * @return
	 */
	public static String GetCurrentDate(){
		Calendar cal=Calendar.getInstance();
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATE_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}
	
	/**
	 * add days to a certain date
	 * @param date0
	 * @param plusDays
	 * @return YYYY-MM-DD
	 */
	public static String DatePlusDays(Date date0, int plusDays){
		Calendar cal = Calendar.getInstance();
		try{
			cal.setTime(date0);
			cal.add(Calendar.DATE, plusDays);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATE_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}
	
	/**
	 * add days to a certain date
	 * @param date0
	 * @param plusDays
	 * @return YYYY-MM-DD hh:mm:ss
	 */
	public static String DateTimePlusDays(Date date0, int plusDays){
		Calendar cal = Calendar.getInstance();
		try{
			cal.setTime(date0);
			cal.add(Calendar.DATE, plusDays);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATETIME_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}

	/**
	 * get current time,format hh:mm:ss
	 * @return
	 */	
	public static String GetCurrentTime(){
		Calendar cal=Calendar.getInstance();
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_TIME_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}
	
	/**
	 * get current datetime, format YYYY-MM-DD hh:mm:ss
	 * @return
	 */
	public static String GetCurrentDateTime(){
		Calendar cal=Calendar.getInstance();
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATETIME_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;	
	}
	
	/**
	 * get current datetime plus n days,format YYYY-MM-DD hh:mi:ss
	 * @param n
	 * @return
	 */
	public static String GetCurrentDateTimePlusDays(int n){
		Calendar cal=Calendar.getInstance();
		cal.add(Calendar.DATE,n);
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATETIME_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}	
	
	/**
	 * get current date plus n days,format YYYY-MM-DD
	 * @return
	 */
	public static String GetCurrentDatePlus(int n){
		Calendar cal=Calendar.getInstance();
		cal.add(Calendar.DATE,n);
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATE_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}	

	/**
	 * get current datetime plus n seconds,format YYYY-MM-DD hh:mi:ss
	 * @param n
	 * @return
	 */
	public static String GetCurrentDateTimePlusSeconds(int n){
		Calendar cal=Calendar.getInstance();
		cal.add(Calendar.SECOND,n);
		String str = "";
		try{
			str = DateToStr(cal.getTime(),DEFAULT_DATETIME_FORMAT);
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return str;
	}	
	
	public static String IntToStr(int i){
		if(i<10) return "0"+String.valueOf(i);
		else return String.valueOf(i);
	}
	
	public static boolean ValidateDateFormat(String date0, String format0){
	    boolean rst = true;
	    try{
	    	StrToDate(date0,format0);
	    }catch(Exception ex){
	        rst = false;
	    }
	    return rst;
	}
	
	public static Date StrToDate(String date0, String format0) throws Exception{
		Date d = null;
	    DateFormat format = new SimpleDateFormat(format0);
	    try{
	        d = format.parse(date0);
	    }catch(Exception ex){
	    	throw ex;
	    }
	    return d;
	}
	
	public static String DateToStr(Date date0, String format0) throws Exception{
		String date = "";
	    DateFormat format = new SimpleDateFormat(format0);
	    try{
	        date = format.format(date0);
	    }catch(Exception ex){
	    	throw ex;
	    }
	    return date;
	}
	
  /**
   * check week is valid or not.
   *
   * @param strYearWeek the string be checked.
   * @return true if valid, else false.
   */
    public static boolean isValidWeek(String strYearWeek) {
        if (strYearWeek == null || strYearWeek.length() == 0) {
            return false;
          }

          StringTokenizer stk = new StringTokenizer(strYearWeek, "/");
          if (stk.countTokens() != 2) {
            return false;
          }

          int iYear = -1;
          int iWeek = -1;
          try {
            iYear = Integer.parseInt(stk.nextToken());
            iWeek = Integer.parseInt(stk.nextToken());
          }
          catch (NumberFormatException nfe) {
            return false;
          }

          if (iYear < 1912) {
            return false;
          }

          if (iWeek < 1 || iWeek > 53) {
            return false;
          }
          return true;
    }

  /**
   * check month is valid or not.
   *
   * @param strYearMonth the string be checked.
   * @return true if valid, else false.
   */
    public static boolean isValidMonth(String strYearMonth) {
        if (strYearMonth == null || strYearMonth.length() == 0) {
            return false;
          }

          StringTokenizer stk = new StringTokenizer(strYearMonth, "/");
          if (stk.countTokens() != 2) {
            return false;
          }

          int iYear = -1;
          int iMonth = -1;
          try {
            iYear = Integer.parseInt(stk.nextToken());
            iMonth = Integer.parseInt(stk.nextToken());
          }
          catch (NumberFormatException nfe) {
            return false;
          }

          if (iYear < 1912) {
            return false;
          }

          if (iMonth < 1 || iMonth > 12) {
            return false;
          }
          return true;
    }


    public static int theDaysInMonth(int year, int month) {
        // 1<= month <= 12, but the index of array daysInMonth[...] are [0..11]
	    int mon = month-1;
	    int daysInMonth[] = {
	        31, daysInFebruary(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
	    return daysInMonth[mon];
    }

    public static int daysInFebruary(int year) {
      return ( ( (year % 4 == 0) && (! (year % 100 == 0) || (year % 400 == 0))) ?
            29 : 28);
    }
    
    /**
     * extract date part FROM datetime
     * @param datetime
     * @return date part of datetime
     */
    public static String extractDateStr(String datetime){
    	String mid = datetime;
    	int space_index = datetime.indexOf(" ");
    	if(space_index>0){
    		mid = mid.substring(0,space_index);
    	}
    	return mid;
    }
    
    public static String toShortDate(String date){
    	int spaceIndex = date.indexOf(" ");
    	if(spaceIndex>0){
    		return date.substring(0,spaceIndex);
    	}else{
    		return date;
    	}
    }
    
	public static void main(String[] args){
	    System.out.println(ValidateDateFormat("2005-11-02","yyyy-MM-dd HH:mm:ss"));
	    System.out.println(ValidateDateFormat("2005-11-02 23:59:59","yyyy-MM-dd HH:mm:ss"));
	    System.out.println(ValidateDateFormat("2005/11/02","yyyy-MM-dd"));
	    Date d = null;
	    try{
	    	d = StrToDate("2005-11-02 23:59:59","yyyy-MM-dd HH:mm:ss");
	    }catch(Exception ex){
	    }
	    
	    System.out.println("DateTimePlusDays(d,100):"+DateTimePlusDays(d,100));
	    Calendar c = Calendar.getInstance();
	    c.set(2005,11-1,2,23,59);
	    System.out.println(c.getTime());
	    Date d1 = c.getTime();
	    c.add(Calendar.MINUTE,60);
	    Date d2 = c.getTime();
	    System.out.println(d2.getTime()-d1.getTime());
	    
	    try{
	    	d = StrToDate("2005-11-02 23:59:59","yyyy-MM-dd HH:mm:ss");
	    }catch(Exception ex){
	    }
	    System.out.println("DateTimePlusDays(d,100):"+DateTimePlusDays(d,100));
	    System.out.println("DateTimePlusDays(d,100):"+DateTimePlusDays(d,100));
	    try{
	    	System.out.println(DateToStr(d,"yyyy-MM-dd"));
	    }catch(Exception ex){
	    	
	    }
	    
	    try{
	    	System.out.println(toShortDate("2006-09-09 09:09:09"));
	    	System.out.println(toShortDate("2006-09-09"));
	    }catch(Exception ex){
	    	
	    }
	    
	}
}