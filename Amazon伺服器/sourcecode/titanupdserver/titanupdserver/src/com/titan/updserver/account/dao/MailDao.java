package com.titan.updserver.account.dao;

//import java.math.BigDecimal;
import java.util.*;
import com.titan.jdbc.DAOHelper;


public class MailDao {

  //get mail list information
  public Collection getMailListInfo() {

	return DAOHelper.queryQuietly("select EMAIL from ACCOUNT ");
  }
}