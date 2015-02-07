
<%
        String rootDirectory = (String)request.getContextPath();

	if (request.getProtocol().compareTo("HTTP/1.0") == 0){
		response.setHeader("Pragma", "no-cache");
	}

	if (request.getProtocol().compareTo("HTTP/1.1") == 0){
		response.setHeader("Cache-Control", "no-cache");
	}

	response.setDateHeader("Expires", 0);
%>
<html>
<head>
<title>Titan Service</title>

<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

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
    <td height="25" valign="bottom" bgcolor="#F0F0F0" colspan="2">
    </td>
  </tr>
</table>
</body>
