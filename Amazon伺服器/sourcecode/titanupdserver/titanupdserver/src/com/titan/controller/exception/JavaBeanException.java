package com.titan.controller.exception;

public class JavaBeanException extends Exception
{

   public JavaBeanException(){
      super();
   }

   public JavaBeanException(String err){
      super(err);
   }
}