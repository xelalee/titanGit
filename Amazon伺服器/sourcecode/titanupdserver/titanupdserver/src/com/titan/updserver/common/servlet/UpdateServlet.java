package com.titan.updserver.common.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.titan.updserver.common.UpdateProcessor;
import com.titan.updserver.firmware.FirmwareUpdateProcessor;
import com.titan.updserver.signature.SignatureUpdateProcessor;
import com.titan.util.Util;

public class UpdateServlet extends HttpServlet {
	
	static Logger logger = Logger.getLogger(UpdateServlet.class);

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		process(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		process(request, response);
	}

	private void process(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String action = Util.getString(request.getParameter("action"));
		
		UpdateProcessor processor;
		
		if(action.equalsIgnoreCase("sigUpdate")){
			processor = SignatureUpdateProcessor.getInstance();
			processor.process(request, response);
		}else if(action.equalsIgnoreCase("fwUpdate")){
			processor = FirmwareUpdateProcessor.getInstance();
			processor.process(request, response);
		}else{
			logger.error("invalid action: "+action+", ip: "+request.getRemoteAddr());
		}

	}

}
