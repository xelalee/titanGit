package com.titan.mytitan.service.bean;

import org.apache.log4j.Logger;

import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.service.bean.MyServiceBean;
import com.titan.base.util.Util;
import com.titan.mytitan.app.util.ViewUtil;

public class SubMyServiceBean {
	
	private static Logger logger = Logger.getLogger(SubMyServiceBean.class);
	
	protected MyProductBean myproductbean;
	
	protected MyServiceBean service;
	
	private int id = 0;
	
	private boolean refreshLinkRendered = false;
	private String refreshLink = "#";
	
	public SubMyServiceBean(){
		
	}
	
	public SubMyServiceBean(MyServiceBean service){
		this.service = service;
		try{
			this.myproductbean = MyProductDAO.getInstance().getByMyProductId(service.getMy_product_id());
		}catch(Exception ex){
			ex.printStackTrace();
		}
	}

	public MyServiceBean getService() {
		return service;
	}

	public void setService(MyServiceBean service) {
		this.service = service;
	}

	public boolean isRefreshLinkRendered() {
		return refreshLinkRendered;
	}

	public void setRefreshLinkRendered(boolean refreshLinkRendered) {
		this.refreshLinkRendered = refreshLinkRendered;
	}

	public String getRefreshLink() {
		return refreshLink;
	}

	public void setRefreshLink(String refreshLink) {
		this.refreshLink = refreshLink;
	}		
	
	public boolean isActivateRendered() {
		return this.service.getMy_service_id().equalsIgnoreCase("");
	}

	public boolean isUpgradeRendered() {
		return !this.service.getMy_service_id().equalsIgnoreCase("");
	}
	
	public boolean isDashRendered() {
		return false;
	}	

	public static String getCFRefreshLink(String regi_id){
		String mac = Util.getString(ViewUtil.getSession("mac"));
		String ip = Util.getString(ViewUtil.getSession("ip"));
		String port = Util.getString(ViewUtil.getSession("port"));
		String https = Util.getString(ViewUtil.getSession("https"));
		String http_prefix = "http://";
		if(https.equalsIgnoreCase("y")){
			http_prefix = "https://";
		}
		return http_prefix+ip+":"+port+"?mac="+mac+"&register=y&regi_id="+regi_id;
		
	}
	
	/**
	 * overrite
	 */
	public String getService_name() {
		return this.service.getService_name();
	}
	
	/**
	 * overrite
	 */	
	public String getExpiration_date_disp(){
		String rst = "";
		if(this.service.getRemark().equalsIgnoreCase("Unlimited")){
			rst = this.service.getRemark();
		}else{
			String expirationDate = this.service.getExpiration_date();
			String originalDate = this.service.getOriginal_date();
			int blank_index1 = expirationDate.indexOf(" ");
			int blank_index2 = originalDate.indexOf(" ");
			if(blank_index1 > -1){
				expirationDate = expirationDate.substring(0,blank_index1);
			}
			if(blank_index2 > -1){
				originalDate = originalDate.substring(0,blank_index2);
			}
			if(expirationDate.compareTo(originalDate)>0){
				rst = originalDate + "<BR><SPAN class=\"star\">extends to</SPAN><BR>" + expirationDate;
			}else{
				rst = expirationDate;
			}
		}

		logger.debug("getExpiration_date_disp this.remark:"+this.service.getRemark()+" rst:"+rst);
		return rst;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

}
