package com.titan.base.product.bean;

import java.util.HashMap;

import com.titan.base.util.Util;


public class MyProductBean {
	public static final String STR_MY_PRODUCT_ID = "MY_PRODUCT_ID";
	protected ModelBean model;
	
	private String my_product_id = "0";
	private String account_id = "0";
	private String model_id = "0";
	private String sn = "";
	private String mac = "";
	private String friendly_name = "";
	private String status = "";
	private String flag = "";
	private String purchase_date = "";
	private String purchase_from = "";
	private String count = "0";
	private String create_date = "";
	private String create_by = "";
	private String update_date = "";
	private String update_by = "";
	
	public MyProductBean(){
		model = new ModelBean();
	}
	
	public MyProductBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.my_product_id = Util.getString(hm.get("MY_PRODUCT_ID"));
			this.account_id = Util.getString(hm.get("ACCOUNT_ID"));
			this.model_id = Util.getString(hm.get("MODEL_ID"));
			this.model = new ModelBean();
			this.model.setModel_name(Util.getString(hm.get("MODEL_NAME")));
			this.sn = Util.getString(hm.get("SN"));
			this.mac = Util.getString(hm.get("MAC"));
			this.friendly_name = Util.getString(hm.get("FRIENDLY_NAME"));
			this.status = Util.getString(hm.get("STATUS"));
			this.flag = Util.getString(hm.get("FLAG"));
			this.purchase_date = Util.getString(hm.get("PURCHASE_DATE"));
			this.purchase_from = Util.getString(hm.get("PURCHASE_FROM"));
			this.count = Util.getString(hm.get("COUNT"));
			this.create_date = Util.getString(hm.get("CREATE_DATE"));			
			this.create_by = Util.getString(hm.get("CREATE_BY"));
			this.update_date = Util.getString(hm.get("UPDATE_DATE"));				
			this.update_by = Util.getString(hm.get("UPDATE_BY"));
		}
	}

	public String getAccount_id() {
		return account_id;
	}

	public void setAccount_id(String account_id) {
		this.account_id = account_id;
	}

	public String getMac() {
		return mac;
	}

	public void setMac(String mac) {
		this.mac = mac;
	}

	public String getCount() {
		return count;
	}

	public void setCount(String count) {
		this.count = count;
	}

	public String getCreate_by() {
		return create_by;
	}

	public void setCreate_by(String create_by) {
		this.create_by = create_by;
	}

	public String getCreate_date() {
		return create_date;
	}

	public void setCreate_date(String create_date) {
		this.create_date = create_date;
	}

	public String getFlag() {
		return flag;
	}

	public void setFlag(String flag) {
		this.flag = flag;
	}

	public String getFriendly_name() {
		return friendly_name;
	}

	public void setFriendly_name(String friendly_name) {
		this.friendly_name = friendly_name;
	}

	public ModelBean getModel() {
		return model;
	}

	public void setModel(ModelBean model) {
		this.model = model;
	}

	public String getModel_id() {
		return model_id;
	}

	public void setModel_id(String model_id) {
		this.model_id = model_id;
	}

	public String getMy_product_id() {
		return my_product_id;
	}

	public void setMy_product_id(String my_product_id) {
		this.my_product_id = my_product_id;
	}

	public String getPurchase_date() {
		return purchase_date;
	}

	public void setPurchase_date(String purchase_date) {
		this.purchase_date = purchase_date;
	}

	public String getPurchase_from() {
		return purchase_from;
	}

	public void setPurchase_from(String purchase_from) {
		this.purchase_from = purchase_from;
	}

	public String getSn() {
		return sn;
	}

	public void setSn(String sn) {
		this.sn = sn;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getUpdate_by() {
		return update_by;
	}

	public void setUpdate_by(String update_by) {
		this.update_by = update_by;
	}

	public String getUpdate_date() {
		return update_date;
	}

	public void setUpdate_date(String update_date) {
		this.update_date = update_date;
	}
	
}
