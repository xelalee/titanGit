package com.titan.controller.exception;


public class ActionManageException extends Exception
{

   public ActionManageException(){
      super();
   }

   public ActionManageException(String err){
      super(err);
   }
}