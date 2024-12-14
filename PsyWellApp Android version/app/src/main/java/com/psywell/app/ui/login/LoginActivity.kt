package com.psywell.app.ui.login

import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.psywell.app.Global
import com.psywell.app.MainActivity
import com.psywell.app.R
import com.psywell.app.ui.registro_emocional.UserService
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val usernameEditText = findViewById<EditText>(R.id.email)
        val passwordEditText = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)

        loginButton.setOnClickListener {
            val username = usernameEditText.text.toString()
            val password = passwordEditText.text.toString()

            // Perform login validation here
            // ...

            // If login is successful, navigate to the main activity
            Log.d(TAG,"btn press")
            val retrofit = Retrofit.Builder()
                .baseUrl("https://enigmatic-temple-94296-2f035ff18512.herokuapp.com/")
                .addConverterFactory(GsonConverterFactory.create()) // Or other converter if needed
                .build()

            val service = retrofit.create(UserService::class.java)
            lifecycleScope.launch {
                try {


                   // val emo = UserService.
                    val response = service.getUsuarios()


                    if (response.isSuccessful) {
                        val status = response.body()?.status
                        val usuarios = response.body()?.data

                        if (usuarios != null) {
                            for (usuario in usuarios) {
                                println("email: ${usuario.email}")
                                println("contrasenia: ${usuario.contrasena}")
                                if(usuario.email == username && usuario.contrasena == password){
                                    loged(usuario.idUsuario.toString(),usuario.email);
                                    break;
                                }
                                // ... access other properties ...
                            }
                            Toast.makeText(this@LoginActivity, "Error al iniciar Sesion", Toast.LENGTH_SHORT).show()
                        }


                    } else {
                        Toast.makeText(this@LoginActivity, "Error al iniciar Sesion", Toast.LENGTH_SHORT).show()

                        Log.d("error","post error")

                        // ...
                    }
                } catch (e: Exception) {
                    // Handle network or other errors
                    Log.d("error",e.message.toString())

                }
            }


            // ...
        }

    }
    fun loged(idUsuario: String, email: String) {
        Global.isLogin = true
        Global.userId = idUsuario
        Global.userMail = email
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }
    fun isLogged(): Boolean {
        return Global.isLogin;
    }
}