<%@ taglib uri='/WEB-INF/struts-template.tld' prefix='template' %>
<%@ page contentType="text/html; charset=UTF-8"%>

<template:insert template='/jsp/common/template.jsp'>
  <template:put name='title' content='Login' direct='true'/>
  <template:put name='top' content='/jsp/login/login_top.jsp' />
  <template:put name='left' content='/jsp/common/left.jsp'/>
  <template:put name='content' content='/jsp/common/session_timeout_content.jsp'/>
  <template:put name='right' content='/jsp/common/blank.html'/>
  <template:put name='bottom' content='/jsp/common/bottom.html' />   
</template:insert>
