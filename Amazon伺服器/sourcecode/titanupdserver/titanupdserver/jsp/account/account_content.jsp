

<%@ page import="java.util.*" %>
<%@ page import="com.titan.updserver.account.dao.*"%>

<%@ page import="com.titan.updserver.account.bean.AccountBean"%>


<%
	String rootDirectory = (String)request.getContextPath();
    
    GroupDao myGroup = new GroupDao();
    
    Collection<HashMap> users = (Collection<HashMap>)request.getAttribute("USERS");

%>

<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<script language="JavaScript" type="text/JavaScript">
<!--

function doLink(userName, account_id) {
  form1.action = ""; 
  form1.submit();
}

function doGroup() {
  form1.action = "";
  form1.submit();
}

function doSearch() {
  var sql = "hello jim";
  form1.action = '<%= rootDirectory %>/controller';
  form1.submit();
}

function toNew(){
	location.href="<%=rootDirectory%>/jsp/account/account_new.jsp";
}

//-->
</script>

<body leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_add.jpg','<%=rootDirectory %>/images/button/i_search.jpg')">
<form name="form1" method="post" action="">

<input type='hidden' name='hidFunction' value="ACCOUNT_SEARCH">
<input type='hidden' name='hidAction' value="ACCOUNT_SEARCH">
<input type="hidden" name="query_flag" value="">

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

    <td width="748" valign="top">       
        <table width="100%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">User Account</span></td>
            <td><input name="USERNAME" type="text" size="20" class="content3" value=""></td>
            <td></td>
          </tr>

          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
            <td><span class="content3">Group</span></td>
            <td><p class="content3">
            	<select name="Group_Info" class="content3">
                  <!--option value="">---Select---</option-->

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
              </p></td>
            <td>
            <input class="button" type="button" value="Search" name="Search" onClick="javascript:doSearch();">
            </td>
          </tr>
        </table>
    <p></p></td>
    </tr>
    <tr>
        <td width="20" height="21"></td>
        <td></td>
        <td valign="top">
        <input class="button" type="button" value="Add" name="Add" onClick="javascript:toNew();">
        </td>
    </tr>
    <tr>
        <td width="20" height="10">&nbsp;</td>
        <td></td>
        <td valign="top"></td>
    </tr>
    <tr>
        <td width="20" height="10">&nbsp;</td>
        <td></td>
        <td valign="top">

<%
if(users!=null && users.size()>0){
%>
<table width=100% class=table_0 border=0 cellpadding=0 cellspacing=1 bgcolor=#E6E6E6>
   <tr valign=top class=table_1>
      <th><b>User Name</b></th>
      <th><b>Email<b></th>
      <th><b>Group</b></th>
   </tr>
<%
  for(HashMap hm: users){
	  AccountBean account = new AccountBean(hm);

%>

	 <tr align=center valign=top class=table_2>
      <td><a href="jsp/account/account_query.jsp?username=<%=account.getUsername()%>"></a><%=account.getUsername() %></td>
      <td><%=account.getEmail() %></td>
      <td><%=account.getGroup_name() %></td>
     </tr>

<%	  
	  
  }
%>

</table>
<%	
}
%>

        </td>
    </tr>
</table>
</form>
<p></p>
</body>
</html>
