package com.titan.controller.exception;


public class FrameworkRuntimeException extends RuntimeException
{

   public FrameworkRuntimeException(){
      super();
   }

   public FrameworkRuntimeException(String err){
      super(err);
   }
}