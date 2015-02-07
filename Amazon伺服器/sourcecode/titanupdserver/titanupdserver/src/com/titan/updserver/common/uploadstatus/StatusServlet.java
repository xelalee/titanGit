package com.titan.updserver.common.uploadstatus;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class StatusServlet extends HttpServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		HttpSession session = request.getSession();
		
		UploadStatusBean bean = (UploadStatusBean)session.getAttribute("UPLOAD_STATUS");
		if(bean==null){
			bean = new UploadStatusBean();
		}
		response.reset();
		PrintWriter out = response.getWriter();
		
		out.write("{\"pBytesRead\":"+bean.getpBytesRead()
				+",\"pContentLength\":"+bean.getpContentLength()
				+",\"pItems\":"+bean.getpItems()
				+",\"percent\":"+bean.calculatePercent()+"}");
		out.flush();
	}
	
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		this.doPost(request, response);
	}
}
