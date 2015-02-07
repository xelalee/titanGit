<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.account.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<title><h:outputText value="#{bundle.TITLE_UPDATE_ACCOUNT}"/></title>
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
            <%@ include file="/jsp/myaccount/left_account.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->
<div id="main">
<h:form>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content3">
    <tr>
      <td width="18" height="27">&nbsp;</td>
      <td colspan="4">
        <span class="title1"><h:outputText value="#{bundle.PERSONAL_INFORMATION}"/></span><br>
      	<hr align="left" color="#333333" width="100%" size="1">
        <br>
      </td>
    </tr>
    <tr>
      <td width="18" height="27" valign="top">&nbsp;</td>
      <td colspan="4" valign="top"> 
        <span class="content2"><h:outputText value="#{bundle.NOTE_UPDATE_ACCOUNT}"/>
        </span><br><br>
        <span class="lightblue"><h:outputText value="#{bundle.FIELD_MARKED_STAR_REQUIRED}"/></span>
      </td>
    </tr>
    <tr>
      <td width="18" height="12" >&nbsp;</td>
      <td colspan="4">
      </td>
    </tr>    
    <tr>
      <td width="18"></td>
      <td colspan="4">
        <h:messages errorClass="errorMessage" infoClass="infoMessage" globalOnly="true" />
      </td>
    </tr>    
    <tr>
      <td width="18" height="12" >&nbsp;</td>
      <td colspan="4">
      </td>
    </tr>       
    <tr>
      <td width="18" height="12" class="title_bar1">&nbsp;</td>
      <td width="12" class="title_bar2"></td>
      <td colspan="3" class="title_bar2"><h:outputText value="#{bundle.LOGIN_INFORMATION}"/></td>
    </tr>
    <tr>
      <td width="18" valign="top">&nbsp;</td>
      <td width="12" valign="top">&nbsp;</td>
      <td colspan="3" valign="top"></td>
    </tr>
    <tr>
      <td width="18">&nbsp;</td>
      <td width="12" valign="top">&nbsp;</td>
      <td colspan="3" valign="top">
      	<table width="100%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
      	    <h:inputHidden value="#{AccountAction.accountbean.account_id}"/>
            <h:inputHidden value="#{AccountAction.accountbean.password}"/>
            <h:inputHidden value="#{AccountAction.accountbean.username}" />
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td valign="top" width="30%" > 
            <span class="content3"><h:outputText value="#{bundle.USERNAME}"/></span>
            </td>
            <td width="70%" valign="top">
                <span class="td_bg"><font size="2"><strong><h:outputText value="#{AccountAction.accountbean.username}"/></strong></font></span>
                <p><span class="content3">
                <h:outputText value="#{bundle.TO_CHANGE_PASSWORD}"/>
                <h:outputLink value="../../jsp/myaccount/change_password.jsf">
                   <h:outputText value="#{bundle.CLICK_HERE}"/>
                </h:outputLink>
                </span></p>
            </td>
          </tr>
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA">
            <td valign="top"> 
            <span class="content3"><h:outputText value="#{bundle.PASSWORD_HINT}"/>
              </span>
            </td>
            <td height="42" valign="top"> <p class="content3">
                <h:inputText id="passwordhint" value="#{AccountAction.accountbean.password_hint}" size="30" maxlength="40" styleClass="content3">
                  <f:validator validatorId="mytitan.CharValidator" />
                </h:inputText>
                <h:message styleClass="errorMessage" for="passwordhint" />
                <br>
            <h:outputText value="#{bundle.PASSWORD_HINT_NOTE}"/></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td width="18" height="12" class="title_bar1">&nbsp;</td>
      <td width="12" class="title_bar2">&nbsp;</td>
      <td height="12" colspan="3" class="title_bar2"><h:outputText value="#{bundle.CONTACT_INFORMATION}"/></td>
    </tr>
    <tr>
      <td width="18">&nbsp;</td>
      <td width="12">&nbsp;</td>
      <td colspan="3" valign="top"></td>
    </tr>
    <tr>
      <td width="18">&nbsp;</td>
      <td width="12">&nbsp;</td>
      <td colspan="3" valign="top">
      
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" width="30%" align="left">
             <span class="content3"><h:outputText value="#{bundle.FIRST_NAME}"/></span><span class="star">*</span>
            </td>
            <td bgcolor="#F5F9FA" width="70%" align="left">
                   <h:inputText id="first_name" value="#{AccountAction.accountbean.first_name}" size="30" maxlength="20" required="true" styleClass="content3">
                    <f:validator validatorId="mytitan.CharValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="first_name"  />           
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
              <span class="content3"><h:outputText value="#{bundle.LAST_NAME}"/></span><span class="star">*</span><br>            
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="last_name" value="#{AccountAction.accountbean.last_name}" size="30" maxlength="20" required="true" styleClass="content3">
                    <f:validator validatorId="mytitan.CharValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="last_name"  />            
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left" valign="top">
            <span class="content3"><h:outputText value="#{bundle.EMAIL_ADDRESS}"/></span><span class="star">*</span>        
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="email" value="#{AccountAction.accountbean.email}" size="60" maxlength="50" required="true" styleClass="content3">
                     <f:validator validatorId="mytitan.EmailFacesValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="email"  />
                  <br>
                  <span class="content2"><h:outputText value="#{bundle.EMAIL_ADDRESS_NOTE}"/></span>            
            </td>      	
          </tr>          
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
               <span class="content3"><h:outputText value="#{bundle.COMPANY_ORGANIZATION}"/></span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="company" value="#{AccountAction.accountbean.company}" size="30" maxlength="60" styleClass="content3">
                    <f:validator validatorId="mytitan.CharValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="company"  />            
            </td>      	
          </tr>          
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                  <span class="content3"><h:outputText value="#{bundle.ADDRESS}"/></span>         
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="address" value="#{AccountAction.accountbean.address}" size="30" maxlength="60" styleClass="content3">
                    <f:validator validatorId="mytitan.CharValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="address"  />             
            </td>      	
          </tr> 
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                  <span class="content3"><h:outputText value="#{bundle.CITY}"/></span><br>           
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="city" value="#{AccountAction.accountbean.city}"  size="30" maxlength="20" styleClass="content3">
                     <f:validator validatorId="mytitan.CharValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="city"  />             
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                  <span class="content3"><h:outputText value="#{bundle.STATE_PROVINCE}"/></span>     
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="state" value="#{AccountAction.accountbean.state}" size="30" maxlength="20" styleClass="content3">
                    <f:validator validatorId="mytitan.CharValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="state"  />                
            </td>      	
          </tr>          
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                   <span class="content3"><h:outputText value="#{bundle.REGION}"/></span><span class="star">*</span>         
            </td>
            <td bgcolor="#F5F9FA" align="left">
                    <h:selectOneMenu id="country_code" value="#{AccountAction.accountbean.country_code}" required="true" styleClass="content3">   
                        <f:selectItem  itemValue="" itemLabel="#{bundle.SELECT}" />   
    					<f:selectItems value="#{applicationBean.countryList}"/>
				    </h:selectOneMenu>
				    <h:message styleClass="errorMessage" for="country_code"  />             
            </td>      	
          </tr>  
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">   
                  <span class="content3"><h:outputText value="#{bundle.POSTAL_CODE}"/></span>
                   
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="postal_code1" value="#{AccountAction.accountbean.postal_code}" size="30" maxlength="10" styleClass="content3">
                     <f:validator validatorId="mytitan.PostalCodeValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="postal_code1"  />
            </td>      	
          </tr>     
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left"> 
                  <span class="content3"><h:outputText value="#{bundle.PHONE_NUMBER}"/></span>  
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <h:inputText id="phone1" value="#{AccountAction.accountbean.phone}" size="30" maxlength="20" styleClass="content3">
                     <f:validator validatorId="mytitan.PhoneValidator" />
                  </h:inputText>
                  <h:message styleClass="errorMessage" for="phone1"  />             
            </td>      	
          </tr>   
        </table>
        </td>
    </tr>  
    <tr>
      <td width="18">&nbsp;</td>
      <td width="12" valign="top">&nbsp;</td>
      <td colspan="3">
          <br>
        <p align="center">
           <h:commandButton styleClass="button" value="#{bundle_button.SUBMIT}" action="#{AccountAction.updateAction}" onclick="javascript:gowait();" ></h:commandButton>
           <h:commandButton styleClass="button" value="#{bundle_button.CANCEL}" action="home" immediate="true"></h:commandButton>                   
        </p>
      </td>
    </tr>
    
  </table>
</h:form>            
</div>            
       
<div id="wait" style="visibility:hidden; position: absolute; top: 60; left: 190">
<%@ include file="/jsp/common/process_on_going.jsp" %>
</div>        
            
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
<script language="JavaScript" type="text/JavaScript">
function gowait() {
  document.getElementById("main").style.visibility="hidden";
  document.getElementById("wait").style.visibility="visible";
}

</script>
</f:view>

