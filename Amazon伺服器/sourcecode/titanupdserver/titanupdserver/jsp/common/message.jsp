<%@ page import="java.util.*" %>
<%@ page import="javax.servlet.ServletContext" %>
<%@ page import="com.titan.updserver.message.object.MsgException" %>
<%@ page import="com.titan.util.HtmlUtility" %>
<%@ page import="com.titan.util.Util" %>
<%@ page import="com.titan.util.Keys" %>
<%@ page isErrorPage="true" %>
<%!
   boolean isValidate(Map mp){
      return mp != null;
   }
%>
<%
    String rootDirectory = (String)request.getContextPath();

    response.setDateHeader ("Expires", 0);
    request.setAttribute("MESSAGE_FLAG","Y") ;
    String code = (request.getParameter("errorcode") == null) ? "" : request.getParameter("errorcode");
    // This parameter is get from server's error code like : 404, 500
    String theURL = "javascript:history.go(-1);";
    String theText = "Go Back";
    String errorType = "Error";
    String errorCode = "N/A";
    String messageCode = "";
    String explan = "";
    String action = "back";
    String value1 = "";
    String value2 = "System Message";
    String parameter = "";
    String msgs[] = null;
    //HtmlUtility hu = new HtmlUtility();

	if(exception == null && request.getAttribute("return") == null) { // For 404 Error
		if("404".equals(code)) {
			theURL = "/jsp/index.jsp";
			theText= "GO Back";
			errorCode = "N/A";
			errorType = "Error";
			explan = "Page is not exist !";
			action = "back";
                        //value1 = "";
                        //value2 = "System Message";
			parameter = "";

		}
		else if("500".equals(code)) { // For 500 Error
			theURL = "javascript:history.go(-1);";
			theText= "GO Back";
			errorCode = "N/A";
			errorType = "Error";
			explan = "Internal Server Error !";
			action = "reg_back";
                        //value1 = "";
                        //value2 = "System Message";
			parameter = "";
      exception.printStackTrace();//stanley king added in order to show the error message onto the console
		}
	}
	else {
    	if (exception instanceof MsgException ) {
			theURL = (((MsgException)exception).theURL == null ) ? "javascript:history.go(-1);" :  ((MsgException)exception).theURL;
			theText= (((MsgException)exception).theText == null ) ? "GO Back" : ((MsgException)exception).theText;
			errorCode =(((MsgException)exception).errorCode == null ) ? "N/A" : ((MsgException)exception).errorCode;
			errorType =(((MsgException)exception).errorType == null ) ? "error" : ((MsgException)exception).errorType;
			explan =(((MsgException)exception).explan == null ) ? "" : HtmlUtility.htmlTag(((MsgException)exception).explan);
			action =(((MsgException)exception).action == null ) ? "" : HtmlUtility.htmlTag(((MsgException)exception).action);
                        value1 = (((MsgException)exception).value1 == null ) ? "" : HtmlUtility.htmlTag(((MsgException)exception).value1);
                        value2 = (((MsgException)exception).value2 == null ) ? "" : HtmlUtility.htmlTag(((MsgException)exception).value2);
			parameter =(((MsgException)exception).parameter == null ) ? "" : HtmlUtility.htmlTag(((MsgException)exception).parameter);
                        messageCode =(((MsgException)exception).messageCode == null ) ? "" : HtmlUtility.htmlTag(((MsgException)exception).messageCode);
			//parameter =(((MsgException)exception).parameter == null ) ? "" : ((MsgException)exception).parameter;
    	}else if(request.getAttribute("return") != null){
    	    MsgException msgEx = (MsgException)request.getAttribute("return");
			theURL = (msgEx.theURL == null ) ? "javascript:history.go(-1);" :  msgEx.theURL;
			theText= (msgEx.theText == null ) ? "GO Back" : msgEx.theText;
			errorCode =(msgEx.errorCode == null ) ? "N/A" : msgEx.errorCode;
			errorType =(msgEx.errorType == null ) ? "error" : msgEx.errorType;
			explan =(msgEx.explan == null ) ? "" : HtmlUtility.htmlTag(msgEx.explan);
			action =(msgEx.action == null ) ? "" : HtmlUtility.htmlTag(msgEx.action);
                        value1 = (msgEx.value1 == null ) ? "" : HtmlUtility.htmlTag(msgEx.value1);
                        value2 = (msgEx.value2 == null ) ? "" : HtmlUtility.htmlTag(msgEx.value2);
			parameter =(msgEx.parameter == null ) ? "" : HtmlUtility.htmlTag(msgEx.parameter);
            messageCode =(msgEx.messageCode == null ) ? "" : HtmlUtility.htmlTag(msgEx.messageCode);
            

    	}else{
    	   if (exception.getMessage() != null && exception.getMessage().length() != 0) {
    	       msgs = new String[] { exception.getMessage() };
    	   }
    	   else {
    	   msgs = new String[] { exception.toString() };
    	   }
    	}
	}
%>
<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0">
<table width="102%" border="0" cellpadding="0" cellspacing="0" class="content1">
    <tr>
        <td width="12" height="27">&nbsp; </td>
        <td width="601" valign="top"><br>
            <span class="content2"><%=value1%> </span><span class="title0"> <%=value2%></span><span class="content2"> /</span><br><br>
            <span class="title1"><%=errorType%></span><br>
            <hr align="left" color="#333333" width="100%" size="1"><br><br>
            <table width=100%  border=0 cellpadding=5 cellspacing=0>
<%
                if (msgs == null) {
%>
                <tr>
                    <td width="84%" valign="top">
                        <span class="content2">Error Code: <%=errorCode%></span><br>
                    </td>
                </tr>
                <tr>
                    <td width="84%" valign="top"><span class="content2"><%=explan%></span><br>
                    </td>
                </tr>

<%
                }else{
%>
                <tr>
                    <td width="84%" valign="top"><span class="content2">
                    System internal error!</br>
<%
            		   int count = 0;
            	       String msg;
                       for (int i=0;i<msgs.length; i++) {
                            count++;
                          	if (msgs.length == 1)
                          	    msg = msgs[i];
                            else
                                msg = count + ". " + msgs[i];
            		     out.println (msg+"<br>");
                   	   }
%>
                    </span><br>
                    </td>
                </tr>

<%
                }
%>
             </table>
         </td>
     </tr>
     <tr>
         <td width="12" height="151"></td>
         <td>
             <form name="theForm" action="<%=rootDirectory%><%=theURL%>" method="post">
             <b>
             <% if (action.equalsIgnoreCase("back")) { 
                 String midURL="";
                 if(errorCode.equalsIgnoreCase("N/A") || theURL.indexOf("javascript:history.go(-1)")==-1) midURL=rootDirectory+"/"+theURL;
                 else midURL=theURL;
                 if(midURL.indexOf("javascript:history.go(-1)")!=-1) midURL="javascript:history.go(-1)";
             %>
             <a href="<%=midURL%>" onMouseOver="MM_swapImage('Image151','','<%=rootDirectory%>/images/button/i_back.jpg',1)" onMouseOut="MM_swapImgRestore()"><img src="<%=rootDirectory%>/images/button/i_back_on.jpg" name="Image151" border="0" id="Image151"></a>
             <% } else if(action.equalsIgnoreCase("reg_back")) { %>
             <a href="javascript:history.go(-1);" onMouseOver="MM_swapImage('Image151','','<%=rootDirectory%>/images/button/i_back.jpg',1)" onMouseOut="MM_swapImgRestore()"><img src="<%=rootDirectory%>/images/button/i_back_on.jpg" name="Image151" border="0" id="Image151"></a>
             <% } else { %>
             <a href="javascript:nextPage();" onMouseOver="MM_swapImage('Image161','','<%=rootDirectory%>/images/button/i_continue.jpg',1)" onMouseOut="MM_swapImgRestore()"><img src="<%=rootDirectory%>/images/button/i_continue_on.jpg" name="Image161" border="0" id="Image161"></a>
             <% } %>
             </b>
             </form>
             <font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif">&nbsp;</font>
          </td>
      </tr>
</table>
</body>

<script language="Javascript">
<!--
function nextPage() {

	document.theForm.submit();
}
//-->
</script>
