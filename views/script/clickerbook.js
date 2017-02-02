console.log("token");
var token = localStorage.getItem("token");
console.log(token);
$( document ).ready(function() {
	console.log("token");
	var token = localStorage.getItem("token");
	console.log(token);
	if(token!=""||token!=null){
		//window.close();
		$.post("/access_token",{token:token});
	}
});

function loginButton(){
	var email=document.getElementById("email").value;
	var password=document.getElementById("password").value;
	
	if(!email.endsWith(".com")){
		alert("Invalid Email Address!");
	}
	else if(password.length<8){
		alert("Password should be greater than 8 characters!")
	}
	else{
			document.forms["login_form"].submit();
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

function signUp(){
	var fname=document.getElementById("firstName").value;
	var lname=document.getElementById("lastName").value;
	var email=document.getElementById("emailAddress").value;
	var password1=document.getElementById("password1").value;
	var password2=document.getElementById("password2").value;
	if(document.getElementById('male').checked) {
		var gender="male";
	}else if(document.getElementById('female').checked) {
		var gender="female";
	}

	if(fname.length<1||lname.length<1){
		alert("Name cant be null!");
	}
	else if(!email.endsWith(".com")){
		alert("Invalid Email Address!");
	}
	else if(password1.length<=8){
		alert("Password should be greater than 8 characters!")
	}
	else if(password1!=password2){
		alert("Password does not match!");
	}
	else{
		document.forms['signUp'].submit();
	}
}

function pass1Edit() {
	var password1=document.getElementById("password1").value;
	if(password1.length<9){
		document.getElementById("password1").style.backgroundColor = "#f46853";
	}
	else{
		document.getElementById("password1").style.backgroundColor = "white";
	}
	pass2Edit();
}
function pass2Edit() {
	var password1=document.getElementById("password1").value;
	var password2=document.getElementById("password2").value;
	if(password2.length<9||password1!=password2){
		document.getElementById("password2").style.backgroundColor = "#f46853";
	}
	else{
		document.getElementById("password2").style.backgroundColor = "white";
	}
}

