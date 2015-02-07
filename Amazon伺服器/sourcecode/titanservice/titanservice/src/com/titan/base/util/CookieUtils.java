// Decompiled Using: FrontEnd Plus v2.01 AND the JAD Engine
// Available From: http://www.reflections.ath.cx
// Decompiler options: packimports(3)
// Source File Name:   CookieUtils.java

package com.titan.base.util;

import javax.servlet.http.*;

public class CookieUtils {


    public CookieUtils() { }

    public static String getCookieValue(String s, HttpServletRequest httpservletrequest) {
        Cookie acookie[] = httpservletrequest.getCookies();
        String s1 = null;
        if(acookie != null) {
            for(int i = 0; i < acookie.length; i++) {
                if(!acookie[i].getName().equals(s))
                    continue;
                s1 = acookie[i].getValue();
                break;
            }
        }
        return s1;
    }

    public static void sendCookie(String s, String s1, int i, HttpServletResponse httpservletresponse) {
        Cookie cookie = new Cookie(s, s1);
        cookie.setMaxAge(i);
        httpservletresponse.addCookie(cookie);
    }

    public static boolean isCookieSet(String s, HttpServletRequest httpservletrequest) {
        return getCookieValue(s, httpservletrequest) != null;
    }
}
