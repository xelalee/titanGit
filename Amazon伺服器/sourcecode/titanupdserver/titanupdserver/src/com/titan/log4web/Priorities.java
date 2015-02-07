package com.titan.log4web;

public class Priorities
{

    public static Priorities Instance()
    {
        return _instance;
    }

    private Priorities()
    {
    }

    public String[] getPriorities()
    {
        return _priority_array;
    }

    private static final String _priority_array[] = {
        "DEBUG", "INFO", "WARN", "ERROR", "FATAL"
    };
    public static final String DEBUG = "DEBUG";
    public static final String INFO = "INFO";
    public static final String WARN = "WARN";
    public static final String ERROR = "ERROR";
    public static final String FATAL = "FATAL";
    private static Priorities _instance = new Priorities();

}
