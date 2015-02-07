<%@page import="com.titan.base.product.bean.ModelBean" %>
<%@page import="com.titan.base.product.dao.ModelDAO" %>

<%@page import="com.titan.base.product.bean.ProductBean" %>

<%@ page contentType="text/html; charset=UTF-8" %>

<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();
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

<form name="form1" method="post" action="" ENCTYPE='multipart/form-data'>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content3">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Product Management</span><br>
        </td>
    </tr> 
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Import MAC <br>
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
            <td bgcolor="#CCCCCC" width="35%"><span class="star">* </span><span class="content3">Source File</span></td>
            <td valign="top" width="65%"> 
                <input name="sourceFile" type="file" size="50">
                <BR>
                <span class="content3">The Source File should be an CSV file(*.csv), fields separated with ",". <br>
                The file should contains two columns(column 1 is serial number; column 2 is MAC address). </span>    
            </td>
          </tr>         
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Model</span></td>
            <td colspan="2" valign="top" class="content3">
                <select name="model_id" class="content3">
              	  <%
      	            List<ModelBean> models = ModelDAO.getInstance().getAll();
      	            for(ModelBean model: models){
              	  %>
              	  <option value="<%=model.getModel_id() %>"><%=model.getModel_name() %></option>
              	  <%
              	  }
              	  %>
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

<div>
<%
   List<ProductBean> previous_imported_products = (List<ProductBean>)session.getAttribute("previous_imported_products");
   if(previous_imported_products!=null && previous_imported_products.size()>0){
	   ModelBean model = ModelDAO.getInstance().getModelByID(previous_imported_products.get(0).getModel_id());
%>
  <table width="60%" border="1" cellpadding="2" cellspacing="2" bordercolor="#FFFFFF">
    <tr>
      <td colspan="3"><span class="content3">Previous Imported MACs</span></td>
    </tr>
    <tr>
      <td width="30%">SN</td>
      <td width="40%">MAC</td>
      <td width="30%">Model</td>
    </tr>     
    <%
      for(ProductBean product: previous_imported_products){
    %>
    <tr>
      <td><%=product.getSn() %></td>
      <td><%=product.getMac() %></td>
      <td><%=model.getModel_name() %></td>
    </tr>    
    <%
      }
    %>
  
  </table>
<%	   
	   
   }
%>

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

function toSubmit() {  
	  
	  var err_message = checkField();
	  if(err_message != '') {
	     alert(err_message);
	     return;
	  } else {
		 var model_id = document.form1.model_id.value;
	     document.form1.action = '<%= rootDirectory %>/controller?action=ImportMACAction&dispatch=&model_id='+model_id;
	     document.form1.submit();
	  }
}

function checkField() {
  
  var sourceFile = document.form1.sourceFile.value;
  
  var message = '';
  
  if(sourceFile == "") {
     message = "Source File is required.\n";
  }
  
  return message;
}

function toCancel() { 
	  location.href = '<%=rootDirectory%>/jsp/admin/product/importMAC.jsf';
}

//-->
</script>



