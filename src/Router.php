<?php 

declare(strict_types=1);

class Router {
    

    #returns the table from which data will be displayed.
    public function route(): string 
    {

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        $path = trim($path, '/');

        $path = strtolower($path);

        switch ($path) 
        {
            case 'get/mariehamn':
                $table = 'weather_data_fin';
                break;
            case 'get/wuerzburg':
                $table = 'weather_data_ger';
                break;
            default:
                http_response_code(404);
                echo json_encode(['error' => 'Route not found']);
                exit; 
        }

        return $table;
    }
}