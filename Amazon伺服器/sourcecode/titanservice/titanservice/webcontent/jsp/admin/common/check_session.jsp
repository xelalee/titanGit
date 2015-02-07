<%@page import="com.titan.base.util.Keys" %>

<%  
    final String page_session_timeout = "/jsp/admin/login/session_timeout.jsf";  
    Object obj = request.getSession().getAttribute(Keys.ADMIN_USER_INFO);

	if(obj!=null){
		//do nothing
	}else{
%>
    <jsp:forward page="<%=page_session_timeout %>" />
<%
	    return;
	}
%>

