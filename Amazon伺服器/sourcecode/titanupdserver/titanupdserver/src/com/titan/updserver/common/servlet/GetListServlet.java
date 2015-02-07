package com.titan.updserver.common.servlet;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

import com.titan.util.Keys;
import com.titan.util.Util;
import com.titan.updserver.common.GetObjectListProcessor;
import com.titan.updserver.signature.GetSignatureListProcessor;

public class GetListServlet extends HttpServlet {

    public void init() throws ServletException {

    }


    public void doGet(HttpServletRequest request, HttpServletResponse response) throws
        ServletException, IOException {
    	process(request,response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws
        ServletException, IOException {
    	process(request,response);
    }
    
    private void process(HttpServletRequest request, HttpServletResponse response) throws
        ServletException,IOException{
    	String type = Util.getString(request.getParameter("type"), Keys.STR_SIGNATURE);
    	
    	GetObjectListProcessor processor = null;
    	
    	if(type.equalsIgnoreCase(Keys.STR_SIGNATURE)){
    		processor = new GetSignatureListProcessor();
    	}
    	
    	if(processor==null){
    		processor = new GetSignatureListProcessor();
    	}
    	
    	processor.process(request, response);
    }

    public void destroy() {

    }

}
