
<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="com.titan.base.paginate.PaginateController"%>
<%@page import="com.titan.admin.account.bean.GroupBean"%>
<%@page import="com.titan.admin.account.dao.GroupDAO"%>

<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();
	PaginateController controller = new PaginateController(request, response, GroupDAO.getInstance().getAllSQL());
	controller.setPagesize(10);
	controller.handle();
%>

<html>
<head>
<link href="../../../css/screen.css" rel="stylesheet" type="text/css">
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

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Group Management</span><br>
        </td>
    </tr>
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">
        &nbsp;&nbsp;&nbsp;Group List<br>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td align="left" valign="top"> 
        <span class="content3">  
                    <table width="80%">
                    <tr>
                    <td align="left">			
				<display:table name="<%=PaginateController.paginatedDataListName %>" class="its" export="false" id="row" pagesize="10" requestURI ="/jsp/admin/account/account_list.jsf" >
<%
                   HashMap hm = (HashMap)pageContext.getAttribute("row");
                   GroupBean group = new GroupBean(hm);
%>
                   <display:column title = "Group Name"><a href="<%=rootDirectory%>/jsp/admin/account/group_edit.jsf?group_id=<%=group.getGroup_id()%>" ><%=group.getGroup_name()%></a></display:column>

		           <display:setProperty name="basic.msg.empty_list" value="No account found to display"/>
		           <display:setProperty name="paging.banner.item_name" value="group"/>
		           <display:setProperty name="paging.banner.items_name" value="groups"/>
	               <display:setProperty name="paging.banner.placement" value="bottom"/>
	               <display:setProperty name="paging.banner.onepage" value=""/>
	            </display:table>
					</td>
					</tr>
					<tr>
					<td>
					<input class="button" type="button" value="Add" name="Add" onClick="toAdd();">
					</td>
					</tr>
					</table>
		</span>
       </td>
    </tr>
</table>
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../../images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="../../../images/1px.gif" width="1" height="1"></td>
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

function toAdd() {
	location.href="<%=rootDirectory%>/jsp/admin/account/group_add.jsf";
}

//-->
</script>

