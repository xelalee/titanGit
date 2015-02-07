<%@ page language="java" %>
<%@ page import="java.util.*" %>
<%@ page import="java.text.*" %>
<%@ taglib uri='/WEB-INF/struts-template.tld' prefix='template' %>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>
<%
    response.addHeader("Pragma", "No-cache");
    response.addHeader("Cache-Control", "no-cache");
    //response.addDateHeader("Expires", 1);
    String rootDirectory = (String) request.getContextPath();
%>
<html>
<head>
<title><template:get name='title'/></title>

<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<script language="JavaScript" src="<%=rootDirectory%>/js/util.js"></script>

<script language="JavaScript">

function initHeight(){
  var clientHeight = document.body.clientHeight;
  document.getElementById("table_middle").height = clientHeight-108;
}

</script>

</head>

<body leftmargin="0" topmargin="0"  onload="javascript: initHeight();">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <table width="100%" height="80" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="80">
                  <!-- table1 start of inculed Header -->
		  <template:get name='top'/>
                  <!-- table1 end of include Hearder -->
	  </td>
        </tr>
      </table>
      <table id="table_middle" width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <!-- table2 start of include Left -->
            <template:get name='left'/>
            <!-- table2 end of include Left -->
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
            <!-- table3 start of include Content -->
            <template:get name='content'/>
            <!-- table3 end of include Content -->
          </td>
          <td width="1" align="left" valign="top" background="<%=rootDirectory%>/images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="<%=rootDirectory%>/images/1px.gif" width="1" height="1"></td>
          <td width="2" align="left" valign="top" bgcolor="#FFFFFF">
            <!-- table4 start of include Right -->
            <template:get name='right'/>
            <!-- table4 end of include Right -->
          </td>
        </tr>
      </table>
      <table width="100%" height="28" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">
        <tr>
          <td height="28">
              <!-- table5 start of include include Footer -->
	      <template:get name='bottom'/>
              <!-- table5 end of include include Footer -->
	  </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
