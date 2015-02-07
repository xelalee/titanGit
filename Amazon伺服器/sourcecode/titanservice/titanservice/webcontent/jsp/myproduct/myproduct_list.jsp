<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.product.bundles.Resources" var="bundle"/> 
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
            <%@ include file="/jsp/myproduct/left_product.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<h:form>
<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27">&nbsp;</td>
        <td colspan="2" valign="top">
            <span class="title1"><h:outputText value="#{bundle.TITLE}"/></span><br>
            <hr align="left" color="#333333" width="100%" size="1">
            <br><br>
        </td>
        <td width="1" rowspan="12"></td>
    </tr>
    <tr>
        <td class="title_bar1">&nbsp;</td>
        <td colspan="2" class="title_bar2">
        &nbsp;&nbsp;&nbsp;<h:outputText value="#{bundle.REGISTERED_PRODUCT_LIST}"/><br>
        </td>
    </tr>

    <tr>
        <td width="20" height="42">&nbsp;</td>
        <td width="20">&nbsp;</td>

    <td width="748" valign="top"> 
      <span class="content3">
      <br>
      <h:outputText value="#{bundle.REGISTERED_PRODUCT_LIST_NOTE}" escape="false" />
      <br>
      </span>
      <br>

        <span class="content3">  
                    <table align="left" width="100%">
                    <tr>
                    <td>
					<h:dataTable id="product_list" value="#{myProductAction.productBeans}" 
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
  								<h:outputText value="#{bundle.SERIAL_NUMBER}"/>
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

    <p>&nbsp;</p></td>
    </tr>
</table>
</h:form>           
            
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="../../images/1px.gif" width="1" height="1"></td>
          <td width="2" align="left" valign="top" bgcolor="#FFFFFF">
            <%@include file="/jsp/common/blank.html" %>
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

