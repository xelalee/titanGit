package com.titan.controller;

import com.titan.controller.exception.SysManageException;

public interface SysInterface extends ServletContextInterface {
  public void init() throws SysManageException;
}