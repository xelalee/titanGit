package com.titan.base.util;

import java.security.Security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;


public class PasswordCoder {

	private static String Algorithm = "DES"; // DES,DESede,Blowfish

	private final static byte[] KEY = "TiTatW05".getBytes();


	static {
		Security.addProvider(new com.sun.crypto.provider.SunJCE());
	}

	// get encrypt key
	private static byte[] getKey() throws Exception {
		KeyGenerator keygen = KeyGenerator.getInstance(Algorithm);
		SecretKey deskey = keygen.generateKey();
		return deskey.getEncoded();
	}

	// encode
	private static byte[] encode(byte[] input, byte[] key) throws Exception {
		SecretKey deskey = new javax.crypto.spec.SecretKeySpec(key, Algorithm);

		Cipher c1 = Cipher.getInstance(Algorithm);
		c1.init(Cipher.ENCRYPT_MODE, deskey);
		byte[] cipherByte = c1.doFinal(input);

		return cipherByte;
	}

	// decode
	private static byte[] decode(byte[] input, byte[] key) throws Exception {
		SecretKey deskey = new javax.crypto.spec.SecretKeySpec(key, Algorithm);

		Cipher c1 = Cipher.getInstance(Algorithm);
		c1.init(Cipher.DECRYPT_MODE, deskey);
		byte[] clearByte = c1.doFinal(input);

		return clearByte;
	}

	private static String byte2hex(byte[] b) {
		int len = b.length;
		if (len == 0) {
			return "";
		}
		StringBuffer buffer = new StringBuffer(len * 2);
		String stmp = "";

		for (int i = 0; i < len; i++) {
			stmp = (java.lang.Integer.toHexString(b[i] & 0XFF));
			if (stmp.length() == 1) {
				buffer.append("0" + stmp);
			} else {
				buffer.append(stmp);
			}
		}
		return buffer.toString().toUpperCase();
	}

	private static byte[] hex2byte(String hex) {
		int len = hex.length() / 2;
		byte[] bs = new byte[len];
		for (int i = 0; i < len; i++) {
			bs[i] = Integer.valueOf(hex.substring(2 * i, 2 * i + 2), 16)
					.byteValue();
		}
		return bs;
	}

	public static String encode(String str){
		// mix
		byte[] bs = mix(str);
		// en
		byte[] en = null;
		try {
			en = encode(bs, KEY);
		} catch (Exception e) {
			e.printStackTrace();
		}
		// byte2hex
		return byte2hex(en);
	}

	public static String decode(String str){
		// hex2byte
		byte[] bs = hex2byte(str);
		// de
		byte[] de = null;
		try {
			de = decode(bs, KEY);
		} catch (Exception e) {
			e.printStackTrace();
		}
		// re-mix
		return remix(de);
	}

	private static byte[] mix(String xx) {
		int len = xx.length();
		int half_len = len / 2;
		String part1 = xx.substring(0, half_len);
		String part2 = xx.substring(half_len);
		return (part2+part1).getBytes();
	}

	private static String remix(byte[] bs) {
		String temp = new String(bs);
		int len = temp.length();
		int divid = len / 2;
		if(len%2==1){
			divid = divid + 1;
		}
		String part1 = temp.substring(0, divid);
		String part2 = temp.substring(divid);
		return part2+part1;
	}

	public static void main(String[] args) throws Exception {
		String src;
		String en;
		String de;

		src = "123456789012345678901234567890";
		en = encode(src);
		de = decode(en);
		System.out.println("src:" + src + " en:" + en + " de:" + de);
		src = "1";
		en = encode(src);
		de = decode(en);
		System.out.println("src:" + src + " en:" + en + " de:" + de);
		src = "209dCDWW";
		en = encode(src);
		de = decode(en);
		System.out.println("src:" + src + " en:" + en + " de:" + de);
		src = "12345";
		en = encode(src);
		de = decode(en);
		System.out.println("src:" + src + " en:" + en + " de:" + de);
		src = "123456";
		en = encode(src);
		de = decode(en);
		System.out.println("src:" + src + " en:" + en + " de:" + de);
		src = "_!@#%$#$^%^&^&(*&)&*(";
		en = encode(src);
		de = decode(en);
		System.out.println("src:" + src + " en:" + en + " de:" + de);
		
		en = "35E872B4BB5CFC20";
		de = decode(en);
		
		System.out.println(" en:" + en + " de:" + de);

	}

}
