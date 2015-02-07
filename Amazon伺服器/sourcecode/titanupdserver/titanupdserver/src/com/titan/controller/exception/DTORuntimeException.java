package com.titan.controller.exception;


public class DTORuntimeException extends RuntimeException
{

   public DTORuntimeException(){
      super();
   }

   public DTORuntimeException(String err){
      super(err);
   }
}