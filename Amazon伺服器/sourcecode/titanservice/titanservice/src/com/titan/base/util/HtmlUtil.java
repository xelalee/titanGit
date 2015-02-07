package com.titan.base.util;

import java.util.ArrayList;

public class HtmlUtil {

    public String htmlValue(String str0){
    	 String str = str0;
         str = Util.replaceChar(str, '"', "&#034;");
         str = Util.replaceChar(str, '\'',"&#039;");
         str = Util.replaceChar(str, '\\',"&#092;");
         return str;
    }

    /**
     * convert special character to fit for HTML
     * Ex:
     * <% HtmlUtility hu = new HtmlUtility()%>
     * <td><%=hu.htmlTag(remark)%></td>
     *
     * @param str string to be converted
     * @return new string
     */
    public static String htmlTag(String str0){
    	String str = str0;
        str = Util.replaceChar(str, '<', "&#060;");
        str = Util.replaceChar(str, '>', "&#062;");
		str = Util.replaceChar(str, '\"', "&#034;");
        str = Util.replaceChar(str, '\n',"<br>");
		str = Util.replaceChar(str, '\t',"&nbsp;&nbsp;&nbsp;&nbsp;");
        return str;
     }

    /**
     * convert special character to fit for HTML
     * Ex:
     * <% HtmlUtility hu = new HtmlUtility()%>
     * javascript:showMemo('<%=hu.htmlValue(remark)%>')
     *
     * @param str string to be converted
     * @return new string
     */
    public String javascriptFuncCharValue(String str0){
         // (1.) Example: onMouseOver="javascript:showLayer(this, '<%=HtmlXmlLib.specialHtmlJavascriptFuncCharValue(careAttMemo)%>');"
         //str = StringLib.replaceChar(str, '"', "&#034;");
         //str = StringLib.replaceChar(str, '\'',"\\\'");

         /* */
         // or
         // (2.) Example: onMouseOver='javascript:showLayer(this, "<%=HtmlXmlLib.specialHtmlJavascriptFuncCharValue(careAttMemo)%>");'
         String str = str0;
    	 str = Util.replaceChar(str, '\n',"\\n");
         str = Util.replaceChar(str, '\r'," ");
         str = Util.replaceChar(str, '\'', "&#039;");
         str = Util.replaceChar(str, '"',"\\\"");

         return str;
     }

     /**
      * convert special character to fit Javascript function format.
      *
      * @param str string to be converted
      * @return new string
      */
      public String javascriptFuncCharValue2(String str0) {
          // (1.) Example: onMouseOver="javascript:showLayer(this, '<%=HtmlXmlLib.javascriptFuncCharValue2(careAttMemo)%>');"
          //str = StringLib.replaceChar(str, '"', "&#034;");
          //str = StringLib.replaceChar(str, '\'',"\\\'");

          /* */
          // or
          // (2.) Example: onMouseOver='javascript:showLayer(this, "<%=HtmlXmlLib.javascriptFuncCharValue2(careAttMemo)%>");'
    	  String str = str0;
    	  str = Util.replaceChar(str, '\n'," ");
          str = Util.replaceChar(str, '\r'," ");
          str = Util.replaceChar(str, '\'', " ");
          str = Util.replaceChar(str, '"'," ");

          return str;
      }

     /**
      * convert special character to fit for XML format.
      *
      * @param str string to be converted
      * @return new string
      */
      public String specialXmlChar(String str0) {
    	  String str = str0;
    	  str = Util.replaceChar(str, '&', "&#038;");
          str = Util.replaceChar(str, '<', "&#060;");
          str = Util.replaceChar(str, '>', "&#062;");
          str = Util.replaceChar(str, '"', "&#034;");
          str = Util.replaceChar(str, '\'',"&#039;");
          return str;
      }


     /**
      * 
      * @param source
      * @param parser
      * @param character
      * @return
      */
     public ArrayList parserStr(String source,String parser,String character){
       ArrayList targe = new ArrayList();
       int str_lengh = source.length();
       int index = 0,next_index = 0;
       String psr_str = "";
       boolean flag = true;
       while(flag){
         next_index = source.indexOf(parser,index);
         if(next_index == -1){
           psr_str = source.substring(index,str_lengh);
           if(character.toUpperCase(Keys.DEFAULT_LOCALE).equals("U")){
             psr_str = psr_str.toUpperCase(Keys.DEFAULT_LOCALE);
           }
           if(character.toUpperCase(Keys.DEFAULT_LOCALE).equals("L")){
             psr_str = psr_str.toLowerCase(Keys.DEFAULT_LOCALE);
           }
           if(character.toUpperCase(Keys.DEFAULT_LOCALE).equals("M")){
           }
           targe.add(psr_str);
           flag = false;
         }
         else{
           psr_str = source.substring(index,next_index);
           if(character.toUpperCase(Keys.DEFAULT_LOCALE).equals("U")){
             psr_str = psr_str.toUpperCase(Keys.DEFAULT_LOCALE);
           }
           if(character.toUpperCase(Keys.DEFAULT_LOCALE).equals("L")){
             psr_str = psr_str.toLowerCase(Keys.DEFAULT_LOCALE);
           }
           if(character.toUpperCase(Keys.DEFAULT_LOCALE).equals("M")){
           }
           index = next_index + parser.length();
           targe.add(psr_str);
         }
       }

       return targe;
     }



     /**
      * replace str
      * @param source
      * @param parser
      * @param replace
      * @return
      */
     public String replaceStr(String source,String parser,String replace){
       return replaceStr(source,parser,"m",replace);
     }



     /**
      * replace str
      * @param source
      * @param parser
      * @param character
      * @param replace
      * @return
      */
     public String replaceStr(String source,String parser,String character,String replace){
       ArrayList source_array = parserStr(source,parser,character);
       String targe = "";
       for(int i=0 ; i < source_array.size(); i++ ){
         if(!source_array.get(i).toString().equals("")){
           if((i + 1) < source_array.size()){
             targe += source_array.get(i).toString() + replace;
           }
           else{
             targe += source_array.get(i).toString();
           }
         }
         else{
           if((i + 1) < source_array.size()){
             targe += replace + source_array.get(i + 1).toString() + replace;
             i++;
             continue;
           }
         }
       }
       return targe;
     }

}