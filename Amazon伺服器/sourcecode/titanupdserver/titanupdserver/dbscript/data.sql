
DELETE FROM MENU;
DELETE FROM ACTION;
DELETE FROM ACTION_RESULT;
DELETE FROM MESSAGE; 
DELETE FROM FUNCTION;
DELETE FROM GROUP_NAME;
DELETE FROM FUNCTION2GROUP_NAME;
DELETE FROM ACCOUNT;
DELETE FROM SEQUENCE_ID;
DELETE FROM SCHEDULE;
DELETE FROM DEVICE_TYPE;
DELETE FROM SERVICE_TYPE;

Insert into MENU
   (MENU_ID, MENU_NAME, SORT_ID)
 Values
   (1, 'Account', 1);
   
Insert into MENU
   (MENU_ID, MENU_NAME, SORT_ID)
 Values
   (3, 'Device Type', 3);
   
Insert into MENU
   (MENU_ID, MENU_NAME, SORT_ID)
 Values
   (4, 'Service Type', 4);   

Insert into MENU
   (MENU_ID, MENU_NAME, SORT_ID)
 Values
   (5, 'Signature', 5);  
   
Insert into MENU
   (MENU_ID, MENU_NAME, SORT_ID)
 Values
   (6, 'Firmware', 6);     
   
Insert into MENU
   (MENU_ID, MENU_NAME, SORT_ID)
 Values
   (7, 'Log Viewer', 7);


Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('LOGIN','com.titan.updserver.login.action.LoginAction');
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('LOGOUT','com.titan.updserver.login.action.LogoutAction');
   

Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('SERVICE_TYPE','com.titan.updserver.servicetype.action.ServiceTypeAction');
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('DEVICE_TYPE','com.titan.updserver.devicetype.action.DeviceTypeAction');
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('LOG_MAN','com.titan.updserver.log.action.LogSearchAction');


Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('ACCOUNT_SEARCH','com.titan.updserver.account.action.AccountAction');
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('ACCOUNT_INSERT','com.titan.updserver.account.action.InsertAction');   
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('ACCOUNT_UPDATE','com.titan.updserver.account.action.UpdateAction'); 
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('ACCOUNT_DELETE','com.titan.updserver.account.action.DeleteAction'); 
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('PRIVILEGE_UPDATE','com.titan.updserver.account.action.PrivilegeUpdateAction');
Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('SCHEDULE_SET','com.titan.updserver.configure.action.ScheduleSet');  

Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('DOWNLOAD_STATUS_REPORT','com.titan.updserver.report.action.DownloadStatusReportAction');   
        
    
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('SERVICE_TYPE', 'ADDNEW', '/jsp/servicetype/service_list.jsp'); 
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('SERVICE_TYPE', 'UPDATE', '/jsp/servicetype/service_list.jsp');
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('SERVICE_TYPE', 'DELETE', '/jsp/servicetype/service_list.jsp');
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('DEVICE_TYPE', 'ADDNEW', '/jsp/devicetype/device_list.jsp'); 
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('DEVICE_TYPE', 'UPDATE', '/jsp/devicetype/device_list.jsp');
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('DEVICE_TYPE', 'DELETE', '/jsp/devicetype/device_list.jsp');
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('LOG_MAN', 'SEARCH', '/jsp/log/log_man.jsp');
   
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('LOGIN', 'LOGIN', '/jsp/index.jsp'); 
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('LOGOUT', 'LOGOUT', '/jsp/login/logout.jsp');       


Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('ACCOUNT_SEARCH', 'ACCOUNT_SEARCH', '/jsp/account/account.jsp?time=time');  
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('ACCOUNT_INSERT', 'ACCOUNT_INSERT', '/jsp/account/account_new_confirm.jsp');  
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('ACCOUNT_UPDATE', 'ACCOUNT_UPDATE', '/jsp/account/account_query_confirm.jsp');
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('ACCOUNT_DELETE', 'ACCOUNT_DELETE', '/jsp/account/account_delete_confirm.jsp');  
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('PRIVILEGE_UPDATE', 'PRIVILEGE_UPDATE', '/jsp/account/privilege_update_confirm.jsp'); 
   
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('DOWNLOAD_STATUS_REPORT', 'REPORT', '/jsp/report/downloadstatus.jsp'); 

Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (1000,'Database eoor','Database error!','reg_back','/','Operation Fail',' ' );
   
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (1001,'Login Fail','Invalid username or password!','reg_back','Login/','Login Fail',' ' );    


Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (2001,'Account Operation Fail','Account Search Error','reg_back','','Account Operation Fail',' ' );    
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (2002,'Account Operation Fail','Account Delete Error','reg_back','','Account Operation Fail',' ' );       
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (2003,'Account Operation Fail','Account Insert Error','reg_back','','Account Operation Fail',' ' );    
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (2004,'Account Operation Fail','Account Update Error','reg_back','','Account Operation Fail',' ' );    
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (2005,'Privilege Operation Fail','Privilege Update Error','reg_back','','Privielge Operation Fail',' ' );     
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (2006,'Account Operation Fail','Duplicate User Name','reg_back','','Account Operation Fail',' ' );    
   
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3001,'Configure Fail','Server Properties Set Fail','reg_back','','Configure Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3002,'Configure Fail','Schedule Set Fail','reg_back','','Configure Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3003,'Configure Fail','Slave Delete Fail','reg_back','','Configure Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3004,'Configure Fail','Slave Insert Fail','reg_back','','Configure Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3005,'Configure Fail','Slave Update Fail','reg_back','','Configure Fail',' ' ); 
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3006,'Configure Fail','Flow Control Setting Fail','reg_back','','Configure Fail',' ' ); 
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3007,'Configure Fail','Download Status Setting Fail','reg_back','','Configure Fail',' ' ); 

Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3010,'Upload Platform Edit Fail','No record is affected','reg_back','','Upload Platform Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3011,'Upload Platform Edit Fail','Upload Platform Create Fail','reg_back','','Upload Platform Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3012,'Upload Platform Edit Fail','Upload Platform Update Fail','reg_back','','Upload Platform Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE1,VALUE2,URL)
Values
   (3013,'Upload Platform Edit Fail','Upload Platform Delete Fail','reg_back','','Upload Platform Edit Fail',' ' );
                

Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4211,'Service Type Edit Fail','Service type already exists','reg_back','Service Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4210,'Service Type Edit Fail','Exception when add a service type','reg_back','Service Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4220,'Service Type Edit Fail','Exception when update a service type','reg_back','Service Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4230,'Service Type Edit Fail','Exception when delete a service type','reg_back','Service Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4221,'Service Type Edit Fail','Service type has been used in signature table','back','Service Type Edit Fail','jsp/servicetype/service_list.jsp' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4111,'Device Type Edit Fail','Device type already exists','reg_back','Device Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4110,'Device Type Edit Fail','Exception when add a device type','reg_back','Device Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4120,'Device Type Edit Fail','Exception when update a device type','reg_back','Device Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4130,'Device Type Edit Fail','Exception when delete a device type','reg_back','Device Type Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (4121,'Device Type Edit Fail','Device type has been used in signature table','back','Device Type Edit Fail','jsp/devicetype/device_list.jsp' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (3910,'Mail List Edit Fail','Exception when add a mail record','reg_back','Mail List Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (3920,'Mail List Edit Fail','Exception when update a mail record','reg_back','Mail List Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (3930,'Mail List Edit Fail','Exception when delete a mail record','reg_back','Mail List Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (3911,'Mail List Edit Fail','Mail address already exists','reg_back','Mail List Edit Fail',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (6210,'Too Many Logs To Display','Too many logs (>1000) match the query condition, please further specify the filter parameters, shorten the query scope.','reg_back','Too Many Logs To Display',' ' );
Insert into MESSAGE
   (CODE,TYPE,EXPLAN,ACTION,VALUE2,URL)
Values
   (6110,'Log Delete Fail','Exception when delete logs','reg_back','Log Delete Fail',' ' );


Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (1, 1, 'Account', '/jsp/account/account.jsp',11,'MS');  
   
Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (2, 1, 'Privilege', '/jsp/account/privilege.jsp',12,'MS');

Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (7, 3, 'Device', '/jsp/devicetype/device_list.jsp',31,'MS');     
   
Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (8, 4, 'Service', '/jsp/servicetype/service_list.jsp',41,'MS');   
   
Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (9, 5, 'Signature', '/jsp/signature/signature_list.jsp',51,'MS');  

Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (10, 6, 'Firmware', '/jsp/firmware/firmware_list.jsp',61,'MS');  
   
Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (11, 6, 'Firmware Upload', '/jsp/firmware/firmware_upload.jsp',62,'MS');     

Insert into FUNCTION
   (FUNCTION_ID, MENU_ID, FUNCTION_NAME, URL, SORT_ID,MASTER_SLAVE)
 Values
   (12, 7, 'Log Viewer', '/jsp/log/log_man.jsp',71,'MS'); 
      
commit;


Insert into GROUP_NAME
   (GROUP_ID, GROUP_NAME)
 Values
   (1, 'ADMIN');  
             
commit;


Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (1,1,1,1);    

Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (2,2,1,1);
   
Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (7,7,3,1);
   
Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (8,8,4,1);  
   
Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (9,9,5,1);  
   
Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (10,10,6,1); 
   
Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (27,23,5,1);  
   
Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (28,24,5,1); 

Insert into FUNCTION2GROUP_NAME
   (MAPPING_ID, FUNCTION_ID,MENU_ID,GROUP_ID)
 Values
   (12,12,7,1);
                                  
commit;


Insert into ACCOUNT
   (GROUP_ID,USERNAME,PASSWORD,EMAIL,CREATE_BY)
 Values
   (1,'admin','123456','jacky.gu@titan-arc.com','DEFAULT');  
                                  
commit;


Insert into SEQUENCE_ID
   (NAME, NEXTID)
 Values
   ('FUNCTION2GROUP_NAME',13);    
   
Insert into SEQUENCE_ID
   (NAME, NEXTID)
 Values
   ('ACCOUNT',2);

Insert into SEQUENCE_ID
   (NAME, NEXTID)
 Values
   ('SIGNATURE',1);   


Insert into SCHEDULE
   (SCHEDULE_ID,HOUR,MINUTE,FLAG)
 Values
   (1,0,0,'Y');
   
Insert into DEVICE_TYPE (DEVICE) values('UTM');

Insert into SERVICE_TYPE (SERVICE) values('AV');
Insert into SERVICE_TYPE (SERVICE) values('IDP');
   
commit;

Insert into ACTION
   (ACTION_NAME,ACTION_VALUE)
 Values
   ('SIGNATURE','com.titan.updserver.signature.action.SignatureAction'); 

Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('SIGNATURE', 'ADDNEW', '/jsp/signature/signature_new_execute.jsp'); 
   
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('SIGNATURE', 'UPDATE', '/jsp/signature/signature_edit_execute.jsp'); 
      
Insert into ACTION_RESULT
   (ACTION_NAME, RESULT_NAME, RESULT_VALUE)
 Values
   ('SIGNATURE', 'DELETE', '/jsp/signature/signature_edit_execute.jsp'); 
      
commit;   

   
commit;

                                  