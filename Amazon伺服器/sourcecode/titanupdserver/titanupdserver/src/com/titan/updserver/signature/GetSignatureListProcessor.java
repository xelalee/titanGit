package com.titan.updserver.signature;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.titan.util.ParseXml;
import com.titan.updserver.common.GetObjectListProcessor;
import com.titan.updserver.signature.dao.SignatureDao;
import com.titan.util.Keys;
import com.titan.util.Util;

public class GetSignatureListProcessor implements GetObjectListProcessor {

	public void process(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
    	Collection col = new ArrayList();
    	response.setContentType("text/html");
    	
    	String device_type = Util.getString(request.getParameter("device_type"));
    	String service_type = Util.getString(request.getParameter("device_type"));
    	PrintWriter out=response.getWriter();
    	try{
    	    col = SignatureDao.getInstance().getSignature(device_type,service_type, false);
    	}catch(Exception ex){
        	response.sendError(Keys.INTERNAL_SERVER_ERROR);
        	return;
    	}
    	out.println(ParseXml.WriteXMLString(col,Keys.XML_RECORD_ATTRIBUTES));

	}

}
