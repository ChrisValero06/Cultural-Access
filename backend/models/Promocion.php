<?php
class Promocion {
    private $conn;
    private $table_name = "promociones";

    public $id;
    public $institucion;
    public $tipo_promocion;
    public $disciplina;
    public $beneficios;
    public $comentarios_restricciones;
    public $fecha_inicio;
    public $fecha_fin;
    public $imagen_principal;
    public $imagen_secundaria;
    public $estado;
    public $fecha_creacion;
    public $fecha_actualizacion;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear nueva promoción
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    institucion = :institucion,
                    tipo_promocion = :tipo_promocion,
                    disciplina = :disciplina,
                    beneficios = :beneficios,
                    comentarios_restricciones = :comentarios_restricciones,
                    fecha_inicio = :fecha_inicio,
                    fecha_fin = :fecha_fin,
                    imagen_principal = :imagen_principal,
                    imagen_secundaria = :imagen_secundaria,
                    estado = 'activa'";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->institucion = htmlspecialchars(strip_tags($this->institucion));
        $this->tipo_promocion = htmlspecialchars(strip_tags($this->tipo_promocion));
        $this->disciplina = htmlspecialchars(strip_tags($this->disciplina));
        $this->beneficios = htmlspecialchars(strip_tags($this->beneficios));
        $this->comentarios_restricciones = htmlspecialchars(strip_tags($this->comentarios_restricciones));

        // Bind de parámetros
        $stmt->bindParam(":institucion", $this->institucion);
        $stmt->bindParam(":tipo_promocion", $this->tipo_promocion);
        $stmt->bindParam(":disciplina", $this->disciplina);
        $stmt->bindParam(":beneficios", $this->beneficios);
        $stmt->bindParam(":comentarios_restricciones", $this->comentarios_restricciones);
        $stmt->bindParam(":fecha_inicio", $this->fecha_inicio);
        $stmt->bindParam(":fecha_fin", $this->fecha_fin);
        $stmt->bindParam(":imagen_principal", $this->imagen_principal);
        $stmt->bindParam(":imagen_secundaria", $this->imagen_secundaria);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Leer todas las promociones activas
    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " 
                WHERE estado = 'activa' 
                AND fecha_fin >= CURDATE()
                ORDER BY fecha_creacion DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Leer promoción por ID
    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->institucion = $row['institucion'];
            $this->tipo_promocion = $row['tipo_promocion'];
            $this->disciplina = $row['disciplina'];
            $this->beneficios = $row['beneficios'];
            $this->comentarios_restricciones = $row['comentarios_restricciones'];
            $this->fecha_inicio = $row['fecha_inicio'];
            $this->fecha_fin = $row['fecha_fin'];
            $this->imagen_principal = $row['imagen_principal'];
            $this->imagen_secundaria = $row['imagen_secundaria'];
            $this->estado = $row['estado'];
            $this->fecha_creacion = $row['fecha_creacion'];
            $this->fecha_actualizacion = $row['fecha_actualizacion'];
            return true;
        }
        return false;
    }

    // Actualizar promoción
    public function actualizar() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    institucion = :institucion,
                    tipo_promocion = :tipo_promocion,
                    disciplina = :disciplina,
                    beneficios = :beneficios,
                    comentarios_restricciones = :comentarios_restricciones,
                    fecha_inicio = :fecha_inicio,
                    fecha_fin = :fecha_fin,
                    imagen_principal = :imagen_principal,
                    imagen_secundaria = :imagen_secundaria
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->institucion = htmlspecialchars(strip_tags($this->institucion));
        $this->tipo_promocion = htmlspecialchars(strip_tags($this->tipo_promocion));
        $this->disciplina = htmlspecialchars(strip_tags($this->disciplina));
        $this->beneficios = htmlspecialchars(strip_tags($this->beneficios));
        $this->comentarios_restricciones = htmlspecialchars(strip_tags($this->comentarios_restricciones));

        // Bind de parámetros
        $stmt->bindParam(':institucion', $this->institucion);
        $stmt->bindParam(':tipo_promocion', $this->tipo_promocion);
        $stmt->bindParam(':disciplina', $this->disciplina);
        $stmt->bindParam(':beneficios', $this->beneficios);
        $stmt->bindParam(':comentarios_restricciones', $this->comentarios_restricciones);
        $stmt->bindParam(':fecha_inicio', $this->fecha_inicio);
        $stmt->bindParam(':fecha_fin', $this->fecha_fin);
        $stmt->bindParam(':imagen_principal', $this->imagen_principal);
        $stmt->bindParam(':imagen_secundaria', $this->imagen_secundaria);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar promoción (cambiar estado a inactiva)
    public function eliminar() {
        $query = "UPDATE " . $this->table_name . " SET estado = 'inactiva' WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Buscar promociones por institución
    public function buscarPorInstitucion($institucion) {
        $query = "SELECT * FROM " . $this->table_name . " 
                WHERE institucion LIKE ? AND estado = 'activa'
                ORDER BY fecha_creacion DESC";

        $stmt = $this->conn->prepare($query);
        $institucion = "%{$institucion}%";
        $stmt->bindParam(1, $institucion);
        $stmt->execute();

        return $stmt;
    }

    // Buscar promociones por disciplina
    public function buscarPorDisciplina($disciplina) {
        $query = "SELECT * FROM " . $this->table_name . " 
                WHERE disciplina LIKE ? AND estado = 'activa'
                ORDER BY fecha_creacion DESC";

        $stmt = $this->conn->prepare($query);
        $disciplina = "%{$disciplina}%";
        $stmt->bindParam(1, $disciplina);
        $stmt->execute();

        return $stmt;
    }
}
?>
