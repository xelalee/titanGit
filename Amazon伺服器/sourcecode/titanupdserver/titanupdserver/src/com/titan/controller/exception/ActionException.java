package com.titan.controller.exception;


public class ActionException extends Exception
{

   public ActionException(){
      super();
   }

   public ActionException(String err) {
      super(err);
   }
}