<?php

declare(strict_types=1);

// Allow requests from your current origin
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
// Add additional CORS headers for better compatibility
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once("./Router.php"); 

$router = new Router;
$tablename = $router->route();

require_once("./DataFetcher.php");

$fetcher = new DataFetcher;
$result = $fetcher->fetch($tablename);

echo $result;

?>
