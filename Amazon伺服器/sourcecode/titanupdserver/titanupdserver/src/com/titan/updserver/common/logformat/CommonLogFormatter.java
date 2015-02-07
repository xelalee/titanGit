
package com.titan.updserver.common.logformat;



import com.titan.util.Configure;
import com.titan.util.Util;

public class CommonLogFormatter {
    protected static final String[] BLANKS = new String[]{
            "",
            " ",
            "  ",
            "   ",
            "    ",
            "     ",
            "      ",
            "       ",
            "        ",
            "         ",
            "          ",
            "           ",
            "            ",
            "             ",
            "              ",
            "               ",
            "                ",
            "                 ",
            "                  ",
            "                   ",
            "                    ",
    };
    
    protected static final int MAC_LENGTH = 12;
    protected static final int IP_LENGTH = 15;
    protected static final int DOWNLOAD_TIME_LENGTH = 10;
    protected static final int FILE_SIZE_LENGTH = 10;
    protected static final int SESSIONID_LENGTH = 10;
    protected static final int CDSN_LENGTH = 4;
    
    
    protected String title = null;
    protected String server_ip = Configure.LOCAL_IP;
    protected String error_code = null;
    protected String error_message = null;
    
    public CommonLogFormatter(){
        
    }
    
    public String getTitle(){
        return this.title;
    }
    public void setTitle(String title){
        this.title = title;
    }  
    
    public String getServer_IP(){
        return this.server_ip;
    }
    public String getError_Code(){
        return this.error_code;
    }
    public void setError_Code(String error_code){
        this.error_code = error_code;
    }    
    public String getError_Message(){
        return this.error_message;
    }
    public void setError_Message(String error_message){
        this.error_message = error_message;
    }    
    
    /**
     * format the log information
     * @return
     */
    public String getFormattedLog(){
        StringBuffer buffer = new StringBuffer();
        String str = null;
        
        str = this.getTitle();
        if(str != null){
            buffer.append(str);
        }
        str = this.getServer_IP();
        if(str != null){
            buffer.append(" [SERVER]:");
            buffer.append(str);
        }  
        str = this.getError_Code();
        if(str != null){
            buffer.append(" [ERROR CODE]:");
            buffer.append(str);
        }    
        str = this.getError_Message();
        if(str != null){
            buffer.append(" [ERROR MESSAGE]:");
            buffer.append(str);
        }        
        return Util.handleLogMessge(buffer.toString());
    }
    
    /**
     * if value is shortter than len, then fill blanks in front
     * if longer, then get the len in behind
     * @param value
     * @param len
     * @return
     */
    protected static String formatValue(String value, int len){
        String str = "";
        if(value == null){
            return value;
        }else{
            str = value;
        }
        int len0 = str.length();
        if(len0 <= len){
            return BLANKS[len-len0]+value;
        }else{
            return value.substring(len0-len);
        }
    }
    
    
    public static void main(String[] args){
    }
}

