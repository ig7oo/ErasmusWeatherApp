<?php
class DataFetcher{

    public function fetch($tablename): string 
    { 

        // Database config
        $host = 'db';
        $db   = 'weather';
        $user = 'user';
        $pass = 'pass';

        $conn = new mysqli($host, $user, $pass, $db);
        if ($conn->connect_error) 
        {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }

        $sql = "SELECT * FROM `$tablename` ORDER BY date ASC";
        $result = $conn->query($sql);

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        $conn->close();
        return json_encode($data);
        
    }
}