

package com.titan.util;

import java.util.*;


public class StringLib
{
    /**
     * Replaces all occurrence of a specified character in a string with
     * a specified string.
     *
     * @param oldStr     the string to be processed.
     * @param ch         the character to be replaced.
     * @param replaceStr the string that replaces the to-be-replaced
     *                   character.
     *
     * @return           a new string that is derived from <code>oldStr</code>
     *                   by replacing every occurrence of <code>ch</code>
     *                   with <code>replaceStr</code>; <code>oldStr</code>
     *                   if <code>ch</code> does not occur in
     *                   <code>oldStr</code>.
     */
    static public String replaceChar(String oldStr, char ch, String replaceStr)
    {
    	if (oldStr == null || oldStr.length() == 0 ||
    	    replaceStr == null || replaceStr.length() == 0) return oldStr;

    	char b[]  = new char[oldStr.length()];
    	oldStr.getChars(0, oldStr.length(), b, 0);

        char b2[] = new char[replaceStr.length()];
        replaceStr.getChars(0, replaceStr.length(), b2, 0);

        char buffer[] = new char[0];

        boolean found = false;
        int idx = -1, offset=0;;
        for (int i=0; i<b.length; i++) {
            if (b[i] == ch) {
            	if (!found) found = true;
                int size = (i-offset);
                char bb[] = new char[buffer.length + size + b2.length];
	        System.arraycopy(buffer, 0, bb, 0, buffer.length);
	        System.arraycopy(b, offset, bb, buffer.length, size);
	        System.arraycopy(b2, 0, bb, buffer.length + size, b2.length);
	        buffer = bb;
	        offset = i+1;
            }
        }

        if (!found) return oldStr;

        if (offset < b.length) {
            int size = (b.length-offset);
            char bb[] = new char[buffer.length + size];
            System.arraycopy(buffer, 0, bb, 0, buffer.length);
            System.arraycopy(b, offset, bb, buffer.length, size);
	    buffer = bb;
        }

        return new String(buffer);
    }


    /**
     * Replaces all occurrence of a specified string in a string with another
     * specified string.
     *
     * @param oldStr     the string to be processed.
     * @param str        the string to be replaced.
     * @param replaceStr the string that replaces the to-be-replaced string.
     *
     * @return           a new string that is derived from <code>oldStr</code>
     *                   by replacing every occurrence of <code>str</code>
     *                   with <code>replaceStr</code>; <code>oldStr</code>
     *                   if <code>str</code> does not occur in
     *                   <code>oldStr</code>.
     */
    static public String replaceString(String oldStr, String str, String replaceStr)
    {
    	if (oldStr == null || oldStr.length() == 0 || str == null || str.length() == 0 ||
    	    replaceStr == null || replaceStr.length() == 0) return oldStr;

    	int fromIndex=0, idx, len=str.length();
    	StringBuffer sb = new StringBuffer();
    	boolean found = false;
    	while ((idx = oldStr.indexOf(str, fromIndex)) != -1) {
            if (!found) found = true;
            sb.append(oldStr.substring(fromIndex, idx));
            sb.append(replaceStr);
    	    fromIndex = idx + len;
    	}
    	if (!found) return oldStr;

    	if (fromIndex < oldStr.length()) {
    	    sb.append(oldStr.substring(fromIndex));
    	}

    	return sb.toString();
    }


    static public int ignoreCaseIndexOf(String searchStr, String str)
    {
         return ignoreCaseIndexOf(searchStr, str, 0);
    }


    static public int ignoreCaseIndexOf(String searchStr, String str, int fromIndex0)
    {
    	int fromIndex = fromIndex0;
    	if (searchStr == null || searchStr.length() == 0 || str == null || str.length() == 0) return -1;

    	int len=searchStr.length(), len2 = str.length();

    	if (fromIndex < 0) fromIndex = 0;
	    else if (fromIndex >= len) return -1;

        char strLower[] = new char[len2];
        str.toLowerCase(Keys.DEFAULT_LOCALE).getChars(0, len2, strLower, 0);

        char strUpper[] = new char[len2];
        str.toUpperCase(Keys.DEFAULT_LOCALE).getChars(0, len2, strUpper, 0);

    	char ch;
    	int matchCount = 0;
    	for (int i=fromIndex; i<len; i++) {
    	    ch = searchStr.charAt(i);

    	    if (strLower[matchCount] == ch || strUpper[matchCount] == ch) {
                matchCount++;
                if (matchCount == len2) {
                    return (i-matchCount+1);
                }
            }
            else {
                if (matchCount > 0) matchCount = 0;  // reset
            }
        }
        return -1;
    }

    static public int ignoreCaseIndexOfWithDelimiter(String searchStr, String str, char delimiter[])
    {
         return ignoreCaseIndexOfWithDelimiter(searchStr, str, 0, delimiter);
    }

    static public int ignoreCaseIndexOfWithDelimiter(String searchStr, String str, int fromIndex0, char delimiter[])
    {
    	int fromIndex = fromIndex0;
    	if (searchStr == null || searchStr.length() == 0 || str == null || str.length() == 0) return -1;
    	if (delimiter == null || delimiter.length == 0) return -1;

    	int len=searchStr.length(), len2 = str.length();

    	if (fromIndex < 0) fromIndex = 0;
	    else if (fromIndex >= len) return -1;

        char strLower[] = new char[len2];
        str.toLowerCase(Keys.DEFAULT_LOCALE).getChars(0, len2, strLower, 0);

        char strUpper[] = new char[len2];
        str.toUpperCase(Keys.DEFAULT_LOCALE).getChars(0, len2, strUpper, 0);

    	char ch, chNext;
    	int matchCount = 0;
    	for (int i=fromIndex; i<len; i++) {
    	    ch = searchStr.charAt(i);

    	    if (strLower[matchCount] == ch || strUpper[matchCount] == ch) {
                matchCount++;
                if (matchCount == len2) {
                    if (i+1 < len) { // nexr char
                       chNext = searchStr.charAt(i+1);
                       for (int j=0; j<delimiter.length; j++) {
                          if (chNext == delimiter[j]) {
                              return (i-matchCount+1); // match
                          }
                       }
                       if (matchCount > 0) matchCount = 0;  // reset
                    }
                    else { // end
                        return (i-matchCount+1); // match
                    }
                }
            }
            else {
                if (matchCount > 0) matchCount = 0;  // reset
            }
        }
        return -1;
    }

    static public boolean ignoreCaseStartsWith(String searchStr, String str)
    {
        return ignoreCaseStartsWith(searchStr, str, 0);
    }


    static public boolean ignoreCaseStartsWith(String searchStr, String str, int fromIndex0)
    {
    	int fromIndex = fromIndex0;
    	if (searchStr == null || searchStr.length() == 0 || str == null || str.length() == 0) return false;

    	int len=searchStr.length(), len2 = str.length();

    	if (fromIndex < 0) fromIndex = 0;
	    else if (fromIndex >= len) return false;

        char strLower[] = new char[len2];
        str.toLowerCase(Keys.DEFAULT_LOCALE).getChars(0, len2, strLower, 0);

        char strUpper[] = new char[len2];
        str.toUpperCase(Keys.DEFAULT_LOCALE).getChars(0, len2, strUpper, 0);

    	char ch;
    	int count=0;
    	for (int i=fromIndex, j=0; i<len && j<len2; i++, j++) {
    	    ch = searchStr.charAt(i);
    	    if (strLower[j] != ch && strUpper[j] != ch) return false;
    	    count++;
        }

        if (count == len2) return true;
        else return false;
    }

        static public String deleteChar(String oldStr, char ch)
    {
        if (oldStr == null || oldStr.length() == 0) return oldStr;

        int len = oldStr.length();
        StringBuffer sb = new StringBuffer(len);
    	char c;
    	for (int i=0; i<len; i++) {
    	    c = oldStr.charAt(i);
    	    if (c != ch) sb.append(c);
    	}
    	return sb.toString();
     }

    static public String[] ignoreCaseStringTokenizer(String searchStr, String str)
    {
        if (searchStr == null || searchStr.length() == 0 || str == null || str.length() == 0) return (new String[0]);

        int fromIndex = 0, idx, len = searchStr.length(), len2 = str.length();
        Vector strs = new Vector();
        while ((idx=ignoreCaseIndexOf(searchStr, str, fromIndex)) != -1) {
            strs.add(searchStr.substring(fromIndex, idx));
            fromIndex = idx + len2;
            if (fromIndex >= len) break;
        }

        if (fromIndex < len) {
            strs.add(searchStr.substring(fromIndex, len));
        }

        String strArray[] = new String[strs.size()];
    	strArray = (String [])strs.toArray(strArray);
        return strArray;
    }

    static public String[] ignoreCaseStringTokenizer(String searchStr, char delimiter[])
    {
        if (searchStr == null || searchStr.length() == 0 || delimiter == null || delimiter.length == 0) return (new String[0]);

        StringBuffer sb = new StringBuffer(delimiter.length);
        char ch;
        for (int i=0; i<delimiter.length; i++) {
            ch = Character.toUpperCase(delimiter[i]);
            if (ch == delimiter[i]) sb.append(delimiter[i]);
            else sb.append(delimiter[i]).append(ch);
        }

        StringTokenizer st = new StringTokenizer(searchStr, sb.toString());
        Vector strs = new Vector();
        while (st.hasMoreTokens()) {
             strs.add(st.nextToken());
        }

        String strArray[] = new String[strs.size()];
    	strArray = (String [])strs.toArray(strArray);
        return strArray;
    }

    //=================================================================
    /**
     * Unlimited add/decrease value, only support positive number.
     */
    static public String unlimitedNumberAddDec(String s0, int value) throws NumberFormatException
    {
    	String s = s0;
		// (1)
	    boolean negative = false;
	    int i=0, digit;
		if (s.charAt(0) == '-') {
		    i++;
		    negative = true;
		}
		for (int j=i; j<s.length(); j++) { // check
		     digit = Character.digit(s.charAt(j), 10);
		     if (digit < 0) {  // if the value of ch is not a valid digit in the specified radix, -1 is returned.
		         throw new NumberFormatException(s);
		     }
		}

		// (2)
		boolean negative2 = false;
		if (value == 0) return s;
		if (value < 0) negative2 = true;
	    String s2 = Integer.toString(value);

	    // (3), (+) + (+)
	    if (!negative && !negative2) {
	        if (s2.length() > s.length()) { // swap
	           String temp = s;
	           s = s2;
	           s2 = temp;
	        }
	        StringBuffer buf = new StringBuffer(s.length()+1); // 1 for carry.
	        int carry = 0, result;
            int idx, idx2;
	        for (int k=0; k<s.length(); k++) {
                idx = (s.length()-1) - k;
                idx2 = (s2.length()-1) - k;
                //Debug.log("[" + k + "]=" + s.charAt(idx));

	            if (idx2 >= 0) result = Character.digit(s.charAt(idx), 10) + Character.digit(s2.charAt(idx2), 10) + carry;
	            else result = Character.digit(s.charAt(idx), 10) + carry;
	            carry = 0; // reset
	            if (result > 9) {
	                carry = 1;
	                result -= 10;
	            }
	            buf.append(result);
	        }

	        if (carry == 1) {
                buf.append(carry);
	        }
            buf = buf.reverse();
	        return buf.toString();
	    }
	    else {
            throw new NumberFormatException("Only support positive numbers");
        }
	 }
    
    /**
     * get the sub string following the char lastly showed
     * example:getSubStrFollowLastChar(".abcd.efg.hij.bc",'.')="bc"
     * @param str
     * @param ch
     * @return
     */
    public static String getSubStrFollowLastChar(String str,char ch)
    {
        int i=0,count=0;
        String rst="";
        for (i = 0; i < str.length(); i++)
        {
            char c = str.charAt(i);       
            if (c == ch)
            {
                 count++;
                 rst="";
            }
            else if(count >= 1) rst=rst+c;
        }
        return rst;
    }
    

}

