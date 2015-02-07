package com.titan.controller.exception;

public class EJBActionException extends Exception
{

   public EJBActionException(){
      super();
   }

   public EJBActionException(String err){
      super(err);
   }
}