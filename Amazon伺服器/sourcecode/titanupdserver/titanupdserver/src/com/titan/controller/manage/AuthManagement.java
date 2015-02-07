package com.titan.controller.manage;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletContext;

import java.util.HashMap;

import com.titan.controller.AuthInterface;
import com.titan.controller.exception.AuthException;


import java.security.MessageDigest;


//Add by George
import java.io.Serializable;
import com.titan.controller.SessionBindListener;


public class AuthManagement
    implements AuthInterface, Serializable {

    protected ServletContext context;

    public HashMap userMap = new HashMap();

    String code = null;
    //String sessionID;

    public AuthManagement() {
    }

    /**
     *
     * @param request
     * @return
     * @throws AuthException
     */
    public String getAuth(HttpServletRequest request) throws AuthException {
        //Object transObject = (Object) request.getSession().getAttribute(Keys.Titan_EJB_NAME);
        //set EJB in session
        //if (transObject==null){
        //    request.getSession().setAttribute(Keys.Titan_EJB_NAME, getSessionBean());
        //}
		return null;
    }

    /**
     *
     * @param request
     * @return true if the user's loginaname and password is correct, otherwise false;
     * @throws AuthException
     */
    public boolean getAuthenFromMail(HttpServletRequest request) {
        return true;
    }

    private Object getSessionBean() throws AuthException {
        return null;
        /*
        try {
            InitialContext ict = new InitialContext();
            TransactionHome home = (TransactionHome) ict.lookup(Keys.TRANSACTION_JNDINAME);
            Transaction remote = home.create();
            return remote;
        }
        catch (Exception ex) {
            throw new AuthException("Exception while getting session bean<br>\n" +
                                    ex.getMessage());
        }
        */
    }


    public void setServletContext(ServletContext context) {
        this.context = context;
    }
    /**
     * Do sign-on
     * @param request (request)
     * @param hmUserInfo (from session)
     */
    private void checkUserLoginCounter(HttpServletRequest request, HashMap hmUserInfo) {
      String sessionID;
      sessionID = request.getSession().getId(); //Get SessionID

      String userName = null;
      userMap = (HashMap)context.getAttribute("userMap");
      //先檢查session的hmUserInfo不為null
      if(hmUserInfo != null) {
         userName = (String) hmUserInfo.get("USERNAME");
      }
      //將該user與該user之session ID放入hashMap
      if(userName != null && userMap.get(userName) == null) {
         userMap.put(userName, sessionID);
         //new SessionBindListener
         SessionBindListener BindListener  = new SessionBindListener(context, userName, request);
         request.getSession().setAttribute("TEST", BindListener);
      } else if(userMap != null && !userMap.get(userName).toString().equals(sessionID)) {
        //Set error code
        code = "1013";
        request.setAttribute("RESULT_CODE", code);
      }
    }

    //MD5 Encrypt
    private static String MDEncrypt( String str ){
        String MD5Result = "";
        try{
            MessageDigest md5 = MessageDigest.getInstance("MD5");
            byte[] hash = md5.digest( str.getBytes() );
            MD5Result = cryptix.util.core.Hex.dumpString(hash);

        }
        catch (Exception e) {
            System.err.println("Caught exception " + e.toString());
        }
        return  MD5Result;
    }

}
