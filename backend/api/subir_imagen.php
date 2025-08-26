<?php
// Headers para CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Verificar si se recibió un archivo
if (!isset($_FILES['imagen'])) {
    http_response_code(400);
    echo json_encode(array(
        "mensaje" => "No se recibió ninguna imagen.",
        "estado" => "error"
    ));
    exit;
}

$imagen = $_FILES['imagen'];
$nombreArchivo = $_POST['nombre'] ?? '';

// Verificar si no hay errores en la subida
if ($imagen['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(array(
        "mensaje" => "Error al subir la imagen: " . $imagen['error'],
        "estado" => "error"
    ));
    exit;
}

// Verificar el tipo de archivo
$tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($imagen['type'], $tiposPermitidos)) {
    http_response_code(400);
    echo json_encode(array(
        "mensaje" => "Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).",
        "estado" => "error"
    ));
    exit;
}

// Verificar el tamaño del archivo (máximo 5MB)
$tamanoMaximo = 5 * 1024 * 1024; // 5MB en bytes
if ($imagen['size'] > $tamanoMaximo) {
    http_response_code(400);
    echo json_encode(array(
        "mensaje" => "El archivo es demasiado grande. Máximo 5MB permitido.",
        "estado" => "error"
    ));
    exit;
}

// Crear directorio de imágenes si no existe
$directorioDestino = '../uploads/';
if (!is_dir($directorioDestino)) {
    mkdir($directorioDestino, 0755, true);
}

// Generar nombre único para el archivo
$extension = pathinfo($imagen['name'], PATHINFO_EXTENSION);
$nombreUnico = uniqid() . '_' . time() . '.' . $extension;
$rutaCompleta = $directorioDestino . $nombreUnico;

// Mover el archivo subido al directorio de destino
if (move_uploaded_file($imagen['tmp_name'], $rutaCompleta)) {
    // Código de respuesta 200 - OK
    http_response_code(200);
    
    // Respuesta de éxito
    echo json_encode(array(
        "mensaje" => "Imagen subida exitosamente.",
        "estado" => "exito",
        "nombre_archivo" => $nombreUnico,
        "ruta" => $rutaCompleta,
        "url" => "http://localhost/cultural-access/backend/uploads/" . $nombreUnico
    ));
} else {
    // Código de respuesta 500 - Error interno del servidor
    http_response_code(500);
    
    // Mensaje de error
    echo json_encode(array(
        "mensaje" => "Error al mover el archivo subido.",
        "estado" => "error"
    ));
}
?>
