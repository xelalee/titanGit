package com.titan.controller.exception;

public class ServiceLocatorException extends Exception{
  public ServiceLocatorException(){
      super();
   }

   public ServiceLocatorException(String err) {
      super(err);
   }


}