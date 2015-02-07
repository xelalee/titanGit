<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.service.bundles.Resources" var="bundle"/>
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
            <td width="18" height="27">&nbsp;</td>
            <td colspan="2" valign="top">
                <span class="title1"><h:outputText value="#{bundle.TITLE}"/></span><br>
                <hr align="left" color="#333333" width="100%" size="1">
                <br>
            </td>
        </tr>
        <tr>
            <td width="18" height="14" valign="top" class="title_bar1">&nbsp;</td>
            <td width="12" class="title_bar2">&nbsp;</td>
            <td width="642" valign="middle" class="title_bar2"><h:outputText value="#{bundle.PRODUCT_INFORMATION}"/></td>
        </tr>
        <tr>
            <td width="18" height="55" valign="top">&nbsp;</td>
            <td width="12" >&nbsp;</td>
            <td height="55" class="content3" valign="top"><br>
                <span class="title4"><h:outputText value="#{myServiceAction.myproductbean.friendly_name}"/></span>
                <br><br>
                <table width="100%">
                  <tr>
                    <td width="30%">
                      <span class="content3"><h:outputText value="#{bundle.SERIAL_NUMBER}"/><h:outputText value="#{bundle.COLON}"/></span>
                    </td>
                    <td>
                      <span class="content2"><h:outputText value="#{myServiceAction.myproductbean.sn}"/></span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="content3"><h:outputText value="#{bundle.PRODUCTS}"/><h:outputText value="#{bundle.COLON}"/></span>
                    </td>
                    <td>
                      <span class="content2"><h:outputText value="#{myServiceAction.myproductbean.model.model_name}"/></span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="content3"><h:outputText value="#{bundle.AC_MAC}"/><h:outputText value="#{bundle.COLON}"/></span>
                    </td>
                    <td>
                      <span class="content2"><h:outputText value="#{myServiceAction.myproductbean.mac}"/></span>
                    </td>
                  </tr>                                                                                 
                </table>
                <br>
            </td>
        </tr>
        <tr>
            <td width="18" height="10" class="title_bar1">&nbsp;</td>
            <td width="12" class="title_bar2">&nbsp;</td>
            <td class="title_bar2"><h:outputText value="#{bundle.MANAGE_PRODUCT}"/></td>
        </tr>
        <tr>
            <td width="18" height="4" valign="top">&nbsp;</td>
            <td width="12" >&nbsp;</td>
            <td height="4" valign="top" class="content2"><br>
               <h:outputText value="#{bundle.MANAGE_PRODUCT_NOTE}"/><br><br>
            </td>
        </tr>
        <tr>
            <td width="18" height="10">&nbsp;</td>
            <td width="12" >&nbsp;</td>
            <td valign="top" class="title4">
                <h:inputHidden value="#{myServiceAction.myproductbean.account_id}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.my_product_id}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.sn}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.mac}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.friendly_name}" />
                <table>
                  <tr>
                    <td class="title4" width="30%">
                      <h:outputText value="#{myServiceAction.myproductbean.friendly_name}" />                    
                    </td>
                    <td>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <h:commandButton styleClass="button" value="#{bundle_button.RENAME}" action="myproduct_rename" title="#{bundle.RENAME_NOTE}"/>
                      <h:commandButton styleClass="button" value="#{bundle_button.TRANSFER}" action="myproduct_transfer" title="#{bundle.TRANSFER_NOTE}"/>
                      <h:commandButton styleClass="button" value="#{bundle_button.REINSTALL}" action="myproduct_reinstall" title="#{bundle.REINSTALL_NOTE}"/>                 
                    </td>
                  </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td width="18" height="10">&nbsp;</td>
            <td width="12" >&nbsp;</td>
            <td><br></td>
        </tr>
        <tr>
            <td width="18" class="title_bar1">&nbsp;</td>
            <td width="12" class="title_bar2">&nbsp;</td>
            <td class="title_bar2"><h:outputText value="#{bundle.AVAILABLE_SERVICE_LIST}"/></td>
        </tr>       
        <tr>
            <td width="18" height="10">&nbsp;</td>
            <td width="12" >&nbsp;</td>        
            <td>
               <table width="98%" > 
                 <tr>
                   <td>
                   <h:messages errorClass="errorMessage" infoClass="infoMessage" globalOnly="true" />
                   </td>
                 </tr>
                 <tr>
                   <td>                   
        	<h:dataTable id="service_list" value="#{myServiceAction.myservicebeans}" 
		        var="myServiceBean" headerClass="table_1" rowClasses="table_2,table_3"
		        columnClasses="serviceListCol1,serviceListCol2,serviceListCol3,serviceListCol4,serviceListCol5,serviceListCol6"
		        width="100%">  
		            <h:column>
						<f:facet name="header">
							<h:outputText value=""/>
						</f:facet>
				        <h:outputText value="#{myServiceBean.id}"/>
  				    </h:column>	 
				    <h:column>
						<f:facet name="header">
							<h:outputText value="#{bundle.SERVICE_NAME}"/>
						</f:facet>
				        <h:outputText value="#{myServiceBean.service.service_name}"/>
  				    </h:column>					        
					<h:column>
						<f:facet name="header">
							<h:outputText value="#{bundle.SERVICE_TYPE}"/>
						</f:facet>
				        <h:outputText value="#{myServiceBean.service.service_type}"/>
  					</h:column>     					
					<h:column>
						<f:facet name="header">
							<h:outputText value="#{bundle.STATUS}"/>
						</f:facet>
				        <h:outputText value="#{myServiceBean.service.status}"/>
  					</h:column>
					<h:column>
						<f:facet name="header">
							<h:outputText value="#{bundle.EXPIRATION_DATE}"/>
						</f:facet>
				        <h:outputText value="#{myServiceBean.expiration_date_disp}" escape="false"/>
  					</h:column>     
					<h:column>
						<f:facet name="header">
							<h:outputText value="#{bundle.REMARK}"/>
						</f:facet>
  					</h:column>  										
		</h:dataTable>   	 
                 </td>
                </tr>
              </table>  
          </td>
      </tr>
   </table>
</h:form>  
       
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../images/topic_vbg.gif" bgcolor="#FFFFFF">
          <img src="../../images/1px.gif" width="1" height="1"></td>
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
