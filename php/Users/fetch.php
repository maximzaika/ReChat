<?php 	
	$rest_json = file_get_contents("php://input");
	$_POST = json_decode($rest_json, true);
	
	if (empty($_POST)) {
		echo json_encode(["ok" => false, "message" => "EMPTY_QUERY"], JSON_NUMERIC_CHECK);
	}
	
	require '../server_config.php';
	
	$userId = $_POST['userGoogleId'];
	$email = $_POST['email'];
	
	// Check whether current user exists
	$query = "SELECT * FROM users WHERE userGoogleId = '$userId' AND email = '$email'";
	$result = $con -> query($query);
	
	if ($result->num_rows > 0) {
		$row = $result->fetch_assoc();
		$firstName = $row['firstName'];
		$surName = $row['surName'];
		echo json_encode(["ok" => true, 'firstName' => $firstName, 'surName' => $surName], JSON_NUMERIC_CHECK);
	} else {
		echo json_encode(["ok" => false, "message" => "USER_NOT_EXISTS"], JSON_NUMERIC_CHECK);
	}
?>