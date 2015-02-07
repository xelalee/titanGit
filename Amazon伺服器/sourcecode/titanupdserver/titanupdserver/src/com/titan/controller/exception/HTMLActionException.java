package com.titan.controller.exception;

public class HTMLActionException extends Exception
{

   public HTMLActionException(){
      super();
   }

   public HTMLActionException(String err){
      super(err);
   }
}