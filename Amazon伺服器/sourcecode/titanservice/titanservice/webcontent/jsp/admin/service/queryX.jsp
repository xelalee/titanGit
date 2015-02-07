<%@ page contentType="text/html; charset=UTF-8" %>

<%@ page import="com.titan.base.util.Util" %>

<%@page import="com.titan.admin.service.bean.QueryXBean"%>

<%@ taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="java.util.List"%>


<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();

	String SERIAL_NUMBER = Util.getString(request.getAttribute("SERIAL_NUMBER"));
	String MAC_ADDRESS = Util.getString(request.getAttribute("MAC_ADDRESS"));
	String USERNAME = Util.getString(request.getAttribute("USERNAME"));
	String EMAIL = Util.getString(request.getAttribute("EMAIL"));
	String LICENSE_KEY = Util.getString(request.getAttribute("LICENSE_KEY"));

%>

<html>
<head>

<link href="<%=rootDirectory %>/css/screen.css" rel="stylesheet" type="text/css">

<title>Service Management</title>
</head>

<body leftmargin="0" topmargin="0">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <table width="100%" height="80" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="80"> 
		    <%@ include file="/jsp/admin/common/top.jsp" %>
	      </td>
        </tr>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <%@ include file="/jsp/admin/common/left_function.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->
<div id="main">

<form name="form1" method="post" action="">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content3">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Service Management</span><br>
        </td>
    </tr> 
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Query X <br>
        </td>
    </tr>    
    <tr>
        <td height="27">&nbsp;</td>
        <td>&nbsp;<br>
        </td>
    </tr>    
    <tr>
      <td>&nbsp;</td>
      <td valign="top">
      	<table width="80%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td width="35%"><span class="content3">Serial Number</span> </td>
            <td width="65%"> 
            <p class="content3">
            <input NAME="SERIAL_NUMBER" value="<%= SERIAL_NUMBER %>" size="40" maxlength="30" class="content3">
            </p>
            </td>
          </tr> 
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">Mac Address</span> </td>
            <td> 
            <p class="content3">
            <input NAME="MAC_ADDRESS" value="<%= MAC_ADDRESS %>" size="40" maxlength="40" class="content3">
            </p>
            </td>
          </tr> 
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">User Name</span> </td>
            <td> 
            <p class="content3">
            <input NAME="USERNAME" value="<%= USERNAME %>" size="40" maxlength="30" class="content3">
            </p>
            </td>
          </tr> 
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">User E-Mail</span> </td>
            <td> 
            <p class="content3">
            <input NAME="EMAIL" value="<%= EMAIL %>" size="40" maxlength="30" class="content3">
            </p>
            </td>
          </tr> 
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">License Key</span> </td>
            <td> 
            <p class="content3">
            <input NAME="LICENSE_KEY" value="<%= LICENSE_KEY %>" size="40" maxlength="30" class="content3">
            </p>
            </td>
          </tr>
        </table>
        </td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>
        <p>&nbsp;</p>
        <p align="left">
           <input class="button" type="button" value="Submit" name="Submit" onClick="toSubmit();">
           <input class="button" type="button" value="Cancel" name="Cancel" onClick="toCancel();">
        </p>
      </td>
    </tr>
  </table>
</form> 
</div>

<%
if(request.getAttribute("QUERY_X_ITEMS")!=null){
%>
<div>
		<display:table name="QUERY_X_ITEMS" class="its" export="false" id="row" >
		<%
		QueryXBean bean = (QueryXBean)pageContext.getAttribute("row");
		
		%>
		   <display:column title="User Name">
		    <%
		    if(bean.getUsername().equals("")){
		    %>
		    N/A
		    <%
		    }else{
		    %>
		    <a href="javascript:showAccountDetail('<%=bean.getUsername()%>')"><%=bean.getUsername()%></a>
		    <%
		    }
		    %>
		    
		   </display:column>
		   <display:column property="sn" title="Serial Number"/>
		   <display:column title="MAC Address">
		    <a href="javascript:showProductDetail('<%=bean.getMac()%>')"><%=bean.getMac()%></a>
		   </display:column>
		   <display:column property="model" title="Model"/>
		   <display:column title="Service Name">
		    <%
		    if(bean.getMy_service_id().equals("")){
		    %>
		    N/A
		    <%
		    }else{
		    %>
		    <a href="javascript:showServiceDetail('<%=bean.getMy_service_id()%>')"><%=bean.getService_name()%></a>
		    <%
		    }
		    %>		   
		    
		   </display:column>
		   <display:column title="Service Type">
		    <%
		    if(bean.getService_type_id().equals("")){
		    %>
		    N/A
		    <%
		    }else{
		    %>
		    <%=bean.getService_type_id().equalsIgnoreCase("S")?"Standard":"Trial" %>
		    <%
		    }
		    %>
		   
		   </display:column>
		   <display:column property="status" title="Status"/>

           <display:setProperty name="basic.msg.empty_list" value="No items found to display"/>
           <display:setProperty name="paging.banner.item_name" value="item"/>
           <display:setProperty name="paging.banner.items_name" value="items"/>
           <display:setProperty name="paging.banner.placement" value="bottom"/>
           <display:setProperty name="paging.banner.onepage" value=""/>
        </display:table>
        
</div>
<%
}
%>
<div id="wait" style="visibility:hidden; position: absolute; top: 60; left: 190">
<%@ include file="/jsp/admin/common/process_on_going.jsp" %>
</div>        
            
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../../images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="../../../images/1px.gif" width="1" height="1"></td>
          <td width="2" align="left" valign="top" bgcolor="#FFFFFF">
            <%@include file="/jsp/common/blank.html" %>
          </td>
        </tr>
      </table>
      <table width="100%" height="20" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">
        <tr>
          <td height="20">
            <%@ include file="/jsp/admin/common/bottom.jsp" %>
	      </td>
        </tr>
      </table>
    </td>
  </tr>
</table>	

</body>
</html>


<script language="JavaScript" type="text/JavaScript">
<!--
function gowait() {
	  document.getElementById("main").style.visibility="hidden";
	  document.getElementById("wait").style.visibility="visible";
	}

function toSubmit() {  
	  gowait();
	  
	  var err_message = checkField();
	  if(err_message != '') {
	     alert(err_message);
	     return;
	  } else {
	     document.form1.action = '<%=rootDirectory%>/controller?action=QueryXAction&dispatch=';
	     document.form1.submit();
	  }
	}

function checkField() {
    var message = "";
	
    var sn = trim(document.form1.SERIAL_NUMBER.value);
    var mac = trim(document.form1.MAC_ADDRESS.value);
    var user = trim(document.form1.USERNAME.value);
    var email = trim(document.form1.EMAIL.value);
    var lk = trim(document.form1.LICENSE_KEY.value);
    
    if((sn+mac+user+email+lk)==""){
      message = "Please input query condition!";
    }
  
  return message;
}

function toCancel() { 
	  location.href = '<%=rootDirectory%>/jsp/admin/service/queryX.jsf';
}

function showAccountDetail(username){
    window.open('<%=rootDirectory%>/jsp/admin/service/queryX_account.jsf?username='+username,'','scrollbars=yes,width=600,height=500,resizable=yes,left=120,top=100');
}

function showProductDetail(mac){
    window.open('<%=rootDirectory%>/jsp/admin/service/queryX_product.jsf?mac='+mac,'','scrollbars=yes,width=600,height=500,resizable=yes,left=120,top=100');
}

function showServiceDetail(my_service_id){
    window.open('<%=rootDirectory%>/jsp/admin/service/queryX_service.jsf?my_service_id='+my_service_id,'','scrollbars=yes,width=600,height=500,resizable=yes,left=120,top=100');
}


//-->
</script>



