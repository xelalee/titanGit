<%@ taglib uri='/WEB-INF/struts-template.tld' prefix='template' %>
<%@ page contentType="text/html; charset=UTF-8"%>

<template:insert template='/jsp/common/template.jsp'>
  <template:put name='title' content='Message' direct='true'/>
  <template:put name='top' content='/jsp/common/top.jsp' />
  <template:put name='left' content='/jsp/login/login_left.jsp' />
  <template:put name='content' content='/jsp/common/confirm_page_content.jsp' />
  <template:put name='right' content='/jsp/common/blank.html' />
  <template:put name='bottom' content='/jsp/common/bottom.html' />
</template:insert>
