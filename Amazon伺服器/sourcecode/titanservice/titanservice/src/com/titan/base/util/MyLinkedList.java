package com.titan.base.util;

import java.util.LinkedList;

public class MyLinkedList extends LinkedList {
	
	public MyLinkedList(){
		super();
	}
	
	public void moveUp(int index){
		if(index>0 && index<this.size()){
			this.swap(index, index-1);
		}
	}
	
	public void moveDown(int index){
		if(index<(this.size()-1)){
			this.swap(index, index+1);
		}		
	}	
	
	private void swap(int index1, int index2){
		Object x = this.get(index1);
		Object y = this.get(index2);
		
		this.set(index2,x);
		this.set(index1, y);		
	}

}
