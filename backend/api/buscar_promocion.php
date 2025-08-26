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

// Obtener parámetros de búsqueda
$institucion = $_GET['institucion'] ?? null;
$disciplina = $_GET['disciplina'] ?? null;

// Verificar que se proporcione al menos un parámetro de búsqueda
if (!$institucion && !$disciplina) {
    http_response_code(400);
    echo json_encode(array(
        "mensaje" => "Debe proporcionar un parámetro de búsqueda (institucion o disciplina).",
        "estado" => "error"
    ));
    exit;
}

$stmt = null;

// Realizar búsqueda según el parámetro proporcionado
if ($institucion) {
    $stmt = $promocion->buscarPorInstitucion($institucion);
} elseif ($disciplina) {
    $stmt = $promocion->buscarPorDisciplina($disciplina);
}

// Verificar si se encontraron resultados
$num = $stmt->rowCount();

if ($num > 0) {
    // Array de promociones encontradas
    $promociones_arr = array();
    $promociones_arr["records"] = array();
    $promociones_arr["total"] = $num;
    $promociones_arr["parametro_busqueda"] = $institucion ? "institucion: $institucion" : "disciplina: $disciplina";

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
    
    // Mostrar promociones encontradas en formato JSON
    echo json_encode($promociones_arr);
} else {
    // Código de respuesta 404 - No encontrado
    http_response_code(404);
    
    // Mensaje de que no se encontraron promociones
    $parametro = $institucion ? "institución '$institucion'" : "disciplina '$disciplina'";
    echo json_encode(array(
        "mensaje" => "No se encontraron promociones para la $parametro.",
        "estado" => "no_encontrado",
        "records" => array(),
        "total" => 0,
        "parametro_busqueda" => $institucion ? "institucion: $institucion" : "disciplina: $disciplina"
    ));
}
?>
