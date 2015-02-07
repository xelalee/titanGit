<%@ page contentType="text/html; charset=UTF-8" %>

<%@ page import="com.titan.base.util.Util" %>

<%@page import="com.titan.base.product.bean.MyProductBean"%>
<%@page import="com.titan.base.product.dao.MyProductDAO"%>

<%@page import="com.titan.base.service.bean.MyServiceBean"%>
<%@page import="com.titan.base.service.dao.MyServiceDAO"%>

<%@page import="com.titan.base.account.bean.AccountBean"%>
<%@page import="com.titan.base.account.dao.AccountDAO"%>


<%@ taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="java.util.List"%>


<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();

    MyProductBean myProduct = null;
    
    String sn = "";
    String mac = "";
    
    String username = "";

	if(session.getAttribute("service_reset_myproduct")!=null){
		myProduct = (MyProductBean)session.getAttribute("service_reset_myproduct");
		sn = myProduct.getSn();
		mac = myProduct.getMac();
		
		AccountBean account = AccountDAO.getInstance().getAccountByAccountId(myProduct.getAccount_id());
		
		username = account.getUsername();
	}
	
	List<MyServiceBean> myServices = null;
	if(session.getAttribute("service_reset_myservice")!=null){
		myServices = (List<MyServiceBean>)session.getAttribute("service_reset_myservice");
	}

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
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Service Reset <br>
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
            <input name="SERIAL_NUMBER" value="<%= sn %>" size="40" maxlength="30" class="content3">
            </p>
            </td>
          </tr> 
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">Mac Address</span> </td>
            <td> 
            <p class="content3">
            <input name="MAC_ADDRESS" value="<%= mac %>" size="40" maxlength="40" class="content3">
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
           <input class="button" type="button" value="Search" name="Search" onClick="toSearch();">
        </p>
      </td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>

      </td>
    </tr>
  </table>
</form> 

<table>
<tr>
<td width="20px" height="27">&nbsp;</td>
<td>
<%
if(myProduct!=null){
%>
            <table width ="400" border = "0" align = "left">
            <tr>
                <td class="table_1">User Name</td>
                <td class="table_1">Device Model</td>
                <td class="table_1">Serial Number</td>
                <td class="table_1">MAC Address</td>
            </tr>
            <tr align="center">
            	<td class="table_2"><%=username %></td>
                <td class="table_2"><%=myProduct.getModel().getModel_name()%></td>
                <td class="table_2"><%=myProduct.getSn()%></td>
                <td class="table_2"><%=myProduct.getMac()%></td>
            </tr>
            </table>
<%
}
%>
</td>
</tr>
<tr>
<td width="20px" height="27">&nbsp;</td>
<td>
<%
if(myServices!=null && myServices.size()>0){
%>
                        <table width="700" border="0">
                            <tr>
                                <td width="20%" class="table_1">Service</td>
                                <td width="15%" class="table_1">Service Type</td>
                                <td width="20%" class="table_1">Status</td>
                                <td width="25%" class="table_1">Begin Date</td>
                                <td width="20%" class="table_1">Expiration DAte</td>
                            </tr>
<%
                        String rowStyle = "";
						for(MyServiceBean bean: myServices){
							rowStyle = rowStyle.equals("table_2")?"table_3":"table_2";

%>
                            <tr class="<%=rowStyle%>" align="center">
                                <td><%=bean.getService_name()%></td>
                                <td><%=bean.getService_type_id()%></td>
                                <td><%=bean.getStatus()%></td>
                                <td><%=bean.getBegin_date()%></td>
                                <td><%=bean.getExpiration_date_disp()%></td>
                            </tr>

                        </table>
<%	
						}
}
%>
</td>
</tr>
<tr>
<td width="20px" height="27">&nbsp;</td>
<td>
<%
if(myProduct!=null){
%>
<form name="form2" method="post" action="">
  
  <input type='hidden' name='MY_PRODUCT_ID' value="<%= myProduct.getMy_product_id() %>">
       
  <div>
       <input class="button" type="button" value="Reset" name="Reset" onClick="toSubmit();">
       <input class="button" type="button" value="Cancel" name="Cancel" onClick="toCancel();">
  </div>

</form>

<%
}
%>
</td>
</tr>
</table>

</div>

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

function toSearch() {
	  
	  var err_message = checkField();
	  if(err_message != '') {
	     alert(err_message);
	     return;
	  } else {
	     
	     document.form1.action = '<%=rootDirectory %>/controller?action=ServiceResetAction&dispatch=search';
	     document.form1.submit();	     
	  }
}

function toSubmit() {  
	  gowait();
	  document.form2.action = '<%=rootDirectory%>/controller?action=ServiceResetAction&dispatch=reset';
	  document.form2.submit();
	  
}

function checkField() {
    var message = "";
	
    var sn = trim(document.form1.SERIAL_NUMBER.value);
    var mac = trim(document.form1.MAC_ADDRESS.value);
    
    if((sn+mac)==""){
      message = "Please input query condition!";
    }
  
  return message;
}

function toCancel() { 
	  location.href = '<%=rootDirectory%>/jsp/admin/service/serviceReset.jsf';
}


//-->
</script>



