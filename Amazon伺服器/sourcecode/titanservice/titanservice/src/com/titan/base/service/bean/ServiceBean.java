package com.titan.base.service.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class ServiceBean {
	private String service_id = "0";
	private String service_name = "";
    private String service_shortname = "";
    
    private int trial2std_extra = 0;
	
	public ServiceBean(HashMap hm){
		if(hm!=null){
			this.service_id = Util.getString(hm.get("SERVICE_ID"));
			this.service_name = Util.getString(hm.get("SERVICE_NAME"));
            this.service_shortname = Util.getString(hm.get("SERVICE_SHORT_NAME"));
            this.trial2std_extra = Util.getInteger(hm.get("TRIAL2STD_EXTRA"), 0);
		}
	}
	
	public String getService_name() {
		return service_name;
	}
	public void setService_name(String service_name) {
		this.service_name = service_name;
	}
	public String getService_id() {
		return service_id;
	}
	public void setService_id(String service_id) {
		this.service_id = service_id;
	}

    public String getService_shortname() {
        return service_shortname;
    }

    public void setService_shortname(String service_shortname) {
        this.service_shortname = service_shortname;
    }

	public int getTrial2std_extra() {
		return trial2std_extra;
	}

	public void setTrial2std_extra(int trial2std_extra) {
		this.trial2std_extra = trial2std_extra;
	}

}
