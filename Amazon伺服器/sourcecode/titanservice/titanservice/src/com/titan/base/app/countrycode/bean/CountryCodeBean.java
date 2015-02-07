package com.titan.base.app.countrycode.bean;

import java.util.HashMap;

import com.titan.base.util.Keys;
import com.titan.base.util.Util;

public class CountryCodeBean {

    private String code;
    private String description;
    private String value1;
    private String value2;
    private String value3;
    private String value4;
    private String value5;
	
    public CountryCodeBean(){
    	
    }
    
    public CountryCodeBean(HashMap hm){
    	if(hm!=null){
    		this.code = Util.getString(hm.get("CODE"));
    		this.description = Util.getString(hm.get("DESCRIPTION"));
    		this.value1 = Util.getString(hm.get("VALUE1"));
    		this.value2 = Util.getString(hm.get("VALUE2"));
    		this.value3 = Util.getString(hm.get("VALUE3"));
    		this.value4 = Util.getString(hm.get("VALUE4"));
    		this.value5 = Util.getString(hm.get("VALUE5"));
    	}
    	
    }

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getValue1() {
		return value1;
	}

	public void setValue1(String value1) {
		this.value1 = value1;
	}

	public String getValue2() {
		return value2;
	}

	public void setValue2(String value2) {
		this.value2 = value2;
	}

	public String getValue3() {
		return value3;
	}

	public void setValue3(String value3) {
		this.value3 = value3;
	}

	public String getValue4() {
		return value4;
	}

	public void setValue4(String value4) {
		this.value4 = value4;
	}

	public String getValue5() {
		return value5;
	}

	public void setValue5(String value5) {
		this.value5 = value5;
	}
    
    public String getValue(String locale){
    	String value = "";
    	if(locale.equalsIgnoreCase(Keys.LOCALE_ZH_CN)){
    		value = this.getValue2();
    	}else{
    		value = this.getValue1();
    	}
    	return value;
    }


}
