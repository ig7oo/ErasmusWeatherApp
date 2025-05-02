<?php 

declare(strict_types=1);

require_once("./ValueObjects/DateValue.php");
class Router {
    

    #returns the table from which data will be displayed.
    public function route(): array
    {

    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = trim($path, '/');
    $path = strtolower($path);

    /* REGEX explanation: 

            ^	                    Start of the string	Ensures the match starts at the beginning of the path
            get/	                The literal string "get/"	
            ([a-z]+)	            Captures the city name — one or more lowercase letters e.g. wuerzburg or marieham	
            /	                    Literal slash
            (\d{4}-\d{2}-\d{2})		Captures the start date in YYYY-MM-DD format e.g. 2023-04-01
            /	                    Literal slash
            (\d{4}-\d{2}-\d{2})		Captures the end date in YYYY-MM-DD format e.g. 2023-04-30
            $	                    End of the string,	Ensures no extra text comes after the expected route

    */
    if (preg_match('#^get/([a-z]+)/(\d{4}-\d{2}-\d{2})/(\d{4}-\d{2}-\d{2})$#', $path, $matches)) {
        [, $city, $start, $end] = $matches;
    }
    // Match without date range
    elseif (preg_match('#^get/([a-z]+)$#', $path, $matches)) {
        [, $city] = $matches;
        $start = $end = null;
    }
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }

    $table = match ($city) {
        'wuerzburg' => 'weather_data_ger',
        'mariehamn' => 'weather_data_fin',
        default => null,
    };

    if (!$table) {
        http_response_code(404);
        echo json_encode(['error' => 'Unknown city']);
        exit;
    }

    return [
        'table' => $table,
        'start' => $start ? new DateValue($start) : null,
        'end'   => $end ? new DateValue($end) : null
    ];
    }
}