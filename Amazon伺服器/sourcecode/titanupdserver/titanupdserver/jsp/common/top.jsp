<%@ page import="com.titan.util.SystemUtil"%>
<%@ page import="com.titan.util.Configure"%>

<%
        String rootDirectory = (String)request.getContextPath();

	if (request.getProtocol().compareTo("HTTP/1.0") == 0){
		response.setHeader("Pragma", "no-cache");
	}

	if (request.getProtocol().compareTo("HTTP/1.1") == 0){
		response.setHeader("Cache-Control", "no-cache");
	}

	response.setDateHeader("Expires", 0);	
	
	String server_info="";
%>
<%
	server_info="Master Server(Host:"+Configure.LOCAL_HOST+")";

%>
<html>
<head>
<title>Titan Service</title>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">
<link href="<%=rootDirectory%>/css/button.css" rel="stylesheet" type="text/css">

<script language="JavaScript">
<!--
function toLogout(){
    form_top.action = '<%= rootDirectory %>/logout';
    form_top.hidFunction.value='LOGOUT';
    form_top.hidAction.value='LOGOUT';
	form_top.target= "";
	form_top.submit();
}


-->
</script>

</head>
<body>
<table width="100%" height="80" border="0" cellpadding="0" cellspacing="0">
  <!--DWLayoutDefaultTable-->
  <tr>
    <td width="766" height="53" bgcolor="#F0F0F0"><img src="<%=rootDirectory%>/images/titan_logo.gif" width="250" height="53"></td>
    <td width="290" height="53" border="0" bgcolor="#F0F0F0" > <div align="right"><img src="<%=rootDirectory%>/images/header_bg.png" width="400" height="53"></div></td>
  </tr>
  <tr bgcolor="#990000">
    <td height="3"></td>
    <td height="2"></td>
  </tr>
  <tr bgcolor="#F0F0F0">
    <td width="80%" align="center">
	  <p>
	  <font size='2'>
	  <%=server_info%>
	  </font>  
	  </p>   
    </td>
	<form name="form_top" method="post" action="">
    <td width="20%" height="25" valign="bottom" bgcolor="#F0F0F0">
    	<div align="right"> 
          <p class="titleblue"> 
            <input type='hidden' name='hidFunction' value="">
            <input type='hidden' name='hidAction' value="">
            <a href="javascript:toLogout();" target="_parent" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image11','','<%=rootDirectory%>/images/tab_oo.jpg',1)">
            <img src="<%=rootDirectory%>/images/tab_o.jpg" alt="Logout" name="Image11" border="0" width="68" height="19" align="absbottom">
            </a>
          </p>
        </div>
    </td>
	</form>
  </tr>
</table>
</body>
