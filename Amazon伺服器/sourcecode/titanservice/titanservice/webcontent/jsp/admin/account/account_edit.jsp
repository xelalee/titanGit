<%@page import="com.titan.admin.account.bean.GroupBean"%>
<%@page import="com.titan.admin.account.dao.GroupDAO"%>
<%@page import="com.titan.admin.account.bean.AdministratorBean"%>
<%@page import="com.titan.admin.account.dao.AdministratorDAO"%>
<%@ page contentType="text/html; charset=UTF-8" %>

<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();
    String username = Util.getString(request.getParameter("username"));
    AdministratorBean bean = AdministratorDAO.getInstance().get(username);
%>

<html>
<head>

<title>Account Management</title>
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

<form name="formAccount" method="post" action="">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content3">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Account Management</span><br>
        </td>
    </tr> 
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">&nbsp;&nbsp;&nbsp;Edit Admin Account <br>
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
            <td bgcolor="#CCCCCC" width="35%"><span class="star">* </span><span class="content3">Username</span></td>
            <td valign="top" width="65%"> 
                <input class="content3" id="username" name="username" size="30" maxlength="20" value="<%=bean.getUsername() %>"  readonly="true">      
            </td>
          </tr>
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span> <span class="content3">Password</span></td>
            <td><input class="content3" name="password" type="password" value="<%=bean.getPassword() %>" size="30" maxlength="20"></td>
          </tr>         
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Confirm Password</span></td>
            <td><input class="content3" name="password1" type="password" value="<%=bean.getPassword() %>" size="30" maxlength="20"></td>
          </tr>
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Email</span></td>
            <td colspan="2" valign="top"> 
                <input class="content3" id="email" name="email" size="30" maxlength="50" value="<%=bean.getEmail()%>" required="true">
            </td>
          </tr>         
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td bgcolor="#CCCCCC"><span class="star">* </span><span class="content3">Group</span></td>
            <td colspan="2" valign="top" class="content3">
                <select name="group" class="content3">
              	  <%
      	            List<GroupBean> groups = GroupDAO.getInstance().getAll();
      	            for(GroupBean group: groups){
              	  %>
              	  <option value="<%=group.getGroup_id() %>" <%=bean.getGroup_id().equals(group.getGroup_id())?"selected":"" %>><%=group.getGroup_name() %></option>
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
      <td >
          
        <p>&nbsp;</p>
        <p align="left">
           <input class="button" type="button" value="Submit" name="Submit" onClick="toSubmit();">
           <input class="button" type="button" value="Delete" name="Delete" onClick="toDelete();">
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
	     document.formAccount.action = '<%= rootDirectory %>/controller?action=AdministratorAction&dispatch=edit';
	     document.formAccount.submit();
	  }
}

function checkField() {
  
  var password = document.formAccount.password.value;
  var password1 = document.formAccount.password1.value;
  var email = document.formAccount.email.value;
  
  var message = '';
  
  if(password == '') {
     message += "Password is required.\n";
  } else if(password.length <6) {
     message += "Password length is at least 6.\n";
  }
  
  if(password1 == '') {
     message += "Confirm Password is required.\n";
  } else if(password != password1) {
     message += "Confirm Password error.\n";
  }
  
  if(email == '') {
     message += "Email is required.\n";
  }
  
  return message;
}

function toDelete() {  
    document.formAccount.action = '<%= rootDirectory %>/controller?action=AdministratorAction&dispatch=delete';
    document.formAccount.submit();
}

function toCancel() { 
	  location.href = '<%=rootDirectory%>/jsp/admin/account/account_list.jsf';
}

function filterEmailUserInput(event){
	this.value = this.value.replace(/[^0-9a-zA-Z_@\-\.\n]/g,"");
}

var inputEmail = document.getElementById("email");

inputEmail.onkeyup = filterEmailUserInput;

//-->
</script>



