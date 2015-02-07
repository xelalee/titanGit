<%@ page contentType="text/html; charset=UTF-8" %>

<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%@page import="com.titan.admin.account.bean.FunctionBean"%>
<%@page import="com.titan.admin.account.dao.FunctionDAO"%>

<%
	String rootDirectory = (String)request.getContextPath();
%>

<html>
<head>

<title>Group Management</title>
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

<form name="formGroup" method="post" action="">

<input type='hidden' name='function_ids' >

  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content3">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Group Management</span><br>
        </td>
    </tr> 
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Add Group <br>
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
      	<table width="60%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC" width="25%"><span class="star">* </span><span class="content3">Group Name</span></td>
            <td valign="top" width="75%"> 
                <input class="content3" id="group_name" name="group_name" size="30" maxlength="20" value=""  >      
            </td>
          </tr>        
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Function</span></td>
            <td colspan="2" valign="top" class="content3">
            <table width="100%" border="1" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
           	  <%
           	    String previous = "";
   	            List<FunctionBean> functions = FunctionDAO.getInstance().getAll();
   	            for(FunctionBean function: functions){
   	            	boolean printMenu = false;
   	            	String function_id = function.getFunction_id();
   	            	if(!function.getMenu_name().equals(previous)){
   	            		previous = function.getMenu_name();
   	              	  %>
   	            	  <tr>
   	            	  <td width="40%"><%=function.getMenu_name()%></td>
   	            	  <td width="60%"></td>
   	            	  </tr>
   	            	  <%   	            		
   	            	}
   	            	
		           	  %>
		           	  <tr>
		           	  <td width="40%"></td>
		           	  <td width="60%"><%=function.getFunction_name() %> &nbsp;<input type=checkbox name="check_function" value="<%=function_id%>"></td>
		           	  </tr>
		           	  <%
           	  }
           	  %>            
            </table>
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
	     document.formGroup.action = '<%= rootDirectory %>/controller?action=GroupAction&dispatch=add';
	     document.formGroup.submit();
	  }
}

function checkField() {

  var message = "";
  
  var group_name = document.formGroup.group_name.value;
  
  if(group_name == "") {
     message += "Group name is required.\n";
  }
  
  var functionStr = "";
  var functions = document.getElementsByName("check_function");
  
  for (var i = 0; i < functions.length; i++)
  {
      if (functions[i].checked)
      {
    	  functionStr += ","+functions[i].value;
      }
  }
  
  if(functionStr == ""){
	  message += "At least one function should be selected.\n";
  }else{
	  document.formGroup.function_ids.value = functionStr.substring(1);
  }
  
  return message;
}

function toCancel() { 
	  location.href = '<%=rootDirectory%>/jsp/admin/account/group_list.jsf';
}


//-->
</script>



