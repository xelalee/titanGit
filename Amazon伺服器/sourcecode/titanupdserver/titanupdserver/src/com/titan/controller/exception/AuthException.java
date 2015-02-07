package com.titan.controller.exception;


public class AuthException extends Exception
{

   public AuthException(){
      super();
   }

   public AuthException(String err){
      super(err);
   }
}