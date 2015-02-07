<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<link href="../../css/dataTable.css" rel="stylesheet" type="text/css">
<title><h:outputText value="#{bundle.TITLE}"/></title>
</head>

<body leftmargin="0" topmargin="0">

<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <table width="100%" height="80" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="80">
		    <%@ include file="/jsp/common/top.jsp" %>
	      </td>
        </tr>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <%@ include file="/jsp/login/left_welcome.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<h:form>
<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
  <tr>
    <td width="19" height="14">&nbsp;</td>
    <td valign="top">
      <span class="title1"><h:outputText value="#{bundle.WELCOME}" /> </span><br>
      <hr align="left" color="#333333" width="100%" size="1">
      <br>
   </td>
  </tr>
  <tr>
    <td width="19" height="6" valign="top">&nbsp;</td>
    <td valign="top" align="left"> 
       <table class="td_bg" width="80%" height="111" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="10" height="111" valign="top">&nbsp;</td>
          <td valign="top"> 
          <span class="title2">
          <h:outputText value="#{bundle.HELLO}" />!
            <strong>
            <h:outputText value="#{LoginAction.loginbean.accountbean.fullname}" />
            </strong></span> <br>
            <hr align="left" color="#333333" width="100%" size="1">
            <br> <span class="content3">
            <h:outputFormat value="#{bundle.LOGIN_COUNT_HINT}" >
               <f:param value="#{LoginAction.loginbean.accountbean.login_count}" />
            </h:outputFormat>
             <br>
            </span> <br> 
            <span class="title3">
              <h:outputText value="#{bundle.LAST_VIEWED}" />
            </span>
            <br><br>
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
              <td width="15%"><span class="content3"><h:outputText value="#{bundle.IP}" /></span></td>
              <td width="85%"><span class="content2"><h:outputText value="#{LoginAction.loginbean.accountbean.last_viewed_ip}" /></span></td>
              </tr>
              <tr>
              <td><span class="content3"><h:outputText value="#{bundle.TIME}" /></span></td>
              <td>
              <span class="content2">
            <h:outputText value="#{LoginAction.loginbean.last_viewed_day}" />&nbsp;<h:outputText value="#{LoginAction.loginbean.last_viewed_time}" /><h:outputText value="#{bundle.TIME_ZONE}" /></span>
              </td>
              </tr>
            </table>
            </td>
          <td width="10" valign="top">&nbsp;</td>
        </tr>
      </table></td>
  </tr>
  <tr>
    <td height="7">&nbsp;</td>
    <td >&nbsp;</td>
  </tr>
  <tr>
    <td  class="title_bar1">&nbsp;</td>
    <td  class="title_bar2" >&nbsp;&nbsp; 
      <strong>
        <h:outputText value="#{bundle.REGISTERED_titan_PRODUCTS}" />
      </strong>
    </td>
  </tr>
  <tr>
    <td width="19" height="69">&nbsp;</td>
    <td width="768" valign="top">
        <p class="content4">
          <h:outputText value="#{bundle.WELCOME_PAGE_NOTE}" />
        </p>
        <span class="content3">  
            <table align="left" width="90%" style="TABLE-LAYOUT:fixed">
               <tr>
                  <td> 
					<h:dataTable id="product_list" value="#{myProductAction.someProductBeans}" 
					        var="myProductBean" 
					        headerClass="table_1" 
					        columnClasses="productListCol1,productListCol2,productListCol3,productListCol4"
					        rowClasses="table_2,table_3" 
					        width="100%">   
  						<h:column>
  							<f:facet name="header">
  								<h:outputText value="#{bundle.FRIENDLY_NAME}"/>
  							</f:facet>
 							<h:commandLink action="#{myServiceAction.loadAction}" value="#{myProductBean.friendly_name}">
								<f:param name="serial_number" value="#{myProductBean.sn}"/>
								<f:param name="friendly_name" value="#{myProductBean.friendly_name}"/>
							</h:commandLink>
     					</h:column>
			            <h:column>
					        <f:facet name="header">
						        <h:outputText value="#{bundle.MODEL}"/>
					        </f:facet>
					        <h:outputText value="#{myProductBean.model.model_name}" />
  			            </h:column>      					
  						<h:column>
  							<f:facet name="header">
  								<h:outputText value="#{bundle.SERIAL_NUM}"/>
  							</f:facet>
							<h:outputText value="#{myProductBean.sn}"/>
     					</h:column>
  						<h:column>
  							<f:facet name="header">
  								<h:outputText value="#{bundle.AUTHENTICATION_CODE}"/>
  							</f:facet>
							<h:outputText value="#{myProductBean.mac}"/>
     					</h:column>     					
					</h:dataTable> 
				   </td>
				</tr>
			</table>
		</span>
     </td>
  </tr>
  <tr>
    <td width="19" height="69">&nbsp;</td>
    <td width="768" valign="top" align="center"><br>
		<p>
        <font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif">
          <h:commandButton styleClass="button" value="#{bundle_button.MORE}" action="myproduct_list"></h:commandButton>          
        <br>
        <br>
        <br>
        </font>
        </p>
    </td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
</table>
</h:form>
            
<!-- Content end -->

          </td>
        </tr>
      </table>
      <table width="100%" height="20" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">
        <tr>
          <td height="20">
            <%@ include file="/jsp/common/bottom.jsp" %>
	      </td>
        </tr>
      </table>
    </td>
  </tr>
</table>	

</body>
</html>

</f:view>

