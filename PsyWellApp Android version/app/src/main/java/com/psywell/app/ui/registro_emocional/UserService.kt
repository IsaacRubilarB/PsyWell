package com.psywell.app.ui.registro_emocional

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST


interface UserService {

    @POST("registrarEmocion") // Replace with your actual endpoint
    suspend fun sendEmotion(@Body emocion: Emocion): Response<Emocion>
    @GET("listarCitas") // Replace with your actual endpoint
    suspend fun getCitas(): Response<CitaResponse>

    @POST("agregarUsuario") // Replace with your actual endpoint
    suspend fun postUsuario(): Response<CitaResponse>

    @GET("ListarUsuarios") // Replace with your actual endpoint
    suspend fun getUsuarios(): Response<UsuarioResponse>

    data class Emocion(val idRegistro: Number, val idUsuario: String,val fecha: String,val estadoEmocional: String,val comentarios: String)
    data class CitaResponse(
        val status: String,
        val data: List<Cita>
    )

    data class Cita(
        val idCita: Int,
        val idPaciente: Int,
        val idPsicologo: Int,
        val ubicacion: String,
        val estado: String,
        val fecha: String,
        val horaInicio: String,
        val horaFin: String,
        val comentarios: String
    )

    data class UsuarioResponse(
        val status: String,
        val data: List<Usuario>
    )

    data class Usuario(
        val idUsuario: Int,
        val nombre: String,
        val email: String,
        val contrasena: String,
        val perfil: String,
        val fechaNacimiento: String,
        val genero: String,
        val estado: Boolean
    )

}

