package com.titan.mytitan.login.bean;
public class EncodeJavaBean{
public static String encode(String str){

			 String str2 = "";

			 int len = str.length();

			 int value = 0;

             

			 for(int i=0; i < len ; i++){

					char character = str.charAt(i);

 

				  if(character >96 && character <123){

						value = (character > 119) ? -40 : 3;

					  }

					  else if(character >47 && character <58){

						value = (character > 54) ? 11 : 3;

					  }

					  else if(character == 45 ) value = 30;

					  else if(character == 46) value = 30;

					  else if(character == 64) value = 1;

					  else if(character == 95) value = -5;

                      

					  character += value;

					  str2 = str2 + character;

					  //System.out.println(str2);

				  }

			 return str2;

			 }

}