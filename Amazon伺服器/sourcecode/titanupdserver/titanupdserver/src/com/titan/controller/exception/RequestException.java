package com.titan.controller.exception;

public class RequestException extends Exception
{

   public RequestException(){
      super();
   }

   public RequestException(String err){
      super(err);
   }
}
