package com.titan.base.controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletConfig;

import org.apache.log4j.Logger;

import com.titan.base.controller.bean.MessageBean;

public interface ActionInterf {
	
	static Logger logger = Logger.getLogger(ActionInterf.class);
	
	public MessageBean process(HttpServletRequest request, HttpServletResponse response, ServletConfig config) throws ServletException, IOException;

}
