
<%@ page import="java.util.*" %>
<%@ page import="com.titan.updserver.account.dao.*" %>
<%@ page import="com.titan.util.Util" %>
<%@ page import="java.math.*"%>

<%
	String rootDirectory = (String)request.getContextPath();
    String group_id = Util.getString(request.getParameter("group_id"));
    Collection col = null;
    Collection<String> grantedFunctions = new ArrayList<String>();
    int col_size=0;
    if(!group_id.equals("")){
	     col = AccountDao.getAllFunction();
	     col_size = col.size();
	     grantedFunctions = AccountDao.getFunctionListByGroup_ID(group_id);
    }
    String menu="";
%>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<body leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">
<form name="form1" method="post" action="">

<input type='hidden' name='hidFunction' value=''>
<input type='hidden' name='hidAction' value=''>

<input type='hidden' name='group_id' value='<%=group_id%>'>
<input type='hidden' name='check' value=''>

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27"></td>
        <td colspan="2" valign="top"><br>
            <span class="title1">Privilege</span><br>
            <hr align="left" color="#333333" width="100%" size="1"><br><br>
        </td>
        <td width="1" rowspan="12"></td>
    </tr>
    <tr>
        <td width="20" height="42"></td>
        <td width="20"></td>

    <td width="748" align="center" valign="top"> 
        <span class="title1">Privilege Information</span>
      
        <table width="100%" class="table_0" border="0" cellpadding="0" cellspacing="1" bgcolor="#E6E6E6">
  
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">&nbsp;<span class="content3">Group :</span></td>
            <td class="content1">&nbsp;<%=GroupDao.getGroupName(group_id)%></td>
            
          <tr align="left" valign="top" bgcolor="#FFFFFF"> 
            <td bgcolor="#CCCCCC"><p class="star">&nbsp;<span class="content3">Privilege&nbsp; :</span></td>
            <td class="content3">
              
              
	        <table width="100%" border="1" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF" class="table_0">

<%
 int i=0;
 HashMap hm=new HashMap();
 for(Iterator it=col.iterator();it.hasNext();){
 i++;
 hm=(HashMap)it.next();
 String MENU_NAME = Util.getString(hm.get("MENU_NAME"));
 String FUNCTION_NAME = Util.getString(hm.get("FUNCTION_NAME"));
 String FUNCTION_ID = Util.getString(hm.get("FUNCTION_ID"));

%>

<%
	 if(!menu.equalsIgnoreCase(MENU_NAME)){
%>
                <tr valign="top" class="content2">
                  <td bgcolor="#E6E6E6"> 
                  <%=MENU_NAME%>                 
                  </td>
                  <td bgcolor="#E6E6E6">
                  </td>
                </tr>
<%
	 }
	 menu=MENU_NAME;
%>
                <tr valign="top" class="content3">
                  <td bgcolor="#E6E6E6">                  
                  </td>
                  <td bgcolor="#E6E6E6">
                  <%=FUNCTION_NAME%><input type=checkbox name="check_function" value="<%=i%>" <%=grantedFunctions.contains(FUNCTION_ID)? "checked" : ""%>>
                  </td>
                </tr>
<%
}
%>

              </table>                         
            </td>         

          </table>   
    <p></p>
    </td>
    </tr>
    <tr>
        <td width="20" height="21"></td>
        <td></td>
        <td valign="top">
        <p>
        <span class="content3">
        <input class="button" type="button" value="Submit" name="Submit" onClick="javascript:doSubmit();">
        <input class="button" type="button" value="Cancel" name="Cancel" onClick="javascript:doCancel();">
        </span>
        </p></td>
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
</html>


<script language="JavaScript" type="text/JavaScript">

function doCancel(){
  location.href = '<%=rootDirectory%>/jsp/account/privilege.jsp';
}

function doSubmit() {

     var i=0;
     var check="";
     
     var check_function=eval("document.form1.check_function");
     
     if(check_function != null){     
	     for(i=0;i<<%=col_size%>;i++){
	     	if(check_function[i].checked) check=check+"1";
	     	else check=check+"0";
	     }
     }
     
     document.form1.check.value = check;
     document.form1.group_id.value = <%=group_id%>;
     document.form1.hidFunction.value = "PRIVILEGE_UPDATE";
     document.form1.hidAction.value = "PRIVILEGE_UPDATE";
     
     document.form1.action = "<%= rootDirectory %>/controller";
     document.form1.submit();
}

</script>

