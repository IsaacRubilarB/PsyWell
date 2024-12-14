package com.psywell.app.ui.dashboard

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.psywell.app.R
import com.psywell.app.databinding.FragmentDashboardBinding
import androidx.viewpager2.widget.ViewPager2
import android.media.MediaPlayer
import android.widget.SeekBar
import android.widget.ImageButton
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch


class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private var fullScreenContainer: FrameLayout? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private lateinit var bottomNavigationView: BottomNavigationView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        val root: View = binding.root

        fullScreenContainer = requireActivity().findViewById(R.id.fullscreen_container)
        bottomNavigationView = requireActivity().findViewById(R.id.nav_view)
        lifecycleScope.launch {
            // Mostrar indicador de carga al inicio


            // Cargar datos dinámicos
            loadSounds()
            loadVideos()
            loadBooks()

        }

        return root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null

     //   val videosContainer: LinearLayout? = binding?.videosContainer
       // videosContainer?.removeAllViews() // Remover WebViews para evitar fugas de memoria
    }




    private fun loadSounds() {
        val soundsContainer: LinearLayout = binding.soundsContainer
        val db = Firebase.firestore

        db.collection("audios")
            .get()
            .addOnSuccessListener { documents ->
                soundsContainer.removeAllViews() // Limpia el contenedor antes de agregar nuevos audios
                for (document in documents) {
                    val title = document.getString("titulo") ?: "Sin título"
                    val url = document.getString("url") ?: ""

                    val audioView = layoutInflater.inflate(R.layout.audio_item, soundsContainer, false)

                    val titleTextView = audioView.findViewById<TextView>(R.id.audioTitle)
                    val playPauseButton = audioView.findViewById<ImageButton>(R.id.playPauseButton)
                    val seekBar = audioView.findViewById<SeekBar>(R.id.audioSeekBar)

                    titleTextView.text = title

                    try {
                        val mediaPlayer = MediaPlayer()
                        var isPlaying = false

                        mediaPlayer.setDataSource(url)
                        mediaPlayer.prepareAsync()
                        mediaPlayer.setOnPreparedListener {
                            seekBar.max = mediaPlayer.duration
                        }

                        playPauseButton.setOnClickListener {
                            if (isPlaying) {
                                mediaPlayer.pause()
                                playPauseButton.setImageResource(R.drawable.play)
                            } else {
                                mediaPlayer.start()
                                playPauseButton.setImageResource(R.drawable.pause)
                            }
                            isPlaying = !isPlaying
                        }

                        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                            override fun onProgressChanged(seekBar: SeekBar, progress: Int, fromUser: Boolean) {
                                if (fromUser) mediaPlayer.seekTo(progress)
                            }

                            override fun onStartTrackingTouch(seekBar: SeekBar) {}
                            override fun onStopTrackingTouch(seekBar: SeekBar) {}
                        })

                        mediaPlayer.setOnCompletionListener {
                            playPauseButton.setImageResource(R.drawable.play)
                            seekBar.progress = 0
                            isPlaying = false
                        }

                        soundsContainer.addView(audioView)
                    } catch (e: Exception) {
                        Log.e("MediaPlayer", "Error al reproducir el audio: $url", e)
                    }
                }
            }
            .addOnFailureListener { exception ->
                Log.e("Firestore", "Error al cargar audios", exception)
            }
    }




    // Formato de tiempo para mostrar minutos y segundos
    private fun formatTime(milliseconds: Int): String {
        val minutes = (milliseconds / 1000) / 60
        val seconds = (milliseconds / 1000) % 60
        return String.format("%d:%02d", minutes, seconds)
    }


    private fun playAudio(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        if (intent.resolveActivity(requireActivity().packageManager) != null) {
            startActivity(intent)
        } else {
            Log.e("Intent", "No hay ninguna aplicación para abrir este enlace.")
        }
    }

    private fun loadVideos() {
        val videosContainer: LinearLayout = binding.videosContainer
        val db = Firebase.firestore

        db.collection("recursos-materiales")
            .get()
            .addOnSuccessListener { documents ->
                for (document in documents) {
                    val title = document.getString("titulo") ?: "Título desconocido"
                    val url = document.getString("url") ?: ""

                    if (url.isNotBlank()) {
                        val videoButton = Button(requireContext()).apply {
                            text = title
                            textSize = 16f
                            setPadding(16, 8, 16, 8)
                            setOnClickListener { toggleVideoDisplay(videosContainer, this, url) }
                        }

                        videosContainer.addView(videoButton)
                    } else {
                        Log.w("DashboardFragment", "Video con URL vacía: ${document.id}")
                    }
                }
            }
            .addOnFailureListener { exception ->
                Log.e("Firestore", "Error al cargar videos", exception)
            }
    }


    private fun toggleVideoDisplay(container: LinearLayout, button: Button, videoUrl: String) {
        val existingWebView = container.findViewWithTag<WebView>("webview_${button.text}")
        if (existingWebView != null) {
            // Si el WebView ya está desplegado, se elimina
            container.removeView(existingWebView)
        } else {
            val webView = WebView(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    600 // Altura inicial del WebView
                )

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    mediaPlaybackRequiresUserGesture = false
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onShowCustomView(view: View, callback: CustomViewCallback) {
                        fullScreenContainer?.addView(view)
                        fullScreenContainer?.visibility = View.VISIBLE

                        // Ocultar contenido principal y barra inferior
                        binding.mainContent.visibility = View.GONE
                        bottomNavigationView.visibility = View.GONE

                        customViewCallback = callback
                    }

                    override fun onHideCustomView() {
                        fullScreenContainer?.removeAllViews()
                        fullScreenContainer?.visibility = View.GONE

                        // Restaurar contenido principal y barra inferior
                        binding.mainContent.visibility = View.VISIBLE
                        bottomNavigationView.visibility = View.VISIBLE

                        customViewCallback?.onCustomViewHidden()
                    }
                }

                webViewClient = WebViewClient()
                loadUrl(videoUrl) // Cargar el video
                tag = "webview_${button.text}" // Asignar una etiqueta única para el WebView
            }

            // Insertar el WebView justo debajo del botón correspondiente
            val buttonIndex = container.indexOfChild(button)
            container.addView(webView, buttonIndex + 1)
        }
    }

    private val mediaPlayers = mutableListOf<MediaPlayer>()



    private fun loadBooks() {
        val booksCarousel: ViewPager2 = binding.booksCarousel
        val db = Firebase.firestore

        db.collection("libros")
            .get()
            .addOnSuccessListener { documents ->
                val books = documents.mapNotNull { document ->
                    try {
                        Book(
                            titulo = document.getString("titulo") ?: "Sin título",
                            portada = document.getString("portada") ?: "", // URL de la portada
                            url = document.getString("url") ?: ""
                        )
                    } catch (e: Exception) {
                        Log.e("DashboardFragment", "Error al parsear el libro: ${document.id}", e)
                        null
                    }
                }

                if (books.isNotEmpty()) {
                    booksCarousel.adapter = BooksAdapter(books) { book ->
                        openBook(book.url)
                    }
                } else {
                    Log.w("DashboardFragment", "No se encontraron libros en Firebase.")
                }
            }
            .addOnFailureListener { exception ->
                Log.e("DashboardFragment", "Error al cargar libros: ", exception)
            }
    }





    private fun openBook(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            Log.e("DashboardFragment", "Error opening book URL: $url", e)
        }
    }







}
