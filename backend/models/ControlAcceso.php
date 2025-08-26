<?php
// Configurar CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivos necesarios
include_once '../config/database.php';
include_once '../models/ControlAcceso.php';

// Crear conexión a la base de datos
$database = new Database();
$db = $database->getConnection();

// Crear objeto de control de acceso
$controlAcceso = new ControlAcceso($db);

// Procesar solicitud
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Obtener datos del POST
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(array("estado" => "error", "mensaje" => "Datos no válidos"));
        exit();
    }
    
    // Validar datos requeridos
    if (empty($data->institucion) || empty($data->numero_tarjeta) || empty($data->fecha_acceso)) {
        http_response_code(400);
        echo json_encode(array("estado" => "error", "mensaje" => "Todos los campos son requeridos"));
        exit();
    }
    
    // Asignar datos al objeto
    $controlAcceso->institucion = $data->institucion;
    $controlAcceso->numero_tarjeta = $data->numero_tarjeta;
    $controlAcceso->fecha_acceso = $data->fecha_acceso;
    
    // Verificar acceso
    $resultado = $controlAcceso->verificarAcceso($data->numero_tarjeta, $data->institucion);
    
    if ($resultado) {
        http_response_code(200);
        echo json_encode(array(
            "estado" => "exito",
            "acceso" => $resultado['acceso'],
            "mensaje" => $resultado['mensaje'],
            "registro_id" => $resultado['registro_id'] ?? null
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("estado" => "error", "mensaje" => "Error al procesar la solicitud"));
    }
    
} elseif ($method === 'GET') {
    // Obtener parámetros de búsqueda
    $institucion = $_GET['institucion'] ?? null;
    $numero_tarjeta = $_GET['numero_tarjeta'] ?? null;
    $fecha = $_GET['fecha'] ?? null;
    
    if ($institucion) {
        $stmt = $controlAcceso->buscarPorInstitucion($institucion);
    } elseif ($numero_tarjeta) {
        $stmt = $controlAcceso->buscarPorTarjeta($numero_tarjeta);
    } elseif ($fecha) {
        $stmt = $controlAcceso->buscarPorFecha($fecha);
    } else {
        $stmt = $controlAcceso->leer();
    }
    
    $registros = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($registros, $row);
    }
    
    http_response_code(200);
    echo json_encode(array(
        "estado" => "exito",
        "total" => count($registros),
        "datos" => $registros
    ));
    
} else {
    http_response_code(405);
    echo json_encode(array("estado" => "error", "mensaje" => "Método no permitido"));
}
?>