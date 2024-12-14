package com.psywell.app.ui.registro_emocional

import android.content.ContentValues.TAG
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import androidx.activity.result.launch
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.widget.AppCompatImageButton
import androidx.core.content.ContextCompat

import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.psywell.app.Global
import com.psywell.app.R
import com.psywell.app.databinding.FragmentRegistroEmocionalBinding
import kotlinx.coroutines.launch
import okhttp3.MediaType
import okhttp3.RequestBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class Registro_emocionalFragment : Fragment() {

    private var detalleDia = ""
    private var detalleEmocion = ""

    private var _binding: FragmentRegistroEmocionalBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private var selectedKeyword: Button? = null // Para almacenar la palabra clave seleccionada
    lateinit var rootView : View;
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
         rootView = inflater.inflate(R.layout.fragment_registro_emocional, container, false)
        _binding = FragmentRegistroEmocionalBinding.inflate(inflater, container, false)

        val Registro_emocionalViewModel =
            ViewModelProvider(this).get(Registro_emocionalViewModel::class.java)

        // Referencias a las caritas (ImageButton)
     //  binding.btnAngry.setOnClickListener{
    //        Log.d(TAG,"angry press")
       //    updateEmotionSelection(it as ImageButton, binding.keywordsContainer, listOf("Discutí con alguien", "Estropeé algo", "Nada me sale bien"))

      // }
        val ubtnSad = binding.btnSad
        val ubtnNeutral = binding.btnNeutral
        val ubtnHappy = binding.btnHappy
        val ubtnExcited = binding.btnExcited
        // Contenedor para las palabras clave
        val keywordsContainer = binding.keywordsContainer



        val btn = rootView.findViewById<Button>(R.id.btnSave)
        btn.setOnClickListener{
            Log.d(TAG,"btn press")
            val retrofit = Retrofit.Builder()
                .baseUrl("https://enigmatic-cliffs-40022-25093e0d563a.herokuapp.com/")
                .addConverterFactory(GsonConverterFactory.create()) // Or other converter if needed
                .build()

            val service = retrofit.create(UserService::class.java)
            lifecycleScope.launch {
                try {

                    //val requestBody = RequestBody.create(MediaType.parse("application/json"),
                    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    val current = LocalDateTime.now().format(formatter)
                    val comentario = rootView.findViewById<EditText>(R.id.etComment).text.toString()
                    val emo = UserService.Emocion(
                        11,
                        Global.userId,
                        current.toString(),
                        detalleEmocion,
                        comentario
                    )
                    val response = service.sendEmotion(emo)

                    if (response.isSuccessful) {
                        // Handle successful response
                        val responseBody = response.body()
                        Log.d(responseBody.toString(),"response")
                        resetEmotionButtons()
                        var con = rootView.findViewById<LinearLayout>(R.id.keywordsContainer)
                        con.removeAllViews()
                        val comentario = rootView.findViewById<EditText>(R.id.etComment)
                        comentario.setText("")
                        Toast.makeText(context, "Emocion registrada", Toast.LENGTH_SHORT).show()



                        // ... process responseBody ...
                    } else {
                        Log.d("error","post error")
                        Toast.makeText(context, "Error al registrar la Emocion", Toast.LENGTH_SHORT).show()

                        // ...
                    }
                } catch (e: Exception) {
                    // Handle network or other errors
                    Log.d("error",e.message.toString())
                    Toast.makeText(context, "Error al registrar la Emocion", Toast.LENGTH_SHORT).show()

                }
            }

        }



        val textView: TextView = binding.textRegistroEmocional
        Registro_emocionalViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        ///



        val btnAngry = rootView.findViewById<AppCompatImageButton>(R.id.btnAngry)
        btnAngry.setOnClickListener{
            updateEmotionSelection(it as ImageButton, rootView.findViewById<LinearLayout>(R.id.keywordsContainer), listOf("Discutí con alguien", "Estropeé algo", "Nada me sale bien"))
        }
        val btnSad = rootView.findViewById<AppCompatImageButton>(R.id.btnSad)
        btnSad.setOnClickListener {
            updateEmotionSelection(it as ImageButton,  rootView.findViewById<LinearLayout>(R.id.keywordsContainer), listOf("Me siento decepcionado", "Problemas en el trabajo", "Nada especial"))
        }
        val btnNeutral = rootView.findViewById<AppCompatImageButton>(R.id.btnNeutral)
        btnNeutral.setOnClickListener {
            updateEmotionSelection(it as ImageButton,  rootView.findViewById<LinearLayout>(R.id.keywordsContainer), listOf("Día normal", "Todo tranquilo", "Sin novedades"))
        }
        val btnHappy = rootView.findViewById<AppCompatImageButton>(R.id.btnHappy)
        btnHappy.setOnClickListener {
            updateEmotionSelection(it as ImageButton,  rootView.findViewById<LinearLayout>(R.id.keywordsContainer), listOf("Me hicieron un cumplido", "Pasé tiempo con amigos", "Tuve un buen día"))
        }
        val btnExcited = rootView.findViewById<AppCompatImageButton>(R.id.btnExcited)
        btnExcited.setOnClickListener {
            updateEmotionSelection(it as ImageButton,  rootView.findViewById<LinearLayout>(R.id.keywordsContainer), listOf("Logré una meta", "Recibí buenas noticias", "Me siento pleno"))
        }


        return rootView
    }

    // Función para manejar la selección de emociones
    private fun updateEmotionSelection(selectedButton: ImageButton, container: LinearLayout, keywords: List<String>) {
        // Reinicia el estado de todas las caritas
        resetEmotionButtons()

        // Cambia el tamaño y eleva la cara seleccionada
        detalleEmocion = selectedButton.contentDescription.toString()
        selectedButton.scaleX = 1.3f
        selectedButton.scaleY = 1.3f
        selectedButton.elevation = 10f

        // Limpia y actualiza el contenedor de palabras clave
        container.removeAllViews()
        for (keyword in keywords) {
            val button = Button(requireContext())
            button.text = keyword
            button.textSize = 16f
            button.setPadding(20, 10, 20, 10)
            button.setBackgroundResource(R.drawable.rounded_button_background)
            button.setTextColor(ContextCompat.getColor(requireContext(), R.color.white))

            // Configura el comportamiento del botón
            button.setOnClickListener {
                if (selectedKeyword == button) {
                    // Si el botón ya está seleccionado, deselecciónalo y muestra todos los botones
                    selectedKeyword = null
                    container.removeAllViews()
                    updateEmotionSelection(selectedButton, container, keywords)
                } else {
                    // Selecciona el botón actual y oculta los demás
                    selectedKeyword = button
                    detalleDia = selectedKeyword!!.text.toString()

                    container.removeAllViews()
                    container.addView(button)
                }
            }

            // Agregar margen entre botones
            val layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            layoutParams.setMargins(10, 10, 10, 10)
            button.layoutParams = layoutParams

            container.addView(button)
        }

        // Asegúrate de que el contenedor sea visible
        container.visibility = View.VISIBLE
    }

    // Función para reiniciar el tamaño y elevación de las caritas
    private fun resetEmotionButtons() {
        val buttons = listOf(
            rootView.findViewById<ImageButton>(R.id.btnAngry),
            rootView.findViewById<ImageButton>(R.id.btnSad),
            rootView.findViewById<ImageButton>(R.id.btnNeutral),
            rootView.findViewById<ImageButton>(R.id.btnHappy),
            rootView.findViewById<ImageButton>(R.id.btnExcited)
        )

        for (button in buttons) {
            button.scaleX = 1.0f
            button.scaleY = 1.0f
            button.elevation = 0f
        }
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

}