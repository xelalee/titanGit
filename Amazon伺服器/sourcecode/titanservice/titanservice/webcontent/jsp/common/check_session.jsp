<%@ page import="com.titan.mytitan.login.bean.SessionBean" %>

<%  
    final String page_session_timeout = "/jsp/login/session_timeout.jsf";
    final String page_session_kickoff = "/jsp/login/session_kickoff.jsf";    
    
    SessionBean sessionbean = new SessionBean();
    String flag = sessionbean.checkSession();
	if(flag.equals(SessionBean.NORMAL)){
		//do nothing
	}else if(flag.equals(SessionBean.TIME_OUT)){
%>
    <jsp:forward page="<%=page_session_timeout %>" />
<%
	    return;
	}else if(flag.equals(SessionBean.KICK_OFF)){
%>
    <jsp:forward page="<%=page_session_kickoff %>" />
<%
		return;
	}
%>
