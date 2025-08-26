<?php
// Headers para CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos de configuración y modelo
include_once '../config/database.php';
include_once '../models/Promocion.php';

// Obtener conexión a la base de datos
$database = new Database();
$db = $database->getConnection();

// Instanciar objeto promoción
$promocion = new Promocion($db);

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"));

// Verificar que los datos no estén vacíos
if(
    !empty($data->institucion) &&
    !empty($data->tipo_promocion) &&
    !empty($data->disciplina) &&
    !empty($data->beneficios) &&
    !empty($data->comentarios_restricciones) &&
    !empty($data->fecha_inicio) &&
    !empty($data->fecha_fin) &&
    !empty($data->imagen_principal)
) {
    // Asignar valores a las propiedades de la promoción
    $promocion->institucion = $data->institucion;
    $promocion->tipo_promocion = $data->tipo_promocion;
    $promocion->disciplina = $data->disciplina;
    $promocion->beneficios = $data->beneficios;
    $promocion->comentarios_restricciones = $data->comentarios_restricciones;
    $promocion->fecha_inicio = $data->fecha_inicio;
    $promocion->fecha_fin = $data->fecha_fin;
    $promocion->imagen_principal = $data->imagen_principal;
    $promocion->imagen_secundaria = $data->imagen_secundaria ?? null;

    // Crear la promoción
    if($promocion->crear()) {
        // Código de respuesta 201 - Creado
        http_response_code(201);
        
        // Mensaje de éxito
        echo json_encode(array(
            "mensaje" => "Promoción creada exitosamente.",
            "estado" => "exito",
            "id" => $db->lastInsertId()
        ));
    } else {
        // Código de respuesta 503 - Servicio no disponible
        http_response_code(503);
        
        // Mensaje de error
        echo json_encode(array(
            "mensaje" => "No se pudo crear la promoción.",
            "estado" => "error"
        ));
    }
} else {
    // Código de respuesta 400 - Solicitud incorrecta
    http_response_code(400);
    
    // Mensaje de error
    echo json_encode(array(
        "mensaje" => "No se pudo crear la promoción. Los datos están incompletos.",
        "estado" => "error",
        "datos_requeridos" => [
            "institucion",
            "tipo_promocion", 
            "disciplina",
            "beneficios",
            "comentarios_restricciones",
            "fecha_inicio",
            "fecha_fin",
            "imagen_principal"
        ]
    ));
}
?>
