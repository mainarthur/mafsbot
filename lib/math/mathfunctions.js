let t = {}

Math.fact = function fact(k) {
	if(k < 0 || parseInt(k) != k)
		return NaN;
	
	if(k == 0 || k == 1)
		return 1;
		
	if(t[k] == null) {
		t[k] = k * fact(k-1);
	}

	return t[k];
}

Math.fact(170);

Math.ctan = function(a) {
	return Math.cos(a)/Math.sin(a);
}

Math.actan = function(a) {
	return Math.PI/2-Math.atan(a);
}

Math.ctanh = function(a) {
	return Math.cosh(a)/Math.sinh(a)
}

Math.actanh = function(a) {
	if(Math.abs(a) == 1)
		return NaN;
	
	return 0.5*Math.log((a+1)/(a-1))
}