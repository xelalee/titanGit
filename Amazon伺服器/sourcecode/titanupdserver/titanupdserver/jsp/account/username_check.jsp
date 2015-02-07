<%@ page import="com.wxmetro.jdbc.*"%>
<%@ page import="com.titan.updserver.account.dao.AccountDao"%>

<%
    String rootDirectory = (String)request.getContextPath();
    AccountDao myDup = new AccountDao();
    boolean CheckUser = false;
    String username   = (request.getParameter("USERNAME") == null) ? "" : request.getParameter("USERNAME");
    //return true or false

    CheckUser = myDup.getDuplicateUser(username);

%>
<html>
<head>
<title>Login User Check</title>
<script language="JavaScript" src="../js/util.js"></script>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<script language="JavaScript" type="text/JavaScript">
<!--

  var username = '<%=username%>';
  var message = '';
    
  for(i=0; i<username.length; i++) {
      if(username.charAt(i) == ' ') {
         message = "Space";
      } else if(username.charCodeAt(i)  > 127) {
         message = "Chinese";
      }
  }
  //error message
  //if(message != '') {
     //alert(message);
  //}

//-->
</script>
</head>

<body leftmargin="0" topmargin="0">
<form name="form1" method="post" action="">

<input type='hidden' name='hidFunction' value="Personal Information"> 
<input type='hidden' name='hidAction' value="PEESONAL UPDATE">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr> 
      <td width="33" height="27" rowspan="2"></td>
      <td colspan="2" valign="top"> <br> <span class="title1">Username Check</span><br> 
        <hr align="left" color="#333333" width="100%" size="1"> 
        <br></td>
    </tr>
<%
%>
    <tr> 
      <td height="42" width="19"></td>

<script language="JavaScript" type="text/JavaScript">
<!--   
      if(message == 'Chinese') {
        document.write("<td width=\"750\" ><span class=\"content2\">The Username is not available !!!.<br>");
        document.write("Please choose another User Name.</span><br>");
     } else if(message == 'Space') {
        document.write("<td width=\"750\" ><span class=\"content2\">The Username is not available !!!.<br>");
        document.write("Please choose another User Name that no space.</span><br>");
     } else {
        document.write("<td width=\"750\" ><span class=\"content2\">The username \"<%= username.equals("") ? "N/A" : username %>\" is <%= CheckUser ? "not" : "" %> available.<br>");
<%
        if(CheckUser) {
%>
           document.write("Please choose another User Name.</span><br>");
<%  
        }
%>
     } //IF end

//-->
</script>

 <font color="#CC6600" size="1" face="Verdana, Arial, Helvetica, sans-serif"><strong> 
        </strong></font> <p> <font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif"> 
          </font></p></td>
    </tr>
  </table>
<p class="control"></p>
</form>
</body>
</html>
