package com.titan.controller.exception;

import com.titan.controller.exception.RequestException;

public class RequestManageException
    extends RequestException {
  public RequestManageException() {
    super();
  }

  public RequestManageException(String err) {
    super(err);
  }

}