package com.titan.controller;

import javax.servlet.http.HttpServletRequest;

import com.titan.controller.exception.AuthException;



public interface AuthInterface extends ServletContextInterface
{
        public String getAuth(HttpServletRequest request)throws AuthException;
}
