package com.titan.base.util;
import java.util.Locale;

/*
 * class LocaleUtil aims to make Locale instance
 * according to user's REMINDER_LANG(locale string) property
 */
public final class LocaleUtil {
	
	/*
	 * make Locale instance 
	 * @param localeStr like languare_country
	 * For example:zh_CN
	 * 
	 */
	public static Locale makeLocale(String localeStr){
		int index=localeStr.indexOf("_");
		if(index==-1){
			return Locale.ENGLISH;
		}else{
			String language=localeStr.substring(0,index);
			String country=localeStr.substring(index+1);
			return new Locale(language,country);
		}		
	}
}
