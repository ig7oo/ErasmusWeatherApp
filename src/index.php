<?php


header('Content-Type: application/json');

$mysqli = new mysqli("db", "user", "pass", "weather");

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$result = $mysqli->query("SELECT label, value FROM weather_data");

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
