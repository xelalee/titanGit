package com.titan.updserver.common.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.updserver.signature.bean.SignatureBean;
import com.titan.util.*;

public class UploadPlatformServlet extends HttpServlet{
    
    static Logger logger = Logger.getLogger(UploadPlatformServlet.class);

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
    	
    }
    
    private void handleResponse(HttpServletRequest request, HttpServletResponse response,String ERROR,String MSG) throws
    ServletException,IOException{
    }
    
    private CodeMessageJavaBean fetchSignature(String sourceurl,SignatureBean sjb){
    	return null;
    }

    public void destroy() {

    }	
}