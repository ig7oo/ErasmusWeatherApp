<?php
header('Access-Control-Allow-Origin: http://localhost:8080');

// DB config
$host = 'db';  // service name from docker-compose
$db   = 'weather';
$user = 'user';
$pass = 'pass';

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Query data
$sql = "SELECT * FROM weather_data ORDER BY date ASC";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
?>
