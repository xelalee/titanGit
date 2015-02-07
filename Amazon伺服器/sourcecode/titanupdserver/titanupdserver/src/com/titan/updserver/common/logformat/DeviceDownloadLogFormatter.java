
package com.titan.updserver.common.logformat;

import com.titan.util.Util;


public class DeviceDownloadLogFormatter extends CommonLogFormatter{
    private final static String STR_HTTPIOEXCEPTION = "HttpIOException";
    
    private String mac = null;
    private String ip = null;
    private String token = null;
    private String file_size = null;
    private String download_time = null;
    private String sessionid = null;
    private String CDSN = null;
    
    public String getMac(){
        return CommonLogFormatter.formatValue(this.mac,CommonLogFormatter.MAC_LENGTH);
    }
    public void setMac(String mac){
        this.mac = mac;
    }
   
    public String getIp(){
        return CommonLogFormatter.formatValue(this.ip,CommonLogFormatter.IP_LENGTH);
    }
    public void setIp(String ip){
        this.ip = ip;
    }
    
    public String getToken(){
        return this.token;
    }
    public void setToken(String token){
        this.token = token;
    }

    public String getFile_Size(){
        return CommonLogFormatter.formatValue(this.file_size,CommonLogFormatter.FILE_SIZE_LENGTH);
    }
    public void setFile_Size(String file_size){
        this.file_size = file_size;
    }
    
    public String getDownload_Time(){
        return CommonLogFormatter.formatValue(this.download_time,CommonLogFormatter.DOWNLOAD_TIME_LENGTH);
    }
    public void setDownload_Time(String download_time){
        this.download_time = download_time;
    }
    
    public String getSessionid(){
        return CommonLogFormatter.formatValue(this.sessionid,CommonLogFormatter.SESSIONID_LENGTH);
    }
    public void setSessionid(String sessionid){
        this.sessionid = sessionid;
    }
    
    public String getCDSN(){
        return CommonLogFormatter.formatValue(this.CDSN,CommonLogFormatter.CDSN_LENGTH);
    }
    public void setCDSN(String CDSN){
        this.CDSN = CDSN;
    }
    
    /**
     * format the log information
     * @return
     */
    public String getFormattedLog(){
        StringBuffer buffer = new StringBuffer();
        String str = null;
        str = this.getTitle();
        if(this.getTitle() != null){
            buffer.append(str);
        }
        str = this.getMac();
        if(str != null){
            buffer.append(" [MAC]:");
            buffer.append(str);
        } 
        str = this.getIp();
        if(str != null){
            buffer.append(" [IP]:");
            buffer.append(str);
        }
        str = this.getToken();
        if(str != null){
            buffer.append(" [TOKEN]:");
            buffer.append(str);
        }
        str = this.getFile_Size();
        if(str != null){
            buffer.append(" [FILE SIZE]:");
            buffer.append(str);
        }
        str = this.getDownload_Time();
        if(str != null){
            buffer.append(" [DOWNLOAD TIME]:");
            buffer.append(str);
        }
        str = this.getServer_IP();
        if(str != null){
            buffer.append(" [SERVER]:");
            buffer.append(str);
        } 
        str = this.getSessionid();
        if(str != null){
            buffer.append(" [SESSIONID]:");
            buffer.append(str);
        }
        str = this.getCDSN();
        if(str != null){
            buffer.append(" [CDSN]:");
            buffer.append(str);
        }
        str = this.getError_Code();
        if(str != null){
            buffer.append(" [ERROR CODE]:");
            buffer.append(str);
        }    
        str = this.getError_Message();
        if(str != null){
            if(str.indexOf(STR_HTTPIOEXCEPTION) != -1){
                str = "Connection is reset for poor network quality. "+str;
            }
            buffer.append(" [ERROR MESSAGE]:");
            buffer.append(str);
        }        
        return Util.handleLogMessge(buffer.toString());
    }

}
