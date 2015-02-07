package com.titan.register.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

public abstract class ResponseBase {
	protected static final String RETURNS_START = "<returns>";
	protected static final String RETURNS_END = "</returns>";
	
	public ResponseBase(){
	}
	
	public abstract String combineResponse();
	
	public abstract String toString();
	
	public void sendResponse(HttpServletResponse response) throws IOException{
    	response.setContentType("text/plain");
    	response.getWriter().println(this.combineResponse());
	}

}
