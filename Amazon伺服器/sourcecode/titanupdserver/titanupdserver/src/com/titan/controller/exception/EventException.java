package com.titan.controller.exception;


public class EventException extends Exception
{

   public EventException(){
      super();
   }

   public EventException(String err){
      super(err);
   }
}