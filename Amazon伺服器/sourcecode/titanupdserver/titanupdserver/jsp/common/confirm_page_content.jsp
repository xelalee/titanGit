<%@ page import="com.titan.common.bean.MessageBean"%>

<%
    String rootDirectory = (String)request.getContextPath();
  
    MessageBean message = (MessageBean)request.getAttribute("confirm_page_message");
    if(message==null){
    	message = new MessageBean();
    }

%>

<body leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_back.jpg')">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td width="20" height="27">&nbsp;</td>
        <td colspan="2" valign="top"><br>
            <span class="content2"><%=message.getMenu() %> </span><span class="title0"> / <%=message.getFunction() %></span><br><br>
            <span class="title1"><%=message.getFunction() %> <%=message.isSucc()?"Success":"Fail" %></span><br>
            <hr align="left" color="#333333" width="100%" size="1"><br><br>
        </td>
    </tr>
  
    <tr>
        <td width="20" height="18" valign="top">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top" class="content2"><%=message.getMessage()%><br><br></td>
    </tr>

    <tr>
        <td width="28">&nbsp;</td>
        <td>&nbsp;</td>
        <td><p>&nbsp;</p></td>
    </tr>
    <tr>
        <td width="28" valign="top">&nbsp;</td>
        <td>&nbsp;</td>
        <td><blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <p><a href="<%=rootDirectory%><%=message.getBackURL() %>" onMouseOver="MM_swapImage('Image4','','<%=rootDirectory%>/images/button/i_back.jpg',1)" onMouseOut="MM_swapImgRestore()"><img src="<%=rootDirectory%>/images/button/i_back_on.jpg" name="Image4" border="0"></a></p>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote></td>
     </tr>
</table>
<p>&nbsp;</p>
</body>
</html>
