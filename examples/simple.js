muh = 0;
transformable = undefined;
function initTransformable(){
	var cube = document.getElementById("cube");
	var factory = XMOT.ClientMotionFactory;
	var constraint = new XMOT.CollisionConstraint(5.0, 5.0, "img/collision.png");
	transformable = factory.createTransformable(cube, constraint);
}

function rotateCube()
{
	document.getElementById("notification").innerHTML = "Rotating the Cube ...";
	if(muh%2)
		transformable.setOrientation(new XML3DRotation( new XML3DVec3(0.0, 1.0, 0.0), 0.5));
	else
		transformable.setOrientation(new XML3DRotation( new XML3DVec3(0.0, 1.0, 0.0), 0.25));
	muh++;
	document.getElementById("notification").innerHTML = "Rotated the Cube ...";
}

function moveCube()
{
	document.getElementById("notification").innerHTML = "Moving the Cube ...";
	if(muh%2)
		transformable.setPosition(new XML3DVec3(1.0, 0.0, 1.0));
	else
		transformable.setPosition(new XML3DVec3(2.0, 0.0, 2.0));
	muh++;
	document.getElementById("notification").innerHTML = "Moved the Cube ...";
}

function translateCube()
{
	document.getElementById("notification").innerHTML = "Translating the Cube ...";
	if(muh%2)
		transformable.translate(new XML3DVec3(1.0, 0.0, 1.0));
	else
		transformable.translate(new XML3DVec3(-2.0, 0.0, -2.0));
	muh++;
	document.getElementById("notification").innerHTML = "Translated the Cube ...";
}

function moveCubeTo()
{
	document.getElementById("notification").innerHTML = "Moving the Cube To ...";
	transformable.moveTo(new XML3DVec3(1.0, 0.0, 1.0), new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), 0.5), 1000);
	transformable.moveTo(undefined, new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), Math.PI), 1500);
	transformable.moveTo(new XML3DVec3(1.0, 0.0, 4.0), undefined, 2000);
	transformable.moveTo(new XML3DVec3(4.0, 0.0, 4.0), undefined, 2500);
	transformable.moveTo(new XML3DVec3(4.0, 0.0, 1.0), undefined, 3000);
	transformable.moveTo(new XML3DVec3(1.0, 0.0, 1.0), new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), 0.5), 3500);
	document.getElementById("notification").innerHTML = "Ehm... Cube should have moved";
}

function stop()
{
	transformable.stop();
}