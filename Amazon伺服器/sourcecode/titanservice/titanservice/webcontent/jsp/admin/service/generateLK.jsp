<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="java.util.List"%>

<%@page import="com.titan.base.product.dao.Model2ServiceDAO"%>
<%@page import="com.titan.base.product.bean.Model2ServiceBean"%>

<%@page import="com.titan.base.product.dao.ModelDAO"%>
<%@page import="com.titan.base.product.bean.ModelBean"%>

<%@page import="com.titan.base.service.bean.LicenseBean"%>

<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();
    String serviceCode0 = Util.getString(request.getAttribute("serviceCode"));
    String cardType0 = Util.getString(request.getAttribute("cardType"));
    String quantity0 = Util.getString(request.getAttribute("quantity"));
    String usage0 = Util.getString(request.getAttribute("usage"));
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
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Generate License Key <br>
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
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC" width="35%"><span class="star">* </span><span class="content3">Service Code</span></td>
            <td colspan="2" width="65%" valign="top" class="content3">
                <select name="serviceCode" class="content3">
                <%
                List<Model2ServiceBean> serviceCodes= Model2ServiceDAO.getInstance().getServiceCodes("S");
                for(Model2ServiceBean bean : serviceCodes){
                	if(bean.getService_type_id().equalsIgnoreCase("T")){
                		continue;
                	}
                	String serviceCode = bean.getService_type_id()+"-"+bean.getService_code();
                %>
              	  <option value="<%=serviceCode%>" <%=serviceCode.equalsIgnoreCase(serviceCode0)?"selected":"" %>><%=serviceCode%></option>
              	<%
                }
              	%>
			    </select>
            </td>
          </tr>                 
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Card Type</span></td>
            <td colspan="2" valign="top" class="content3">
                <select name="cardType" class="content3">
                <%
                List<String> cardTypes= ModelDAO.getInstance().getCardTypes();
                for(String cardType : cardTypes){
                %>
              	  <option value="<%=cardType%>" <%=cardType.equalsIgnoreCase(cardType0)?"selected":"" %>><%=cardType%></option>
              	<%
                }
              	%>
			    </select>
            </td>
          </tr>
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Quantity</span></td>
            <td colspan="2" valign="top"> 
                <input class="content3" id="quantity" name="quantity" size="30" maxlength="3" value="<%=quantity0%>">
            </td>
          </tr>         
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Usage</span></td>
            <td colspan="2" valign="top" class="content3">
                <select name="usage" class="content3">
              	  <option value="Formal" <%=usage0.equals("Formal")?"selected":"" %>>Formal</option>
              	  <option value="Test" <%=usage0.equals("Test")?"selected":"" %>>Test</option>
			    </select>
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
if(request.getAttribute("GENERATED_LICENSE_KEYS")!=null){
	String order_id = Util.getString(request.getAttribute("ORDER_ID"));
%>
<div>
 <table width="80%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
   <tr>
   <td align="right"><a href="<%=rootDirectory%>/controller?action=GenerateLKAction&dispatch=export&order_id=<%=order_id%>" target="_blank">Export License Key</a></td>
   </tr>
   <tr>
   <td>
		<display:table name="GENERATED_LICENSE_KEYS" class="its" export="false" id="row" >
		   <display:column property="license_key" title="License Key"/>
		   <display:column property="card_type" title="Card Type"/>

           <display:setProperty name="basic.msg.empty_list" value="No license key found to display"/>
           <display:setProperty name="paging.banner.item_name" value="license key"/>
           <display:setProperty name="paging.banner.items_name" value="license keys"/>
           <display:setProperty name="paging.banner.placement" value="bottom"/>
           <display:setProperty name="paging.banner.onepage" value=""/>
        </display:table>   
   </td>
   </tr>
 </table>
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
	     document.form1.action = '<%=rootDirectory %>/controller?action=GenerateLKAction&dispatch=';
	     document.form1.submit();
	  }
	}

function checkField() {
  
  var quantity = document.form1.quantity.value;
  
  var message = '';
  
  if(quantity == "") {
     message = "Quantity is required.\n";
  }
  
  return message;
}

function toCancel() { 
	  location.href = '<%=rootDirectory%>/jsp/admin/service/generateLK.jsf';
}

function filterInput(event){
	this.value = this.value.replace(/[^0-9\n]/g,"");
}

var input = document.getElementById("quantity");

input.onkeyup = filterInput;


//-->
</script>



