
package com.titan.updserver.common.logformat;

import com.titan.util.Util;

public class DeviceUpdateLogFormatter extends CommonLogFormatter{
    private String mac = null;
    private String ip = null;
    private String device = null;
    private String service = null;
    private String version = null;
    private String engine_version = null;
    private String token = null;
    private String file_count = null;
    private String interval = null;
    
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
    
    public String getDevice(){
        return this.device;
    }
    public void setDevice(String device){
        this.device = device;
    }
    
    public String getService(){
        return this.service;
    }
    public void setService(String service){
        this.service = service;
    }
    
    public String getVersion(){
        return this.version;
    }
    public void setVersion(String version){
        this.version = version;
    }
    
    public String getEngine_version() {
		return engine_version;
	}
	public void setEngine_version(String engine_version) {
		this.engine_version = engine_version;
	}
	public String getToken(){
        return this.token;
    }
    public void setToken(String token){
        this.token = token;
    }

    public String getFile_Count(){
        return this.file_count;
    }
    public void setFile_Count(String file_count){
        this.file_count = file_count;
    }
    
    public String getInterval(){
        return this.interval;
    }
    public void setInterval(String interval){
        this.interval = interval;
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
        str = this.getDevice();
        if(str != null){
            buffer.append(" [DEVICE]:");
            buffer.append(str);
        }
        str = this.getService();
        if(str != null){
            buffer.append(" [SERVICE]:");
            buffer.append(str);
        }
        str = this.getVersion();
        if(str != null){
            buffer.append(" [VERSION]:");
            buffer.append(str);
        }
        str = this.getEngine_version();
        if(str != null){
            buffer.append(" [ENGINE_VER]:");
            buffer.append(str);
        }
        str = this.getToken();
        if(str != null){
            buffer.append(" [TOKEN]:");
            buffer.append(str);
        }
        str = this.getFile_Count();
        if(str != null){
            buffer.append(" [FILE COUNT]:");
            buffer.append(str);
        }
        str = this.getInterval();
        if(str != null){
            buffer.append(" [INTERVAL]:");
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

}
