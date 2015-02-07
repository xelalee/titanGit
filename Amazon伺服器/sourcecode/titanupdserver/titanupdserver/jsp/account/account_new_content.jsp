
<%@ page import="java.util.*" %>
<%@ page import="com.titan.updserver.account.dao.*"%>

<%
	String rootDirectory = (String)request.getContextPath();
    GroupDao myGroup = new GroupDao();
%>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<script language="JavaScript" type="text/JavaScript">
<!--

function checkWindow() {
  
  var username = form1.USERNAME.value;
  url = "<%=rootDirectory%>/jsp/account/username_check.jsp?USERNAME="+username;
  
  var message = '';
  
  if(username == "") {
     message = "Username can't be empty !!\n";     
  } else if(username.length <3) {
    message = "Username size can't be less than 3 characters !!!\n";
  } else {
    //username can't have space and chinese
    message = checkChinese('Username', username);   
  }
  
  if(message != '') {
     alert(message);
  } else {
     uPopWnd(url, 'checkUserNameWin', 300, 200, 1, 0, 1, 1);
  }
}

function doSave() {  
  
  var err_message = checkField();
  if(err_message != '') {
     alert(err_message);
     return;
  } else {
     form1.action = '<%= rootDirectory %>/controller';
     form1.submit();
  }
}

function checkField() {
  
  var username = form1.USERNAME.value.toLowerCase();
  var password = form1.PASSWORD.value;
  var email = form1.EMAIL.value;
  
  var message = '';
  
  if(username == "") {
     message = "Username can't be empty !!\n";
  } else if(username.length <3) {
     message = "Username size can't < 3 characters !!!\n";
  } else {
    message = checkChinese('Username', username);
  }
  
  if(password == '') {
     message += "Password can't be empty !!\n";
  } else if(password.length <6) {
     message += "Password size can't < 6 characters !!!\n";
  } else {
     message += checkChinese('Password', password);
  }
  
  if(form1.COMFIRM_PASSWORD.value == '') {
     message += "Comfirm Password can't be empty !!\n";
  } else if(password != form1.COMFIRM_PASSWORD.value) {
     message += "Comfirm Password error !!!\n";
  } else {
     message += checkChinese('Comfirm Password', form1.COMFIRM_PASSWORD.value);
  }
 
  if(form1.EMAIL.value == '') {
     message += "Email Address can't be empty !!\n";
  } else if(!isValidEmail(email)) {
     message += "Please input Valid Email Address !!!\n";
  }   
  
  if(form1.Group_Info.value == ''){
     message += "Please choose the group info !!\n"
  }  
  return message;
}

function checkChinese(field, fieldvalue) {
  
  var err_message = '';

  if(field=='Username' || field=='Password' || field=='Comfirm Password') {
      if(!isValidChar(fieldvalue)) {
         err_message = field + " not available !!!\n";
      }
  } else {
  	      if(!isValidCharBySpace(fieldvalue)) {
         err_message = field + " not available !!!\n";
      }
  }
  
  return err_message;
}


function doCancel() { 
  location.href = '<%=rootDirectory%>/jsp/account/account.jsp';
}

//-->
</script>

<body leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">
<form name="form1" method="post" action="">

<input type='hidden' name='hidFunction' value="ACCOUNT_INSERT">
<input type='hidden' name='hidAction' value="ACCOUNT_INSERT">

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27"></td>
        <td colspan="2" valign="top"><br>
            <span class="title1">Account</span><br>
            <hr align="left" color="#333333" width="100%" size="1"><br><br>
        </td>
        <td width="1" rowspan="12"></td>
    </tr>
    <tr>
        <td width="20" height="42"></td>
        <td width="20"></td>

    <td width="748" align="center" valign="top">       
        <span class="title1">Account Information</span>
        <table width="100%" class="table_0" border="0" cellpadding="0" cellspacing="1" bgcolor="#E6E6E6">         
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">* <span class="content3">Username :</span></td>
            <td><input class="content3" name="USERNAME" type="text" value="" maxlength="20">
            <span class="content1"><a href="javascript:checkWindow();">Check this Username is available !!</a></span></td>
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">* <span class="content3">Password :</span></td>
            <td><input class="content3" name="PASSWORD" type="password" value="" maxlength="20"> Please create a password with a minimum of 6 characters and a maximum of 20 characters. </td>         
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">* <span class="content3">Comfirm Password :</span></td>
            <td><input class="content3" name="COMFIRM_PASSWORD" type="password" value="" maxlength="20"></td>
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">* <span class="content3">E-mail Address :</span></td>
            <td><input class="content3" name="EMAIL" type="text" size="30" value="" maxlength="50"></td>
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">* <span class="content3">Privilege Group :</span></td>
            <td class="content3">
        
        <select name="Group_Info" class="content3">
		<option value="">---Select---</option>
        
        <%
           HashMap map = new HashMap();
           for(Iterator I=myGroup.getGroup().iterator();I.hasNext();)
           {
              map = (HashMap)I.next();
           %>
           <option value="<%=map.get("GROUP_ID")%>"><%=map.get("GROUP_NAME")%></option>
           <%}%>
        
        </select>
         </td>          

          </table>   
    <p></p>
    </td>
    </tr>
    <tr>
        <td width="20" height="21"></td>
        <td></td>
        <td valign="top"><p><span class="content3"><input class="button" type="button" value="Save" name="Save" onClick="javascript:doSave();"><input class="button" type="button" value="Cancel" name="Cancel" onClick="javascript:doCancel();"></span></p></td>
    </tr>
    <tr>
        <td width="20" height="10">&nbsp;</td>
        <td></td>
        <td valign="top"></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="1"></td>
    </tr>
</table>
</form>
<p></p>
</body>
