package com.titan.base.product.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class ModelBean {
    
    private String model_id = "0";
    private String model_name = "";
    private String card_type = "";
    
    public ModelBean(){
    }
    
	public ModelBean(HashMap<String, Object> hm){
		if(hm!=null){
			this.model_id = Util.getString(hm.get("MODEL_ID"));
			this.model_name = Util.getString(hm.get("MODEL_NAME"));
			this.card_type = Util.getString(hm.get("CARD_TYPE"));
		}
	}

	public String getModel_id() {
		return model_id;
	}

	public void setModel_id(String model_id) {
		this.model_id = model_id;
	}

	public String getModel_name() {
		return model_name;
	}

	public void setModel_name(String model_name) {
		this.model_name = model_name;
	}

	public String getCard_type() {
		return card_type;
	}

	public void setCard_type(String card_type) {
		this.card_type = card_type;
	}
    
}
