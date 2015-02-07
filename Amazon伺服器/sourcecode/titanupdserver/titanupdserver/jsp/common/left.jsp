<%@ page import="java.util.*" %>
<%@ page import="com.titan.util.Util" %>
<%@ page import="com.titan.util.SystemUtil" %>
<%@ page import="com.titan.util.Keys" %>
<%@ page import="com.titan.updserver.account.dao.AccountDao" %>

<%
	String rootDirectory = (String)request.getContextPath(); 
    
    String MenuName = Util.getString(request.getParameter("Menu"));

    Collection col_AccountMenudata = null;
    Collection col_AccountFunctiondata = null;
    
    //Set Sssion or check Session
    if(!MenuName.equals("")) {
       session.setAttribute("Menu", MenuName);
    } else {
       MenuName = Util.getString((String)session.getAttribute("Menu"));
    }
    
    //From Session value
    HashMap userInfo = (HashMap)request.getSession().getAttribute(Keys.USER_INFO);
    String userName ="";
    if(userInfo!=null) userName = Util.getString(userInfo.get("USERNAME"));
    else return;

    col_AccountMenudata = AccountDao.getLoginMenu(userName);
%>
<html>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<script language="JavaScript" type="text/JavaScript">
<!--
  
function showSubFunction(funName, menuName) {
  document.getElementById(funName).style.display = "block";

<%if(col_AccountMenudata != null && col_AccountMenudata.size() != 0) {
  	HashMap hmpMenuName = new HashMap();
	int countMenu = 0;%>
    var allMenuName = new Array(<%=col_AccountMenudata.size()%>);
<%for(Iterator itMenu = col_AccountMenudata.iterator(); itMenu.hasNext();){
		hmpMenuName = (HashMap)itMenu.next();%>
		allMenuName[<%=countMenu%>] = "<%=Util.getString(hmpMenuName.get("MENU_NAME"))%>";
<%countMenu++;
	}//end for
  }//end if%> 

  for(var i=0; i<allMenuName.length; i++){
	if(funName != allMenuName[i])
		document.getElementById(allMenuName[i]).style.display = "none";
  }

}

//-->
</script>

<body bgcolor="#F0F0F0" alink="#999900" leftmargin="0" topmargin="0">
<table width="190" border="0" cellspacing="0" cellpadding="0">

<%
	if(col_AccountMenudata != null && col_AccountMenudata.size() != 0) {
     for(Iterator it_menu = col_AccountMenudata.iterator(); it_menu.hasNext();) {
         HashMap menu_dataMap = (HashMap)it_menu.next();        
         
         String menu_name = Util.getString(menu_dataMap.get("MENU_NAME"));
         String menu_ID = Util.getString(menu_dataMap.get("MENU_ID"));
%>
	<tr>
		<!--td colspan="3"><img src="<%=rootDirectory%>/images/topic_acco.gif" width="190" height="21"></td-->
		<td colspan="3"><img src="images/dot_b.jpg" width="5" height="16" border="0">&nbsp;<a href="javascript:showSubFunction('<%=menu_name%>', '<%=MenuName%>');"><%=menu_name%></a></td>
	</tr>
	<tr bgcolor="#F2F2F2" id="<%=menu_name%>" style="<%=MenuName.equals(menu_name) ? "display:block" : "display:none"%>">
		<td width="18" height="27">&nbsp;</td>
		<td width="152" height="27" valign="top">
<%
	col_AccountFunctiondata = AccountDao.getLoginFunction(userName, menu_ID);
	
	for(Iterator it_fun = col_AccountFunctiondata.iterator(); it_fun.hasNext();) {
            HashMap fun_dataMap = (HashMap)it_fun.next();
%>		
			<img src="<%=rootDirectory%>/images/arrow.gif" width="4" height="6"><a href="<%=rootDirectory%><%=Util.getString(fun_dataMap.get("URL"))%>?Menu=<%=menu_name%>">&nbsp;<%=Util.getString(fun_dataMap.get("FUNCTION_NAME"))%></a><br>
<%
	}
%>
                </td>
		<td width="21" height="27">&nbsp;</td>
	</tr>
<%
     }  //For end
  }  //IF end
%>
	<tr valign="top">
		<td colspan="3"><img src="<%=rootDirectory%>/images/header_bg.png" width="190" height="23"></td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
</table>
</body>
</html>
