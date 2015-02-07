<%@page import="com.titan.base.product.dao.ProductDAO" %>

<%@page import="com.titan.base.product.bean.ProductBean" %>

<%@ page contentType="text/html; charset=UTF-8" %>

<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();
    String curDate = com.titan.base.util.DateUtil.GetCurrentDate();
    
    if(session.getAttribute("targetDate")!=null){
    	curDate = Util.getString(session.getAttribute("targetDate"));
    }
%>

<html>
<head>

<title>Product Management</title>
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

<form name="formProduct" method="post" action="">

<input type='hidden' name='product_macs' >

  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content3">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Product Management</span><br>
        </td>
    </tr> 
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Query MAC <br>
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
      	<table width="50%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC" width="35%"><span class="content3">Import Date</span></td>
            <td valign="top" width="65%"> 
                <input name="targetDate" size="50" value="<%=curDate%>"> 
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
    
  </table>
  
<div>
<%
   List<ProductBean> query_products = (List<ProductBean>)session.getAttribute("query_products");
   if(query_products!=null && query_products.size()>0){
%>
  <table border="1" cellpadding="2" cellspacing="2" bordercolor="#FFFFFF">
    <tr>
      <td colspan="3"><span class="content3">Queried MACs</span></td>
    </tr>
    <tr>
      <td width="30%">SN</td>
      <td width="30%">MAC</td>
      <td width="30%">Model</td>
      <td width="10%"></td>
    </tr>     
    <%
      int i = 0;
      for(ProductBean product: query_products){
    	  i++;
    	  String checkbox_id = "check_product_"+i;
    %>
    <tr>
      <td><%=product.getSn() %></td>
      <td><%=product.getMac() %></td>
      <td><%=product.getModel_name() %></td>
      <td><input type=checkbox id="<%=checkbox_id %>" name="check_product" value="<%=product.getMac()%>"></td>
    </tr>    
    <%
      }
    %>
    
    <tr>
      <td>&nbsp;</td>
      <td colspan="3">
        <p>&nbsp;</p>
        <p align="left">
           <input class="button" type="button" value="Delete" name="Delete" onClick="toDelete();">
           <input class="button" type="button" value="DeleteAll" name="DeleteAll" onClick="toDeleteAll();">
        </p>
      </td>
    </tr>    
  
  </table>
<%	   
	   
   }
%>

</div>   
  
</form> 
</div>



<div id="wait" style="visibility:hidden; position: absolute; top: 60; left: 190">
<%@ include file="/jsp/admin/common/process_on_going.jsp" %>
</div>        
            
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="<%=rootDirectory %>/images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="<%=rootDirectory %>/images/1px.gif" width="1" height="1"></td>
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

function toSearch() {  
	  
	  var err_message = checkField();
	  if(err_message != '') {
	     alert(err_message);
	     return;
	  } else {
	     document.formProduct.action = "<%= rootDirectory %>/controller?action=HandleMACAction&dispatch=query";
	     document.formProduct.submit();
	  }
}

function toDelete() {
	  var macStr = "";
	  
	  if(document.getElementById("check_product_1")){
		  var products = document.getElementsByName("check_product");
		  for (var i = 0; i < products.length; i++)
		  {
		      if (products[i].checked)
		      {
		    	  macStr += ","+products[i].value;
		      }
		  }		  
		  
	  }
	  
	  if(macStr == ""){
		  message += "At least one product should be selected.\n";
		  alert(message);
		  return;
	  }else{
		  document.formProduct.product_macs.value = macStr.substring(1);
		  if (confirm("Are you sure to delete the selected products?")){	
			  document.formProduct.action = "<%= rootDirectory %>/controller?action=HandleMACAction&dispatch=delete";
			  document.formProduct.submit();				  
		  }
	  }
	
}


function toDeleteAll() {
	  var macStr = "";
	  
	  if(document.getElementById("check_product_1")){
		  var products = document.getElementsByName("check_product");
		  for (var i = 0; i < products.length; i++)
		  {
			  macStr += ","+products[i].value;
		  }			  
	  }
	  
	  if(macStr == ""){
		  message += "At least one product should be selected.\n";
		  alert(message);
		  return;
	  }else{
		  document.formProduct.product_macs.value = macStr.substring(1);
		  if (confirm("Are you sure to delete all the products listed?")){	
			  document.formProduct.action = "<%= rootDirectory %>/controller?action=HandleMACAction&dispatch=delete";
			  document.formProduct.submit();				  
		  }
	  }	
}

function checkField() {
  
  var targetDate = document.formProduct.targetDate.value;
  
  var message = '';
  
  if(targetDate == "") {
     message = "Date is required.\n";
  }
  
  return message;
}


//-->
</script>



