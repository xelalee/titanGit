<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:view>

<h:selectOneMenu value="">
<f:selectItems value="#{applicationBean.countryList}"/>
</h:selectOneMenu>

</f:view>
