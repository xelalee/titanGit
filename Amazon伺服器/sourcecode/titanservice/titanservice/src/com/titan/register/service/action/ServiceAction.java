package com.titan.register.service.action;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Hashtable;
import javax.servlet.http.HttpServletRequest;

import com.titan.base.service.business.ServiceRefresh;
import com.titan.base.service.business.ServiceRegister;
import com.titan.base.util.LicenseUtil;
import com.titan.base.util.Util;
import com.titan.register.controller.ActionAbstract;
import com.titan.register.controller.CommonResponse;
import com.titan.register.controller.ResponseBase;
import com.titan.register.service.ServiceResponse;

public class ServiceAction extends ActionAbstract{
	
	private static final long MIN_INTERVAL = 15;
	
	private static Hashtable<String, Long> macTimeMap = new Hashtable<String, Long>();

	@Override
	public HashMap<String, String> parseRequest(HttpServletRequest request) {
		HashMap<String, String> map = new HashMap<String, String>();
		map.put("mac", Util.getString(request.getParameter("mac")));
		map.put("lk", Util.getString(request.getParameter("lk")));
		return map;
	}

	@Override
	public ResponseBase handle(HashMap<String, String> requestMap)
			throws SQLException {
		String mac = requestMap.get("mac");
		String lk = requestMap.get("lk");
		
		//time protection
		long interval = intervalCheck(mac);
		if(interval>0){
			CommonResponse r = new CommonResponse("ERR_OPERATION_TOO_FREQUENT");
			r.setMessage(r.getMessage().replace("#time#", String.valueOf(interval)));
			return r;
		}
		
		ServiceResponse resp = new ServiceResponse();
		
		boolean lkFormatOK = LicenseUtil.validateLk(lk);
		
		if(!lkFormatOK){
            resp = new ServiceResponse("ERR_INVALID_LICENSE_KEY");
            return resp;			
		}
        
        ServiceRegister sr = new ServiceRegister(mac, lk);
        
        boolean succ = sr.register();
        
        logger.debug("sr.register(): "+succ);
        
        String sku = ServiceRefresh.getSKUString(mac); 
        
        if(succ){
        	resp.setSku(sku);
        }else{
        	resp = new ServiceResponse(sr.getErrorKey());
        }
        
		return resp;
	}
	
	private long intervalCheck(String mac){
		long previous = Util.getLong(macTimeMap.get(mac), 0);
		long current = System.currentTimeMillis()/1000;
		logger.debug("previous: "+previous+", current: "+current);
		long interval = current-previous;
		if(interval>=MIN_INTERVAL){
			macTimeMap.put(mac, current);
			return 0;
		}else{
			return MIN_INTERVAL-interval;
		}
		
	}
}
