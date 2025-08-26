<?php
// Headers para CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

// Leer promociones
$stmt = $promocion->leer();
$num = $stmt->rowCount();

// Verificar si hay promociones
if($num > 0) {
    // Array de promociones
    $promociones_arr = array();
    $promociones_arr["records"] = array();

    // Obtener cada fila
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $promocion_item = array(
            "id" => $id,
            "institucion" => $institucion,
            "tipo_promocion" => $tipo_promocion,
            "disciplina" => $disciplina,
            "beneficios" => $beneficios,
            "comentarios_restricciones" => $comentarios_restricciones,
            "fecha_inicio" => $fecha_inicio,
            "fecha_fin" => $fecha_fin,
            "imagen_principal" => $imagen_principal,
            "imagen_secundaria" => $imagen_secundaria,
            "estado" => $estado,
            "fecha_creacion" => $fecha_creacion,
            "fecha_actualizacion" => $fecha_actualizacion
        );

        array_push($promociones_arr["records"], $promocion_item);
    }

    // Código de respuesta 200 - OK
    http_response_code(200);
    
    // Mostrar promociones en formato JSON
    echo json_encode($promociones_arr);
} else {
    // Código de respuesta 404 - No encontrado
    http_response_code(404);
    
    // Mensaje de que no hay promociones
    echo json_encode(array(
        "mensaje" => "No se encontraron promociones.",
        "records" => array()
    ));
}
?>
