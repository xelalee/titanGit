package com.titan.util;

import java.util.Locale;

import java.util.ResourceBundle;

public class Util {

  public Util() {
  }

  final public static Locale LIB_LOCALE = Locale.TAIWAN; // Locale.TAIWAN --> new Locale("zh", "TW")
  static  ResourceBundle resources =null;

   /**
    * convert an integer to a specified lenth string,add zero ahead
    * @param x
    * @param len
    * @return
    */
   public static String ConvertIntToStr(int x,int len){
   	   String str=String.valueOf(x);
   	   while(str.length()<len){
   	   	   str="0"+str;
   	   }
   	   return str;
   }
   
   /**
    * get version info
    * @param ver0
    * @return
    */
   public static String getVersion(String ver0){
   	String ver=ver0.trim();
	   if(!ver.equals("")){
			try{
				ver=String.valueOf(Float.parseFloat(ver));
			}catch(Exception ex){
				ex.printStackTrace();
			}
	   } 
	   return ver;
   }
   
   /**
    * handle log message
    * @param log
    * @return
    */
   public static String handleLogMessge(String log){
   	if(log==null) return "";
   	if(log.length()> Keys.LOG_MAX_LENGTH){
   		return log.substring(0,Keys.LOG_MAX_LENGTH)+" ...";
   	}else{
   		return log;
   	}
   }
   
	/**
	 * get String value from object
	 * @param obj
	 * @param default_value
	 * @return
	 */
   public static String getString(Object obj,String default_value){
   	String rst = default_value;
   	if(obj!=null){
   		String str = obj.toString().trim();
   		if(!(str.equals("")||str.equalsIgnoreCase("null"))){
   			rst = str;
   		}
   	}
   	return rst;
   }
   
   /**
    * get String value from object
    * @param obj
    * @return
    */
   public static String getString(Object obj){
   	return getString(obj,"");
   }
   
	/**
	 * get Integer value from object
	 * @param obj
	 * @param default_value
	 * @return
	 */
	public static int getInteger(Object obj, int default_value){
		int rst = default_value;
		if(obj!=null){
			try{
				rst = Integer.parseInt(getString(obj,""));
			}catch(Exception ex){
				ex.printStackTrace();
			}
		}
		return rst;
	}
	
	/**
	 * get Integer value from object
	 * @param obj
	 * @return
	 */
	public static int getInteger(Object obj){
		return getInteger(obj,0);
	}
	
	/**
	 * get Double value from object
	 * @param obj
	 * @param default_value
	 * @return
	 */
	public static double getDouble(Object obj, double default_value){
		double rst = default_value;
		if(obj!=null){
			try{
				rst = Double.parseDouble(getString(obj,""));
			}catch(Exception ex){
				ex.printStackTrace();
			}
		}
		return rst;
	}
	
	/**
	 * get Double value from object
	 * @param obj
	 * @return
	 */
	public static double getDouble(Object obj){
		return getDouble(obj,0);
	}
	
	/**
	 * get float value from object
	 * @param obj
	 * @param default_value
	 * @return
	 */
	public static float getFloat(Object obj, float default_value){
		float rst = default_value;
		if(obj!=null){
			try{
				rst = Float.parseFloat(getString(obj,""));
			}catch(Exception ex){
				ex.printStackTrace();
			}
		}
		return rst;
	}
	
	/**
	 * get float value from object
	 * @param obj
	 * @return
	 */
	public static float getFloat(Object obj){
		return getFloat(obj,0);
	}
	
	/**
	 * get Long value from object
	 * @param obj
	 * @param default_value
	 * @return
	 */
	public static long getLong(Object obj, long default_value){
		long rst = default_value;
		if(obj!=null){
			try{
				rst = Long.parseLong(getString(obj,""));
			}catch(Exception ex){
				ex.printStackTrace();
			}
		}
		return rst;
	}
	
	/**
	 * get Long value from object
	 * @param obj
	 * @return
	 */
	public static long getLong(Object obj){
		return getLong(obj,0);
	}
	
	/**
	 * get Boolean value from object
	 * @param obj
	 * @param default_value
	 * @return
	 */
	public static boolean getBoolean(Object obj, boolean default_value){
		boolean rst = default_value;
		if(obj!=null){
			try{
				if(getString(obj,"").equalsIgnoreCase("true")){
					rst = true;
				}else if(getString(obj,"").equalsIgnoreCase("false")){
					rst = false;
				}
			}catch(Exception ex){
				ex.printStackTrace();
			}
		}
		return rst;
	}
	
	/**
	 * get Boolean value from object
	 * @param obj
	 * @return
	 */
	public static boolean getBoolean(Object obj){
		return getBoolean(obj,false);
	}   
   
	public static void main(String[] args){
		String str = null;
		
		System.out.println(Util.getFloat(str));
	}
}

