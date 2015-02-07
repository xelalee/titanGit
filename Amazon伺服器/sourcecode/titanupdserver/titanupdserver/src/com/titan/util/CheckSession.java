
package com.titan.util;
import javax.servlet.http.HttpServletRequest;
import com.titan.util.Keys;
import java.util.HashMap;


public class CheckSession {
	
	public static boolean checkUserSession(HttpServletRequest request){
		HashMap hmUser = (HashMap)request.getSession().getAttribute(Keys.USER_INFO);
        
		if (hmUser==null){
			return false;
		}		
		return true;
	}
		
}
