function rotateCube()
{
	document.getElementById("notification").innerHTML = "Rotated the Cube ...";
}

muh = 0;

function moveCube()
{
	//TODO: error handling
	document.getElementById("notification").innerHTML = "Moving the Cube ...";
	var cube = document.getElementById("cube");
	var factory = new XMOT.ClientMotionFactory;
	var moveable = factory.createMoveable(cube);
	if (!moveable)
		return;
	else{
		if(muh%2)
			moveable.setPosition(1.0, 0.0, 1.0);
		else
			moveable.setPosition(2.0, 0.0, 2.0);
	}
	muh++;
	document.getElementById("notification").innerHTML = "Moved the Cube ...";
}