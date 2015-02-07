// Decompiled Using: FrontEnd Plus v2.01 AND the JAD Engine
// Available From: http://www.reflections.ath.cx
// Decompiler options: packimports(3)
// Source File Name:   CookieUtils.java

package com.titan.mytitan.app.util;

import javax.servlet.http.*;


public class CookieUtil{
	private final static int COOKIE_LIVE = 3600*24*365;
	
	HttpServletRequest httpservletrequest;
	HttpServletResponse httpservletresponse;

    public CookieUtil()
    {
    	httpservletrequest = ViewUtil.getServletRequest();
    	httpservletresponse = ViewUtil.getServletResponse();
    	
    }

    public String getCookieValue(String s)
    {
        Cookie acookie[] = httpservletrequest.getCookies();     
        
        String s1 = null;
        if(acookie != null){
            for(int i = 0; i < acookie.length; i++)
            {
                if(acookie[i].getName().equals(s)){
                	s1 = acookie[i].getValue();
                	break;
                }
            }
        }
        return s1;
    }

    public void setCookie(String s, String s1)
    {
        Cookie cookie = new Cookie(s, s1);
        cookie.setMaxAge(COOKIE_LIVE);
        cookie.setPath("/");
        httpservletresponse.addCookie(cookie);
    }
    
    public void removeCookie(String s)
    {
        Cookie cookie = new Cookie(s, "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        httpservletresponse.addCookie(cookie);
    }

    public boolean isCookieSet(String s)
    {
        return getCookieValue(s) != null;
    }
}
