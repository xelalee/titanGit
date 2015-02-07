<%@ page import="java.util.HashMap" %>
<%@ page import="com.titan.util.Keys" %>
<%--@ page import="com.titan.util.Util" --%>

<%

	HashMap hmUser = (HashMap)session.getAttribute(Keys.USER_INFO);
        
	if (hmUser==null){   
%>
           <jsp:forward page="/jsp/common/session_timeout.jsp" />
			
<%
	   return;
	}

%>