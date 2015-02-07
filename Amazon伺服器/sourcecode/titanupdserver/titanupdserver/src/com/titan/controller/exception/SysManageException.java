package com.titan.controller.exception;

public class SysManageException extends Exception
{

   public SysManageException(){
      super();
   }

   public SysManageException(String err){
      super(err);
   }
}