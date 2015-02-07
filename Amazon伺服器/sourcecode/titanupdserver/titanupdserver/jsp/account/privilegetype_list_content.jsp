<%@ page import="java.util.*" %>
<%@ page import="com.titan.updserver.account.dao.GroupDao" %>

<%
	String rootDirectory = (String)request.getContextPath();
    
    Collection coldata = null;
    GroupDao privilegeJB = new GroupDao();
    coldata = privilegeJB.getGroup();
%>

<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">
<body leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/add/i_add.jpg')">
<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27"></td>
        <td colspan="2" valign="top"><br>
            <span class="title1">Privilege Type</span><br>
            <hr align="left" color="#333333" width="100%" size="1"><br><br>
        </td>
        <td width="1" rowspan="12"></td>
    </tr>

    <tr>
        <td width="20" height="42"></td>
        <td width="20"></td>

    <td width="748" valign="top"> 
        <form name="form1" method="post" action="">
        
        <table width="100%" border="0" cellpadding="0" cellspacing="0" class="table_0">
            <tr valign="top" class="table_1">
              <td>Privilege Type</td>
              <!--td>Status</td-->
            </tr>
<%
	int i = 0;
	for(Iterator it = coldata.iterator(); it.hasNext();) {
	    HashMap hmdata = (HashMap)it.next();
	    String rowStyle;
	    
	    if(i % 2 == 0)
               rowStyle = "table_2";
            else
               rowStyle = "table_3";
%>            
            <tr align="center" valign="top" class=<%=rowStyle%>>
              <td><a href="<%=rootDirectory%>/jsp/account/privilegetype_query.jsp?group_id=<%=hmdata.get("GROUP_ID")%>">
              <%=hmdata.get("GROUP_NAME")%></a></td>
              <!--td>Active</td-->
<%
	    i++;
	}
%>
        </table>
      </form>
    <p></p></td>
    </tr>
    <tr>
        <td width="20" height="21"></td>
        <td></td>
        <td valign="top"><p>
        <!-- a href="/jsp/admin/account/privilegetype_new.jsp" onMouseOver="MM_swapImage('Image16','','/images/button/i_add.jpg',1)" onMouseOut="MM_swapImgRestore()"><img src="/images/button/i_add_on.jpg" name="Image16" width="61" height="19" border="0"></a -->
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
<p></p>
</body>
