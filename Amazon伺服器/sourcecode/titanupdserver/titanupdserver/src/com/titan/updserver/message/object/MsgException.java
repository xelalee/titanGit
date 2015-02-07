package com.titan.updserver.message.object;

import java.util.*;
import com.titan.jdbc.*;
import com.titan.util.Keys;
import com.titan.util.StringLib;

public class MsgException extends Exception
{
    public String theURL = "javascript:history.go(-1);";
    public String theText =  "Go Back";
    public String errorCode = null;
    public String messageCode = null;
    public String errorType = "error";
    public String explan = "The Error Code :";
    public String action = "N/A";
    public String value1 = "";
    public String value2 = "";
    public String parameter = null ;
    private String[][] replaceData=null;
    private Collection replaceCol=null;
    private int replaceType = 0;
    private String[] separate = {"\"","\""};
    public MsgException(String errorCode)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.getMessageError(errorCode);
    }
    public MsgException(String errorCode, String theURL, String theText)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.theURL = theURL;
        this.theText = theText;
        this.getMessageError(errorCode);
    }
    public MsgException(String errorCode, String theURL, String theText,String[][] replaceData)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.theURL = theURL;
        this.theText = theText;
        this.replaceData = replaceData;
        this.replaceType = 1;
        this.getMessageError(errorCode);
    }
    public MsgException(String errorCode, String theURL, String theText,String[] separate,String[][] replaceData)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.theURL = theURL;
        this.theText = theText;
        this.separate = separate;
        this.replaceData = replaceData;
        this.replaceType = 1;
        this.getMessageError(errorCode);
    }

    public MsgException(String errorCode, String theURL, String theText,String[][] replaceData,Collection replaceCol)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.theURL = theURL;
        this.theText = theText;
        this.replaceData = replaceData;
        this.replaceCol = replaceCol;
        this.replaceType = 2;
        this.getMessageError(errorCode);
    }
    public MsgException(String errorCode, String theURL, String theText,String[] separate,String[][] replaceData,Collection replaceCol)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.theURL = theURL;
        this.theText = theText;
        this.separate = separate;
        this.replaceData = replaceData;
        this.replaceCol = replaceCol;
        this.replaceType = 2;
        this.getMessageError(errorCode);
    }

    public MsgException(String errorCode, String parameter)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.getMessageError(errorCode);
        this.parameter = parameter ;
    }
    public MsgException(String errorCode, String parameter, String theURL, String theText)
    {
        super(errorCode);
        this.errorCode = errorCode ;
        this.theURL = theURL;
        this.theText = theText;
        this.getMessageError(errorCode);
        this.parameter = parameter ;
    }
    public void setSeparate(String[] separate){
       this.separate = separate;
    }
    public String[] getSeparate(){
       return separate;
    }
    private void getMessageError(String errorCode){
    	if((errorCode == null) || (errorCode.equals(""))){
            this.explan = "The Error Code[" + errorCode + "] does not exist! ";
            this.action = "N/A";
            this.errorType = "error";
            this.value1 = "";
            this.value2 = "";
            this.messageCode = "";
            this.theURL = "javascript:history.go(-1);";
    	}
        String sql=
            "SELECT * FROM MESSAGE " +
            "WHERE code = "+errorCode;

        try {
        	Collection col = DAOHelper.query(sql);
          Iterator it = col.iterator();
          if (it.hasNext()) {
            HashMap hm = (HashMap)it.next();
            this.action = (hm.get("ACTION") == null) ? "" : replaceString(hm.get("ACTION").toString());
            this.explan = (hm.get("EXPLAN") == null) ? "" : replaceString(hm.get("EXPLAN").toString());
            this.errorType = (hm.get("TYPE") == null) ? "" : hm.get("TYPE").toString();
            this.value1 = (hm.get("VALUE1") == null) ? "" : replaceString(hm.get("VALUE1").toString());
            this.value2 = (hm.get("VALUE2") == null) ? "" : replaceString(hm.get("VALUE2").toString());
            this.messageCode = (hm.get("KEY") == null) ? "" : replaceString(hm.get("KEY").toString());
            this.theURL = (hm.get("URL") == null) ? "" : replaceString(hm.get("URL").toString());
          }
          else {
            this.explan = "The Error Code[" + errorCode + "] does not exist! ";
            this.action = "N/A";
            this.errorType = "error";
            this.value1 = "";
            this.value2 = "";
            this.messageCode = "";
            this.theURL = "javascript:history.go(-1);";
          }
        }
        catch (Exception e) {
          this.explan = e.toString();
        }
    }
    private String replaceString(String oldStr0){
    	String oldStr =oldStr0;
       if( oldStr != null || oldStr.length()!=0 ){
          switch(replaceType){
            case 0:
              break;
            case 1:
              oldStr = replaceData(oldStr);
              break;
            case 2:
              oldStr = replaceCol(oldStr);
              break;
          }
       }

       return oldStr;
    }
    private String replaceData(String oldStr0){
    	String oldStr = oldStr0;
      if( this.replaceData != null){
         for( int i=0 ; i<replaceData.length;i++){
           oldStr = StringLib.replaceString(oldStr, replaceData[i][0],
                                            format(replaceData[i][1]));
         }
      }

      return oldStr ;
   }
   private String replaceCol(String oldStr0){
   	String oldStr = oldStr0;
     if( this.replaceCol != null && replaceData!=null ){
        for(int i=0;i<replaceData.length;i++){
          oldStr = StringLib.replaceString(oldStr, replaceData[i][0] , format(replaceCol,replaceData[i][1],replaceData[i][2]));
        }
     }
     return oldStr ;
  }
  private String format(String str){
    if( str != null && str.length()!= 0 ){
        StringBuffer buffer = new StringBuffer();
        if( str.indexOf("|")==-1)
           buffer.append(separate[0]).append(str).append(separate[1]);
        else
           parseToken(buffer,str);
        return buffer.toString();
    }
    return str;
  }
  private String format(Collection col,String column){
    StringBuffer buffer = new StringBuffer();
    if( col != null && column != null){
      Set tmpSet = new HashSet();
      for( Iterator i= col.iterator();i.hasNext();){
        Map mp = (HashMap)i.next();
        String str = mp.get(column).toString();
        if(tmpSet.add(str))
           buffer.append(separate[0]).append(str).append(separate[1]).append(",");
      }
      int length = buffer.length();
      if( length>1 )
        buffer.deleteCharAt(length-1);
    }
    return buffer.toString();
  }
  private String format(Collection col,String column,String flag){
    if( "N".equalsIgnoreCase(flag)){
      StringBuffer buffer = new StringBuffer();
      if (col != null && column != null) {
        Set tmpSet = new HashSet();
        for (Iterator i = col.iterator(); i.hasNext(); ) {
          Map mp = (HashMap) i.next();
          String str = mp.get(column).toString();
          if (tmpSet.add(str))
            buffer.append(separate[0]).append(str).append(separate[1]).append(
                ",");
        }
        int length = buffer.length();
        if (length > 1)
          buffer.deleteCharAt(length - 1);
      }
      return buffer.toString();
    }else{
      return format(column);
    }
  }

  private StringBuffer parseToken(StringBuffer buffer,String str){
     StringTokenizer token = new StringTokenizer(str,"|");
     while(token.hasMoreTokens())
       buffer.append(separate[0]).append(token.nextToken()).append(separate[1]).append(",");
     int length = buffer.length();
     if( length>1 )
        buffer.deleteCharAt(length-1);
     return buffer;
  }
}
