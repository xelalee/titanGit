package com.titan.controller.dao;



import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

import com.titan.util.Keys;
import com.titan.exception.JavaBeanException;
import com.titan.jdbc.DAOHelper;


public class ActionDao implements Serializable
{

    public ActionDao()
    {
    }

    public Collection getAllAction()throws JavaBeanException
    {
        try
        {
            String sql = "select * from ACTION";
            Collection actions = DAOHelper.queryQuietly(sql);
            return actions;
        }
        catch (Exception ex)
        {
            throw new JavaBeanException("QueryHelperException while getting all action"+
                                        ex.getMessage());
        }
    }

    public Collection getAllRestult()throws JavaBeanException
    {
        try
        {
            String sql = "select * from ACTION_RESULT";
            Collection actions = DAOHelper.queryQuietly(sql);
            return actions;
        }
        catch (Exception ex)
        {
            throw new JavaBeanException("QueryHelperException while getting all rsult"+
                                        ex.getMessage());
        }
    }

    public Collection getActionByActionName(String actionName) throws JavaBeanException
    {
        try
        {
            String sql = "select * from ACTION where ACTION_NAME='"+actionName+"'";
            Collection actions = DAOHelper.queryQuietly(sql);
            return actions;
        }
        catch (Exception ex)
        {
            throw new JavaBeanException("QueryHelperException while getting sequence"+
                                        ex.getMessage());
        }
    }

    public Collection getResultByActionName(String actionName) throws JavaBeanException
    {
        try
        {
            String sql = "select * from ACTION_RESULT where ACTION_NAME='"+actionName+"'";
            Collection actions = DAOHelper.queryQuietly(sql);
            return actions;
        }
        catch (Exception ex)
        {
            throw new JavaBeanException("QueryHelperException while getting sequence"+
                                        ex.getMessage());
        }
    }



    public boolean existActionByActionName(String actionName) throws JavaBeanException
    {
        Collection existAction = getActionByActionName(actionName);
        if (existAction.size() > 0)
           return true;
        else
           return false;
    }
}
