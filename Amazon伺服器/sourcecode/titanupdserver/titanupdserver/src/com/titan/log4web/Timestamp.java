package com.titan.log4web;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Timestamp
{

    Timestamp(int day, int month, int year, int hour, int min)
    {
        _formatter = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        this.day = day;
        this.month = month;
        this.year = year;
        this.hour = hour;
        this.minute = min;
        updateDate();
    }

    Timestamp(int day, int month, int year)
    {
        _formatter = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        this.day = day;
        this.month = month;
        this.year = year;
        hour = 0;
        minute = 0;
        updateDate();
    }

    void set(String DD[], String MM[], String YYYY[], String HH[], String mm[])
    {
        try
        {
            if(DD != null)
                day = Integer.parseInt(DD[0]);
            if(MM != null)
                month = Integer.parseInt(MM[0]);
            if(YYYY != null)
                year = Integer.parseInt(YYYY[0]);
            if(HH != null)
                hour = Integer.parseInt(HH[0]);
            if(mm != null)
                minute = Integer.parseInt(mm[0]);
            updateDate();
        }
        catch(Exception exception) { }
    }

    private void updateDate()
    {
        try
        {
            Date temp_date = _formatter.parse(new StringBuffer("").append(year).append("/").append(month).append("/").append(day).append(" ").append(hour).append(":").append(minute).append(":00").toString());
            if(temp_date != null)
                _date = temp_date;
        }
        catch(Exception exception) { }
    }

    public int getDay()
    {
        return day;
    }

    public int getMonth()
    {
        return month;
    }

    public int getYear()
    {
        return year;
    }

    public int getHour()
    {
        return hour;
    }

    public int getMinute()
    {
        return minute;
    }

    public Date getDate()
    {
        return _date;
    }

    public static int[] getDays()
    {
        return _days;
    }

    public static int[] getMonths()
    {
        return _months;
    }

    public static int[] getYears()
    {
        return _years;
    }

    public static int[] getHours()
    {
        return _hours;
    }

    public static int[] getMinutes()
    {
        return _minutes;
    }

    public static String getMonthName(int index)
    {
        return _month_names[index];
    }

    public static String getHourName(int index)
    {
        return _hour_names[index];
    }

    public static String getMinuteName(int index)
    {
        return _minute_names[index];
    }

    private Date _date;
    private int day;
    private int month;
    private int year;
    private int hour;
    private int minute;
    private static final int _days[] = {
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
        31
    };
    private static final int _months[] = {
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
        11, 12
    };
    private static final String _month_names[] = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", 
        "Nov", "Dec"
    };
    private static final int _years[] = {
        2005, 2006, 2007, 2008, 2009, 
        2010, 2011, 2012, 2013, 2014, 2015
    };
    private static final int _hours[] = {
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 
        20, 21, 22, 23
    };
    public static final String _hour_names[] = {
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", 
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", 
        "20", "21", "22", "23"
    };
    private static final int _minutes[] = {
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 
        50, 51, 52, 53, 54, 55, 56, 57, 58, 59
    };
    private static final String _minute_names[] = {
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", 
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", 
        "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", 
        "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", 
        "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", 
        "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"
    };
    public static final int EARLIEST_DAY = 1;
    public static final int EARLIEST_MONTH = 1;
    public static final int EARLIEST_YEAR = 2005;
    public static final int LATEST_DAY = 31;
    public static final int LATEST_MONTH = 12;
    public static final int LATEST_YEAR = 2015;
    private DateFormat _formatter;

}
