
$(document).ready(function(){
	
	var BillHeight = $('.billboard').height() / 4;

	$(window).scroll(function(){
		if ($(window).scrollTop() < BillHeight) {
	    	$( "header.fixed_nav" ).stop().animate({marginTop : '-81px'}, 200);
			 
	    } else {
	    	$( "header.fixed_nav" ).stop().animate({marginTop : 0}, 200);
	    }

	});
});

function HeyAlert(message){
	document.getElementById('alertmessage').value=message;

}

function contactUs(){
	var fname=document.getElementById("fname").value;
	var lname=document.getElementById("lname").value;
	var email=document.getElementById("email").value;
	var number=document.getElementById("number").value;
	if(document.getElementById('gMale').checked) {
		var gender="male";
	}else if(document.getElementById('gFemale').checked) {
		var gender="female";
	}
	
	if(fname.length<1||lname.length<1){
		alert("Name cant be null!");

	}
	else if(!email.endsWith("click-labs.com")){
		alert("Invalid Email Address!");

	}
	else if(number.length!=10){
		alert("Invalid Number");
	}
	else{
		document.forms['myForm'].submit();
	}
}

function numberCheck(){
	var number=document.getElementById("number").value;
	var last=number.charAt(number.length-1);
	console.log(last);
	if(last=='0'||last=='1'||last=='2'||last=='3'||last=='4'||last=='5'||last=='6'||last=='7'||last=='8'||last=='9'||last==''){

	}
	else{
		document.getElementById("number").value=number.substr(0,number.length-1);
	}

	if(number.length>10){
		document.getElementById("number").value=number.substr(0,10);
	}
}