<%@ taglib uri='/WEB-INF/struts-template.tld' prefix='template' %>
<%@ page contentType="text/html; charset=UTF-8"%>
<%@ include file="/jsp/common/check_session.jsp" %>

<template:insert template='/jsp/common/template.jsp'>  <template:put name='title' content='Welcome to myTitan.com' direct='true'/>
  <template:put name='title' content='Account' direct='true'/>
  <template:put name='top' content='/jsp/common/top.jsp' />
  <template:put name='left' content='/jsp/common/left.jsp' />
  <template:put name='content' content='/jsp/account/account_delete_confirm_content.jsp'/>
  <template:put name='right' content='/jsp/common/blank.html' />
  <template:put name='bottom' content='/jsp/common/bottom.html' />
</template:insert>