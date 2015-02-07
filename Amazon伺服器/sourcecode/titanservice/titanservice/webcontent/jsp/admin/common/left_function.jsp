<%@ page import="java.util.*" %>
<%@ page import="com.titan.base.util.Util" %>
<%@ page import="com.titan.base.util.Keys" %>
<%@ page import="com.titan.admin.account.dao.AdministratorDAO" %>
<%@ page import="com.titan.admin.account.bean.AdministratorBean" %>

<%
    String rtDir = (String)request.getContextPath();

    String menuName = Util.getString(request.getParameter("Menu"));
    
    Collection col_AccountMenudata = null;
    
    AdministratorDAO dao = new AdministratorDAO();
    
    //Set Sssion or check Session
    if(!menuName.equals("")) {
       session.setAttribute("Menu", menuName);
    } else {
    	menuName = Util.getString((String)session.getAttribute("Menu"));
    }
    
    //From Session value
    AdministratorBean userInfo = (AdministratorBean)request.getSession().getAttribute(Keys.ADMIN_USER_INFO);

    String userName = userInfo.getUsername();
    String account_ID = userInfo.getAccount_id();
    
    col_AccountMenudata = dao.getLoginMenu(account_ID);
%>
<html>

<script language="JavaScript" type="text/JavaScript">
<!--
  
function showSubFunction(funName, menuName) {
  document.getElementById(funName).style.display = "block";

<%
  if(col_AccountMenudata != null && col_AccountMenudata.size() != 0) {
  	HashMap hmpMenuName = new HashMap();
	int countMenu = 0;
%>
    var allMenuName = new Array(<%= col_AccountMenudata.size() %>);
<%
	for(Iterator itMenu = col_AccountMenudata.iterator(); itMenu.hasNext();){
		hmpMenuName = (HashMap)itMenu.next();
%>
		allMenuName[<%= countMenu %>] = "<%= Util.getString(hmpMenuName.get("MENU_NAME")) %>";
<%
		countMenu++;
	}//end for
  }//end if
%> 

  for(var i=0; i<allMenuName.length; i++){
	if(funName != allMenuName[i])
		document.getElementById(allMenuName[i]).style.display = "none";
  }

}

//-->
</script>

<body bgcolor="#F2F2F2" alink="#999900" leftmargin="0" topmargin="0">
<table width="190" border="0" cellspacing="0" cellpadding="0">

<%
  if(col_AccountMenudata != null && col_AccountMenudata.size() != 0) {
     for(Iterator it_menu = col_AccountMenudata.iterator(); it_menu.hasNext();) {
         HashMap menu_dataMap = (HashMap)it_menu.next();        
         
         String menu_name = Util.getString(menu_dataMap.get("MENU_NAME"));
         String menu_ID = Util.getString(menu_dataMap.get("MENU_ID"));
%>
	<tr>
		<td colspan="3">&nbsp;&nbsp;<a href="javascript:showSubFunction('<%=menu_name%>', '<%=menuName%>');"><strong><%=menu_name%></strong></a></td>
	</tr>
	<tr bgcolor="#F2F2F2" id="<%=menu_name%>" style="<%= menuName.equals(menu_name) ? "display:block" : "display:none" %>">
		<td width="18">&nbsp;</td>
		<td width="152" valign="top">
<%
	Collection col_AccountFunctiondata = dao.getLoginFunction(account_ID, menu_ID);
	
	for(Iterator it_fun = col_AccountFunctiondata.iterator(); it_fun.hasNext();) {
            HashMap fun_dataMap = (HashMap)it_fun.next();
%>		
			<a href="<%=rtDir %><%=Util.getString(fun_dataMap.get("URL"))%>?Menu=<%=menu_name%>">&nbsp;<%=Util.getString(fun_dataMap.get("FUNCTION_NAME"))%></a><br>
<%
	}
%>
                </td>
		<td width="21">&nbsp;</td>
	</tr>
<%
     }  //For end
  }  //IF end
%>
	<tr valign="top">
		<td colspan="3"></td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
</table>
</body>
</html>
