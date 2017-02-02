function signout(){
	localStorage.setItem("token","");
	window.close();
	window.open("/clickrbook.html");
}