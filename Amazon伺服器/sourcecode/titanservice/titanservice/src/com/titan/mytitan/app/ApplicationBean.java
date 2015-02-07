package com.titan.mytitan.app;

import java.util.*;

import javax.faces.model.SelectItem;

import com.titan.base.app.countrycode.dao.CountryCodeDAO;
import com.titan.base.util.Util;
import com.titan.mytitan.login.bean.LocaleBean;


public class ApplicationBean {
	private static List CountryList_en = getCountryList_en();
	private static List CountryList_zh_CN = getCountryList_zh_CN();
	private static List CountryList_zh_TW = getCountryList_zh_TW();
	
	public List getCountryList(){
		LocaleBean bean = new LocaleBean();
        String locale = bean.getLocale();
        if(locale.equalsIgnoreCase(LocaleBean.LOCALE_ZH_CN)){
        	return CountryList_zh_CN;
        }else if(locale.equalsIgnoreCase(LocaleBean.LOCALE_ZH_TW)){
        	return CountryList_zh_TW; 
        }else{
        	return CountryList_en;
        }		
	}

	private static List getCountryList_en() {
		List l = new ArrayList();
		Collection col = null;
		try{
			col = CountryCodeDAO.getInstance().getAll();
		}catch(Exception ex){
			return l;
		}
		String code = "";
		String value = "";
		String field = "VALUE1";
		//LocaleBean bean = new LocaleBean();
		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			code = Util.getString(hm.get("CODE"));
			value = Util.getString(hm.get(field));
			l.add(new SelectItem(code,value));
		}
		return l;
	}
	
	private static List getCountryList_zh_CN() {
		List l = new ArrayList();
		Collection col = null;
		try{
			col = CountryCodeDAO.getInstance().getAll();
		}catch(Exception ex){
			return l;
		}
		String code = "";
		String value = "";
		String field = "VALUE2";
		LocaleBean bean = new LocaleBean();
		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			code = Util.getString(hm.get("CODE"));
			value = Util.getString(hm.get(field));
			l.add(new SelectItem(code,value));
		}
		return l;
	}
	
	private static List getCountryList_zh_TW() {
		List l = new ArrayList();
		Collection col = null;
		try{
			col = CountryCodeDAO.getInstance().getAll();
		}catch(Exception ex){
			return l;
		}
		String code = "";
		String value = "";
		String field = "VALUE3";
		LocaleBean bean = new LocaleBean();
		for(Iterator it=col.iterator();it.hasNext();){
			HashMap hm = (HashMap)it.next();
			code = Util.getString(hm.get("CODE"));
			value = Util.getString(hm.get(field));
			l.add(new SelectItem(code,value));
		}
		return l;
	}
	
}
