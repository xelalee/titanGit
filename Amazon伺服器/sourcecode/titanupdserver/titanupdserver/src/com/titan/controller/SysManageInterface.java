package com.titan.controller;

import com.titan.controller.exception.SysManageException;

public interface SysManageInterface extends ServletContextInterface
{
   public void init() throws SysManageException;
}