package com.titan.controller.exception;


public class FlowManageException extends Exception
{

   public FlowManageException(){
      super();
   }

   public FlowManageException(String err){
      super(err);
   }
}