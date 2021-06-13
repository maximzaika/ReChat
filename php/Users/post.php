<?php 	
	$rest_json = file_get_contents("php://input");
	$_POST = json_decode($rest_json, true);
	
	if (empty($_POST)) {
		echo json_encode(["ok" => false, "message" => "EMPTY_QUERY"], JSON_NUMERIC_CHECK);
	}
	
	require '../server_config.php';
	
	$userId = $_POST['userGoogleId'];
	$firstName = $_POST['firstName'];
	$lastName = $_POST['surName'];
	$email = $_POST['email'];
	
	// Check whether current user exists
	$userExists = false;
	$query = "SELECT * FROM users WHERE userGoogleId = '$userId' AND email = '$email'";
	$result = $con -> query($query);
	
	if ($result->num_rows > 0) {
		$userExists = true;
		echo json_encode(["ok" => false, "message" => "USER_EXISTS"], JSON_NUMERIC_CHECK);
	}
	
	if (!$userExists) {
		$query = "INSERT INTO users (userGoogleId, firstName, surName, email)
			  VALUES ('$userId', '$firstName', '$lastName', '$email');";
		$insert = $con -> query($query);
		
		if ($insert === TRUE) {
			echo json_encode(["ok" => true], JSON_NUMERIC_CHECK);
		} else {
			echo json_encode(["ok" => false, "message" => "ERROR_INSERTING"], JSON_NUMERIC_CHECK);
		}
	}
?>