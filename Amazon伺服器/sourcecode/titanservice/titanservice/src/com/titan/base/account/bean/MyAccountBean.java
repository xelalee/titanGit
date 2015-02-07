
package com.titan.base.account.bean;

import java.util.HashMap;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.app.countrycode.bean.CountryCodeBean;
import com.titan.base.app.countrycode.dao.CountryCodeDAO;
import com.titan.mytitan.login.bean.LocaleBean;


public class MyAccountBean extends AccountBean{
	public MyAccountBean(){
		super();
	}
	
	public MyAccountBean(HashMap<String, Object> hm){
		super(hm);
	}
	
	public String getFullname() {
		String rst = "";
		LocaleBean bean = new LocaleBean();
		if (bean.getLocale().equalsIgnoreCase(LocaleBean.LOCALE_ZH_CN)
				|| bean.getLocale().equalsIgnoreCase(LocaleBean.LOCALE_ZH_TW)) {
			rst = this.getLast_name() + this.getFirst_name();
		} else {
			rst = this.getFirst_name() + "." + this.getLast_name();
		}
		return rst;
	}
	
	public String getCountry(){
		String rst = "";
		CountryCodeBean bean = null;
		try{
			bean = CountryCodeDAO.getInstance().get(super.getCountry_code());
		}catch(Exception ex){
		}
		if(bean!=null){
			rst = bean.getValue((new LocaleBean()).getLocale());
		}
		return rst;
	}

}
