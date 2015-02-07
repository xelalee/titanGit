package com.titan.register.product;

import com.titan.register.controller.CommonResponse;

public class ProductResponse extends CommonResponse {
	public ProductResponse(){
		super();
	}
	
	public ProductResponse(String errorKey){
		super(errorKey);
	}

}
