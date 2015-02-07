<%com.titan.mytitan.app.util.CookieUtil cu = new com.titan.mytitan.app.util.CookieUtil();
String remove = (String) request.getParameter("remove");
if(remove!=null && remove!=""){
	cu.removeCookie("COOKIE_LOCALE");
}

String lo = cu.getCookieValue("USER_SITE_COOKIE_LOCALE");%>
USER_SITE_COOKIE_LOCALE:<%=lo%>
<br>

COOKIE_LOCALE:<%=cu.getCookieValue("COOKIE_LOCALE")%>
<br>

<%
Cookie[] cookies = request.getCookies();
for(int i=0;i<cookies.length;i++){
	String name = cookies[i].getName();
	String value = cookies[i].getValue();
%>
	<%=name %>: <%=value %><br>
<%	
}
%>

