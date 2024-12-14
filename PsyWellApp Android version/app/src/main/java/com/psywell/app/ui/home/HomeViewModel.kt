package com.psywell.app.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.psywell.app.Global

class HomeViewModel : ViewModel() {

    private val _welcomeText = MutableLiveData<String>()
    val welcomeText: LiveData<String> = _welcomeText

    private val _appointmentDetails = MutableLiveData<AppointmentDetails>()
    val appointmentDetails: LiveData<AppointmentDetails> = _appointmentDetails

    private val db = Firebase.firestore

    init {
        loadWelcomeText()
        loadAppointmentDetails()
    }

    private fun loadWelcomeText() {
        val userEmail = Global.userMail
        _welcomeText.value = "Bienvenido(a) a Psywell, $userEmail"
    }

    private fun loadAppointmentDetails() {
        val appointmentId = Global.citaId // ID de la cita almacenado globalmente

        db.collection("citas").document(appointmentId)
            .get()
            .addOnSuccessListener { document ->
                if (document.exists()) {
                    val startDate = document.getString("inicio") ?: "No definido"
                    val endDate = document.getString("fin") ?: "No definido"
                    val details = document.getString("detalles") ?: "Sin detalles"
                    val location = document.getString("ubicacion") ?: "No definida"
                    val psychologist = document.getString("psicologo") ?: "Sin asignar"

                    _appointmentDetails.value = AppointmentDetails(
                        startDate,
                        endDate,
                        details,
                        location,
                        psychologist
                    )
                } else {
                    _appointmentDetails.value = null
                }
            }
            .addOnFailureListener { exception ->
                _appointmentDetails.value = null
                exception.printStackTrace()
            }
    }

    data class AppointmentDetails(
        val startDate: String,
        val endDate: String,
        val details: String,
        val location: String,
        val psychologist: String
    )
}
