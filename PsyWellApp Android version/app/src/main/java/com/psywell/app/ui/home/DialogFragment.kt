package com.psywell.app.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import com.psywell.app.databinding.FragmentAgendarCitaBinding

class AgendarCitaDialogFragment : DialogFragment() {

    private var _binding: FragmentAgendarCitaBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentAgendarCitaBinding.inflate(inflater, container, false)

        // Configurar el botón para realizar la acción de agendar
        binding.btnAgendar.setOnClickListener {
            // Aquí puedes agregar la lógica para manejar la cita
            // Como obtener los datos de los EditText y enviarlos al backend
            dismiss()  // Cierra el modal después de agendar
        }

        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
