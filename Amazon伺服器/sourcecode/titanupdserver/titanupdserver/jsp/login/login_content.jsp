
<%@ page import="com.titan.util.CookieUtils" %>
<%@ page import="java.util.*" %>
<%@ page import="com.titan.util.Util" %>

<%
    String rootDirectory = (String)request.getContextPath();
    String username = CookieUtils.getCookieValue("USERNAME",request);
    if (username== null) username="";
%>

<script language="JavaScript">

function toSubmit(){

    var username = document.form1.USERNAME.value;
    var password = document.form1.PASSWORD.value;
    if(username == "" || password == ""){
        alert("You must input username and password!");
    }else{
	document.form1.action = '<%= rootDirectory %>/login';
	document.form1.target= "";
	document.form1.submit();
    }
}

function toCancel(){
 document.form1.USERNAME.value = "";
 document.form1.PASSWORD.value = "";
 return;
}

function pressEnter() {
  if(window.event.keyCode == 13) {
     toSubmit();
  }
}

function MM_openBrWindow(theURL,winName,features) { //v2.0
  window.open(theURL,winName,features);
}

function browser_checking() {

    if(navigator.appName != "Microsoft Internet Explorer") {
        //alert("You know what? You're using Microsoft Internet Explorer!");
        alert("Sorry! Your browser is not Microsoft Internet Explorer.\nThe functions in this web site will not operate correctly.");
    }
}

function checkExistingUser() {
  location.href = '<%=rootDirectory%>/jsp/login/check_user.jsp';
}

</script>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<body onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg');" onkeydown="pressEnter();">
<form name="form1" method="post" action="">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" class="content1">
    <tr>
      <td width="21" height="27">
      <input type='hidden' name='hidFunction' value="LOGIN">
      <input type='hidden' name='hidAction' value="LOGIN">
      <input type="hidden" name="SUBMIT_KEY"  value="<%=new Date().getTime()%>" >
      <input type="hidden" name="query_flag" value="">
      </td>
      <td width="611" valign="top" class="content1"><p><br>

      </td>
    </tr>
    
    <tr>
      <td width="21" height="151"></td>
      <td valign="top"> 
        <span class="content1">Titan Update Server</span>
        <br>
        <br>      
        <span class="content1">Log In</span>
        <br>
        <br>

        <hr align="left" color="#333333" width="30%" size="1">
        
        <table>
         <tr>
          <td>
        <span class="content3">Username:</span>      
          </td>
          <td>
        <span class="controlm">
        <input name="USERNAME" type="text" class="content3" id="USERNAME" size="20" maxlength="50" value="<%=username %>">
        </span>   
          </td>
         </tr>
         <tr>
          <td>
        <span class="content3">Password:</span>           
          </td>
          <td>
        <span class="controlm">
        <input name="PASSWORD" type="password" class="content3" id="PASSWORD" size="20" maxlength="20">
        </span>          
          </td>
         </tr>        
        </table>

        <br>
        <span class="content3">Remember Username: </span><span class="controlm">
        </span><font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif"><span class="content3">
        <input type="checkbox" name="REMEMBER" value="checkbox" <%= CookieUtils.isCookieSet("USERNAME",request)?"checked":"" %>>
        
        <hr align="left" color="#333333" width="30%" size="1" noshade>
        
        <br>
        <br>
        <input class="button" type="button" value="Submit" name="Submit" onClick="javascript:toSubmit();"><input class="button" type="button" value="Cancel" name="Cancel" onClick="javascript:toCancel();">
        <br>
        </span></font>
        <p><br>
          <br>
          <br></span></font></font>
          <br>
        </p>
        </td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
  </table>
</form>
<script>
//form1.query_flag.value='Y';
</script>
</body>



