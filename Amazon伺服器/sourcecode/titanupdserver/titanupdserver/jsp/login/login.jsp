<%@ taglib uri='/WEB-INF/struts-template.tld' prefix='template' %>
<%@ page import="com.titan.util.Util" %>
<%@ page contentType="text/html; charset=UTF-8"%>

<template:insert template='/jsp/common/template.jsp'>
  <template:put name='title' content='Titan Update Server' direct='true'/>
  <template:put name='top' content='/jsp/login/login_top.jsp' />
  <template:put name='left' content='/jsp/login/login_left.jsp' />
  <template:put name='content' content='/jsp/login/login_content.jsp'/>
  <template:put name='right' content='/jsp/common/blank.html' />
  <template:put name='bottom' content='/jsp/common/bottom.html' />
</template:insert>
