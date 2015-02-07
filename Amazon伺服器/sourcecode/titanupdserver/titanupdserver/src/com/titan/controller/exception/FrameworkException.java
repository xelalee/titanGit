package com.titan.controller.exception;

public class FrameworkException extends Exception
{

   public FrameworkException(){
      super();
   }

   public FrameworkException(String err){
      super(err);
   }
}