package com.psywell.app.ui.home

import android.graphics.drawable.Drawable
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.app.ActivityCompat.finishAffinity
import androidx.fragment.app.Fragment
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.google.firebase.storage.FirebaseStorage
import com.psywell.app.Global
import com.psywell.app.R
import com.psywell.app.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // Configuración del botón de salida
        val exitButton = binding.exitButton
        exitButton.setOnClickListener {
            Global.isLogin = false
            Global.userId = "0"
            Global.userMail = "00"
            Log.d("HomeFragment", "Cierre de sesión")
            finishAffinity(requireActivity())
        }

        // Asignar los textos de las citas desde Global
        binding.inicio.text = Global.citaFecha
        binding.fin.text = Global.citaHorario
        binding.ubicacion.text = Global.citaUbicacion
        binding.detalles.text = Global.citaComentario
        binding.welcome.text = "¡Bienvenido(a), ${Global.citaTitulo}!"

        // Cargar imágenes del paciente y psicólogo
        loadPatientImage()
        loadPsychologistImage()

        // Cargar mapa dinámico con Google Maps Static API
        loadGoogleMap()

        return root
    }

    private fun loadPatientImage() {
        val storageRef = FirebaseStorage.getInstance().reference
        val patientPhotoRef = storageRef.child("fotoPerfil/${Global.userMail.replace('.', '_')}")
        patientPhotoRef.downloadUrl.addOnSuccessListener { uri ->
            Glide.with(this)
                .load(uri)
                .placeholder(R.drawable.ic_profile_placeholder)
                .error(R.drawable.ic_profile_placeholder)
                .circleCrop()
                .into(binding.imageViewPatient)
        }.addOnFailureListener { exception ->
            Log.e("Firebase", "Error al obtener URL de la imagen del paciente", exception)
        }
    }


    private fun loadPsychologistImage() {
        val storageRef = FirebaseStorage.getInstance().reference
        val psychologistPhotoRef = storageRef.child("fotoPerfil/${Global.psychologistEmail}")
        psychologistPhotoRef.downloadUrl.addOnSuccessListener { uri ->
            Glide.with(requireContext())
                .load(uri)
                .placeholder(R.drawable.ic_profile_placeholder)
                .error(R.drawable.ic_profile_placeholder)
                .circleCrop()
                .into(binding.imageViewPsychologist)
        }.addOnFailureListener { exception ->
            Log.e("Firebase", "Error al obtener URL de la imagen del psicólogo", exception)
        }
    }

    private fun loadGoogleMap() {
        val googleMapsApiKey = "AIzaSyAFJUcrBDDLPM2SscMvi1x_jUv6Wlqnukg"
        val location = Global.citaUbicacion.replace(" ", "+")
        val mapImageUrl =
            "https://maps.googleapis.com/maps/api/staticmap?center=$location&zoom=15&size=600x300&markers=color:red|$location&key=$googleMapsApiKey"

        Glide.with(requireContext())
            .load(mapImageUrl)
            .placeholder(R.drawable.ic_map_placeholder)
            .into(binding.mapPreview)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
