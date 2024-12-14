package com.psywell.app

object Global {
    // Estado de autenticación
    var isLogin: Boolean = false
    var userId: String = "0"
    var userMail: String = "00"

    // Información de la cita actual
    var citaId: String = "" // ID único de la cita para consultas
    var citaFecha: String = "..." // Fecha de la cita
    var citaUbicacion: String = "..." // Ubicación de la cita
    var citaHorario: String = "..." // Horario de la cita
    var citaComentario: String = "..." // Comentarios adicionales
    var citaTitulo: String = "..." // Título o descripción de la cita

    // Información del psicólogo
    var psychologistEmail: String = "" // Email del psicólogo relacionado con la cita

    // Otros datos
    var a: String = "0"
    var aa: String = "0"
    var b: String = "0"
    var bb: String = "0"
    var c: String = "0"
    var cc: String = "0"
    var d: String = "0"
    var dd: String = "0"
}
