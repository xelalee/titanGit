package com.titan.log4web;

//import java.util.Date;
import java.util.Map;
import java.util.Date;
import java.util.Calendar;

public class SelectionCriteria
{	

    public SelectionCriteria()
    {
    	this.reset();
    }

    public final void reset() {
    	
		_logger = "ALL";
		_message_contain = "";
		_priority = "INFO";
		Date currentDate = new Date();
		Calendar cal = Calendar.getInstance();
		cal.setTime(currentDate);
		cal.add(Calendar.DATE, +1);
		_end_time = new Timestamp(cal.get(Calendar.DAY_OF_MONTH), cal.get(Calendar.MONTH)+1, cal.get(Calendar.YEAR));
		cal.add(Calendar.DATE, -8);
		_start_time = new Timestamp(cal.get(Calendar.DAY_OF_MONTH), cal.get(Calendar.MONTH)+1, cal.get(Calendar.YEAR));
    	
    }
    
    public SelectionCriteria(Map initial_values)
    {
        updateParameters(initial_values);
    }
    
    public final void updateParameters(Map initial_values)
    {   
        String temp[] = (String[])initial_values.get("Logger");
        if(temp != null)
            _logger = temp[0];
		temp = (String[])initial_values.get("MessageContain");
		if(temp != null)
			_message_contain = temp[0];
		temp = (String[])initial_values.get("Priority");
		if(temp != null)
			_priority = temp[0];
        
        _start_time.set((String[])initial_values.get("StartTimeDD"), (String[])initial_values.get("StartTimeMM"), (String[])initial_values.get("StartTimeYYYY"), (String[])initial_values.get("StartTimeHH"), (String[])initial_values.get("StartTimemm"));
        _end_time.set((String[])initial_values.get("EndTimeDD"), (String[])initial_values.get("EndTimeMM"), (String[])initial_values.get("EndTimeYYYY"), (String[])initial_values.get("EndTimeHH"), (String[])initial_values.get("EndTimemm"));
    }

    public String getLogger()
    {
        return _logger;
    }
    
	public String getMessageContain()
	{
		return _message_contain;
	}
	public String getPriority()
	{
		return _priority;
	}

    public Timestamp getStartTime()
    {
        return _start_time;
    }

    public Timestamp getEndTime()
    {
        return _end_time;
    }

    public boolean isLogger()
    {
        return !"ALL".equalsIgnoreCase(_logger);
    }
    
	public boolean isMessageContain()
	{
		return !"".equals(_message_contain.trim());
	}
    

    private String _logger;
    private String _message_contain;
    private String _priority;
    private Timestamp _start_time;
    private Timestamp _end_time;
}
