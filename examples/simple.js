muh = 0;

function rotateCube()
{
	document.getElementById("notification").innerHTML = "Rotating the Cube ...";
	var cube = document.getElementById("cube");
	var factory = new XMOT.ClientMotionFactory;
	var moveable = factory.createMoveable(cube);
	if (!moveable)
		return;
	else{
		if(muh%2)
			moveable.setOrientation(0.0, 1.0, 0.0, 0.5);
		else
			moveable.setOrientation(0.0, 1.0, 0.0, 0.25);
	}
	muh++;
	document.getElementById("notification").innerHTML = "Rotated the Cube ...";
}

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