<?php
class RegistroUsuario {
    private $conn;
    private $table_name = "registro_usuarios";

    public $id;
    public $nombre;
    public $apellido_paterno;
    public $apellido_materno;
    public $genero;
    public $email;
    public $calle_numero;
    public $municipio;
    public $estado;
    public $colonia;
    public $codigo_postal;
    public $edad;
    public $estado_civil;
    public $estudios;
    public $curp;
    public $estado_nacimiento;
    public $dia_nacimiento;
    public $mes_nacimiento;
    public $ano_nacimiento;
    public $numero_tarjeta;
    public $acepta_info;
    public $fecha_registro;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear nuevo usuario
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    nombre = :nombre,
                    apellido_paterno = :apellido_paterno,
                    apellido_materno = :apellido_materno,
                    genero = :genero,
                    email = :email,
                    calle_numero = :calle_numero,
                    municipio = :municipio,
                    estado = :estado,
                    colonia = :colonia,
                    codigo_postal = :codigo_postal,
                    edad = :edad,
                    estado_civil = :estado_civil,
                    estudios = :estudios,
                    curp = :curp,
                    estado_nacimiento = :estado_nacimiento,
                    dia_nacimiento = :dia_nacimiento,
                    mes_nacimiento = :mes_nacimiento,
                    ano_nacimiento = :ano_nacimiento,
                    numero_tarjeta = :numero_tarjeta,
                    acepta_info = :acepta_info";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellido_paterno = htmlspecialchars(strip_tags($this->apellido_paterno));
        $this->apellido_materno = htmlspecialchars(strip_tags($this->apellido_materno));
        $this->genero = htmlspecialchars(strip_tags($this->genero));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->calle_numero = htmlspecialchars(strip_tags($this->calle_numero));
        $this->municipio = htmlspecialchars(strip_tags($this->municipio));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->colonia = htmlspecialchars(strip_tags($this->colonia));
        $this->codigo_postal = htmlspecialchars(strip_tags($this->codigo_postal));
        $this->edad = htmlspecialchars(strip_tags($this->edad));
        $this->estado_civil = htmlspecialchars(strip_tags($this->estado_civil));
        $this->estudios = htmlspecialchars(strip_tags($this->estudios));
        $this->curp = htmlspecialchars(strip_tags($this->curp));
        $this->estado_nacimiento = htmlspecialchars(strip_tags($this->estado_nacimiento));
        $this->dia_nacimiento = htmlspecialchars(strip_tags($this->dia_nacimiento));
        $this->mes_nacimiento = htmlspecialchars(strip_tags($this->mes_nacimiento));
        $this->ano_nacimiento = htmlspecialchars(strip_tags($this->ano_nacimiento));
        $this->numero_tarjeta = htmlspecialchars(strip_tags($this->numero_tarjeta));
        $this->acepta_info = htmlspecialchars(strip_tags($this->acepta_info));

        // Bind de parámetros
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellido_paterno", $this->apellido_paterno);
        $stmt->bindParam(":apellido_materno", $this->apellido_materno);
        $stmt->bindParam(":genero", $this->genero);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":calle_numero", $this->calle_numero);
        $stmt->bindParam(":municipio", $this->municipio);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":colonia", $this->colonia);
        $stmt->bindParam(":codigo_postal", $this->codigo_postal);
        $stmt->bindParam(":edad", $this->edad);
        $stmt->bindParam(":estado_civil", $this->estado_civil);
        $stmt->bindParam(":estudios", $this->estudios);
        $stmt->bindParam(":curp", $this->curp);
        $stmt->bindParam(":estado_nacimiento", $this->estado_nacimiento);
        $stmt->bindParam(":dia_nacimiento", $this->dia_nacimiento);
        $stmt->bindParam(":mes_nacimiento", $this->mes_nacimiento);
        $stmt->bindParam(":ano_nacimiento", $this->ano_nacimiento);
        $stmt->bindParam(":numero_tarjeta", $this->numero_tarjeta);
        $stmt->bindParam(":acepta_info", $this->acepta_info);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Leer todos los usuarios
    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " 
                ORDER BY fecha_registro DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Leer usuario por ID
    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->nombre = $row['nombre'];
            $this->apellido_paterno = $row['apellido_paterno'];
            $this->apellido_materno = $row['apellido_materno'];
            $this->genero = $row['genero'];
            $this->email = $row['email'];
            $this->calle_numero = $row['calle_numero'];
            $this->municipio = $row['municipio'];
            $this->estado = $row['estado'];
            $this->colonia = $row['colonia'];
            $this->codigo_postal = $row['codigo_postal'];
            $this->edad = $row['edad'];
            $this->estado_civil = $row['estado_civil'];
            $this->estudios = $row['estudios'];
            $this->curp = $row['curp'];
            $this->estado_nacimiento = $row['estado_nacimiento'];
            $this->dia_nacimiento = $row['dia_nacimiento'];
            $this->mes_nacimiento = $row['mes_nacimiento'];
            $this->ano_nacimiento = $row['ano_nacimiento'];
            $this->numero_tarjeta = $row['numero_tarjeta'];
            $this->acepta_info = $row['acepta_info'];
            $this->fecha_registro = $row['fecha_registro'];
            $this->estado = $row['estado'];
            return true;
        }
        return false;
    }

    // Leer usuario por email
    public function leerPorEmail($email) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->nombre = $row['nombre'];
            $this->apellido_paterno = $row['apellido_paterno'];
            $this->apellido_materno = $row['apellido_materno'];
            $this->genero = $row['genero'];
            $this->email = $row['email'];
            $this->calle_numero = $row['calle_numero'];
            $this->municipio = $row['municipio'];
            $this->estado = $row['estado'];
            $this->colonia = $row['colonia'];
            $this->codigo_postal = $row['codigo_postal'];
            $this->edad = $row['edad'];
            $this->estado_civil = $row['estado_civil'];
            $this->estudios = $row['estudios'];
            $this->curp = $row['curp'];
            $this->estado_nacimiento = $row['estado_nacimiento'];
            $this->dia_nacimiento = $row['dia_nacimiento'];
            $this->mes_nacimiento = $row['mes_nacimiento'];
            $this->ano_nacimiento = $row['ano_nacimiento'];
            $this->numero_tarjeta = $row['numero_tarjeta'];
            $this->acepta_info = $row['acepta_info'];
            $this->fecha_registro = $row['fecha_registro'];
            $this->estado = $row['estado'];
            return true;
        }
        return false;
    }

    // Leer usuario por número de tarjeta
    public function leerPorTarjeta($numeroTarjeta) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE numero_tarjeta = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $numeroTarjeta);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->nombre = $row['nombre'];
            $this->apellido_paterno = $row['apellido_paterno'];
            $this->apellido_materno = $row['apellido_materno'];
            $this->genero = $row['genero'];
            $this->email = $row['email'];
            $this->calle_numero = $row['calle_numero'];
            $this->municipio = $row['municipio'];
            $this->estado = $row['estado'];
            $this->colonia = $row['colonia'];
            $this->codigo_postal = $row['codigo_postal'];
            $this->edad = $row['edad'];
            $this->estado_civil = $row['estado_civil'];
            $this->estudios = $row['estudios'];
            $this->curp = $row['curp'];
            $this->estado_nacimiento = $row['estado_nacimiento'];
            $this->dia_nacimiento = $row['dia_nacimiento'];
            $this->mes_nacimiento = $row['mes_nacimiento'];
            $this->ano_nacimiento = $row['ano_nacimiento'];
            $this->numero_tarjeta = $row['numero_tarjeta'];
            $this->acepta_info = $row['acepta_info'];
            $this->fecha_registro = $row['fecha_registro'];
            $this->estado = $row['estado'];
            return true;
        }
        return false;
    }

    // Actualizar usuario
    public function actualizar() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    nombre = :nombre,
                    apellido_paterno = :apellido_paterno,
                    apellido_materno = :apellido_materno,
                    genero = :genero,
                    email = :email,
                    calle_numero = :calle_numero,
                    municipio = :municipio,
                    estado = :estado,
                    colonia = :colonia,
                    codigo_postal = :codigo_postal,
                    edad = :edad,
                    estado_civil = :estado_civil,
                    estudios = :estudios,
                    curp = :curp,
                    estado_nacimiento = :estado_nacimiento,
                    dia_nacimiento = :dia_nacimiento,
                    mes_nacimiento = :mes_nacimiento,
                    ano_nacimiento = :ano_nacimiento,
                    numero_tarjeta = :numero_tarjeta,
                    acepta_info = :acepta_info
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellido_paterno = htmlspecialchars(strip_tags($this->apellido_paterno));
        $this->apellido_materno = htmlspecialchars(strip_tags($this->apellido_materno));
        $this->genero = htmlspecialchars(strip_tags($this->genero));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->calle_numero = htmlspecialchars(strip_tags($this->calle_numero));
        $this->municipio = htmlspecialchars(strip_tags($this->municipio));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->colonia = htmlspecialchars(strip_tags($this->colonia));
        $this->codigo_postal = htmlspecialchars(strip_tags($this->codigo_postal));
        $this->edad = htmlspecialchars(strip_tags($this->edad));
        $this->estado_civil = htmlspecialchars(strip_tags($this->estado_civil));
        $this->estudios = htmlspecialchars(strip_tags($this->estudios));
        $this->curp = htmlspecialchars(strip_tags($this->curp));
        $this->estado_nacimiento = htmlspecialchars(strip_tags($this->estado_nacimiento));
        $this->dia_nacimiento = htmlspecialchars(strip_tags($this->dia_nacimiento));
        $this->mes_nacimiento = htmlspecialchars(strip_tags($this->mes_nacimiento));
        $this->ano_nacimiento = htmlspecialchars(strip_tags($this->ano_nacimiento));
        $this->numero_tarjeta = htmlspecialchars(strip_tags($this->numero_tarjeta));
        $this->acepta_info = htmlspecialchars(strip_tags($this->acepta_info));

        // Bind de parámetros
        $stmt->bindParam(':nombre', $this->nombre);
        $stmt->bindParam(':apellido_paterno', $this->apellido_paterno);
        $stmt->bindParam(':apellido_materno', $this->apellido_materno);
        $stmt->bindParam(':genero', $this->genero);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':calle_numero', $this->calle_numero);
        $stmt->bindParam(':municipio', $this->municipio);
        $stmt->bindParam(':estado', $this->estado);
        $stmt->bindParam(':colonia', $this->colonia);
        $stmt->bindParam(':codigo_postal', $this->codigo_postal);
        $stmt->bindParam(':edad', $this->edad);
        $stmt->bindParam(':estado_civil', $this->estado_civil);
        $stmt->bindParam(':estudios', $this->estudios);
        $stmt->bindParam(':curp', $this->curp);
        $stmt->bindParam(':estado_nacimiento', $this->estado_nacimiento);
        $stmt->bindParam(':dia_nacimiento', $this->dia_nacimiento);
        $stmt->bindParam(':mes_nacimiento', $this->mes_nacimiento);
        $stmt->bindParam(':ano_nacimiento', $this->ano_nacimiento);
        $stmt->bindParam(':numero_tarjeta', $this->numero_tarjeta);
        $stmt->bindParam(':acepta_info', $this->acepta_info);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Cambiar estado del usuario
    public function cambiarEstado($nuevoEstado) {
        $query = "UPDATE " . $this->table_name . " SET estado = ? WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $nuevoEstado);
        $stmt->bindParam(2, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Verificar si el email ya existe
    public function emailExiste($email) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Verificar si el número de tarjeta ya existe
    public function tarjetaExiste($numeroTarjeta) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE numero_tarjeta = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $numeroTarjeta);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Generar número de tarjeta único
    public function generarNumeroTarjeta() {
        do {
            $numero = str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        } while ($this->tarjetaExiste($numero));
        
        return $numero;
    }

    // Obtener estadísticas de usuarios
    public function obtenerEstadisticas() {
        $query = "SELECT 
                    COUNT(*) as total_usuarios,
                    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as usuarios_activos,
                    SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as usuarios_inactivos,
                    SUM(CASE WHEN genero = 'femenino' THEN 1 ELSE 0 END) as genero_femenino,
                    SUM(CASE WHEN genero = 'masculino' THEN 1 ELSE 0 END) as genero_masculino,
                    SUM(CASE WHEN edad = '16-17' THEN 1 ELSE 0 END) as edad_16_17,
                    SUM(CASE WHEN edad = '18-29' THEN 1 ELSE 0 END) as edad_18_29,
                    SUM(CASE WHEN edad = '30-49' THEN 1 ELSE 0 END) as edad_30_49,
                    SUM(CASE WHEN edad = '50-59' THEN 1 ELSE 0 END) as edad_50_59,
                    SUM(CASE WHEN edad = '60+' THEN 1 ELSE 0 END) as edad_60_mas
                  FROM " . $this->table_name;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
