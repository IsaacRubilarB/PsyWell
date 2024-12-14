package com.psywell.app

import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.psywell.app.databinding.ActivityMainBinding
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.psywell.app.ui.login.LoginActivity
import com.psywell.app.ui.notifications.NotificationsFragment
import com.psywell.app.ui.registro_emocional.UserService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.time.Instant
import java.time.temporal.ChronoUnit

class MainActivity : AppCompatActivity() {

    var averageHeartRateWeek=0;
    var averageHeartRate=0;
    var totalStepsWeek=""
    var totalSteps =""
    var oxygenWeek=""
    var oxygen =""
    var sleep=""
    var sleepWeek =""

    private lateinit var binding: ActivityMainBinding
    private lateinit var auth: FirebaseAuth
    val PERMISSIONS =
        setOf(
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getWritePermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getWritePermission(StepsRecord::class),
            HealthPermission.getReadPermission(OxygenSaturationRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),



            )
    // Create the permissions launcher
    val requestPermissionActivityContract = PermissionController.createRequestPermissionResultContract()

    val requestPermissions = registerForActivityResult(requestPermissionActivityContract) { granted ->
        if (granted.containsAll(PERMISSIONS)) {
            // Permissions successfully granted
        } else {
            // Lack of required permissions
        }
    }

    fun logout() {
        Global.isLogin = false
        Global.userId  = "0";
        Global.userMail = "00";
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
    }
    fun isLogged(): Boolean {
        return Global.isLogin;
    }

    suspend fun checkPermissionsAndRun(healthConnectClient: HealthConnectClient) {
        val granted = healthConnectClient.permissionController.getGrantedPermissions()
        if (granted.containsAll(PERMISSIONS)) {
            // Permissions already granted; proceed with inserting or reading data
        } else {
            requestPermissions.launch(PERMISSIONS)
        }
    }



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Verificar si el usuario está logueado
        if (!isLogged()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish() // Finalizar la actividad actual para prevenir regresar a esta pantalla
            return // Salir del método para evitar ejecución innecesaria
        }

        // Configurar la vista de enlace (ViewBinding)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Configuración de la barra de navegación inferior
        val navView: BottomNavigationView = binding.navView

        // Configuración del controlador de navegación
        val navController = findNavController(R.id.nav_host_fragment_activity_main)

        // Configurar los destinos principales para el controlador de la barra de navegación
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.navigation_home,
                R.id.navigation_dashboard,
                R.id.navigation_notifications,
                R.id.navigation_registro_emocional
            )
        )



        navView.setupWithNavController(navController)
        auth = Firebase.auth
        var currentUser = auth.getCurrentUser()

        val healthConnectClient = HealthConnectClient.getOrCreate(this)

        lifecycleScope.launch {
            checkPermissionsAndRun(healthConnectClient)



            val stepsData = readStepsByTimeRange(healthConnectClient)
            println(stepsData.size)
            if (stepsData.isNotEmpty()) {
                // Process steps data, e.g., calculate total steps
                totalSteps = stepsData.sumOf { it.count }.toString()
                //findViewById<TextView>(R.id.stepsWeek).text = totalStepsWeek.toString()
            } else {
                // Handle case where no data was retrieved
            }
            val stepsDataWeek = readStepsDataForLastWeek(healthConnectClient)
            if (stepsDataWeek.isNotEmpty()) {
                // Process steps data, e.g., calculate total steps
                totalStepsWeek = stepsDataWeek.sumOf { it.count }.toString()
                //findViewById<TextView>(R.id.stepsWeek).text = totalStepsWeek.toString()
            } else {
                // Handle case where no data was retrieved
            }
            averageHeartRateWeek = 0;
            var averageHeartRateWeekCount = 0;
            val heartRateData = readHeartRateDataForLastWeek(healthConnectClient)
            if (heartRateData.isNotEmpty()) {

                //  val averageHeartRate = heartRateData.map { it.beatsPerMinute }.average()
                // Process heart rate data, e.g., calculate average heart rate
                for (r in heartRateData) {
                    for (record in r.samples) {
                        Log.d(TAG, "Record: ${record.beatsPerMinute}")
                        averageHeartRateWeek += record.beatsPerMinute.toInt();
                        averageHeartRateWeekCount++
                    }

                }
                averageHeartRateWeek /= averageHeartRateWeekCount;
                // findViewById<TextView>(R.id.bpmWeek).text = "$averageHeartRateWeek"
            } else {
                //   findViewById<TextView>(R.id.textView2).text = "Average heart rate last week: 0"
            }
            averageHeartRate = 0;
            var averageHeartRateCount2 =0;
            val heartRateData2 = readHeartRateDataForLastDay(healthConnectClient)
            if (heartRateData2.isNotEmpty()) {
                // Process heart rate data, e.g., calculate average heart rate
                for (r in heartRateData2) {
                    for (record in r.samples) {
                        Log.d(TAG, "Record: ${record.beatsPerMinute}")
                        averageHeartRate += record.beatsPerMinute.toInt();
                        averageHeartRateCount2++
                    }

                }
                averageHeartRate /= averageHeartRateCount2;
                //   val averageHeartRate =heartRateData2.map { it.beatsPerMinute }.average()
                //   findViewById<TextView>(R.id.bpmWeek).text = "$averageHeartRate"
            } else {
                //  findViewById<TextView>(R.id.textView3).text = "Average heart rate for the last day: 0"
            }

            val sleepRaw = readWeeklySleepData(healthConnectClient);
            val sleepWeekRaw = readWeeklySleepDataWeeK(healthConnectClient);

            var totalSleepDurationMillis = 0L

            for (session in sleepRaw) {
                totalSleepDurationMillis += session.endTime.toEpochMilli() - session.startTime.toEpochMilli()
            }

            val totalSleepDurationHours = totalSleepDurationMillis / (1000 * 60 * 60)
            sleep = totalSleepDurationHours.toString()

            totalSleepDurationMillis = 0L
            for (session in sleepWeekRaw) {
                totalSleepDurationMillis += session.endTime.toEpochMilli() - session.startTime.toEpochMilli()
            }

            val totalSleepDurationHoursWeek = totalSleepDurationMillis / (1000 * 60 * 60)

            sleepWeek = totalSleepDurationHoursWeek.toString();

            val oxygenRaw = readOxygenSaturationData(healthConnectClient);
            val oxygenWeekRaw = readOxygenSaturationDataWeek(healthConnectClient);
            oxygen = oxygenRaw.toString();
            oxygenWeek = oxygenWeekRaw.toString();

            var totalOxygenSaturation = 0.0
            var recordCount = 0

            for (record in oxygenRaw) {
                totalOxygenSaturation += record.percentage.value
                recordCount++
            }

            if (recordCount > 0) {
                oxygen = (totalOxygenSaturation / recordCount).toString()
            } else {
                oxygen ="0.0" // Handle case where no records are found
            }

            totalOxygenSaturation = 0.0
            recordCount = 0

            for (record in oxygenWeekRaw) {
                totalOxygenSaturation += record.percentage.value
                recordCount++
            }

            if (recordCount > 0) {
                oxygenWeek = (totalOxygenSaturation / recordCount).toString()
            } else {
                oxygenWeek ="0.0" // Handle case where no records are found
            }

            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            val current = LocalDateTime.now().format(formatter)

            val db = Firebase.firestore
            val datosBios = hashMapOf(
                "bpm" to averageHeartRate,
                "bpmSemanal" to averageHeartRateWeek,
                "oxygen" to oxygen,
                "oxygenSemanal" to  oxygenWeek,
                "sleep" to sleep,
                "sleepSemanal" to sleepWeek,
                "steps" to totalSteps,
                "stepsSemanal" to totalStepsWeek,
                "fecha" to current,
                "mail" to Global.userMail,
                "userId" to Global.userId )

            bioDatosCargar();


// Add a new document with a generated ID
            db.collection("datos_fisiologicos")
                .add(datosBios)
                .addOnSuccessListener { documentReference ->
                    Log.d(TAG, "DocumentSnapshot added with ID: ${documentReference.id}")
                }
                .addOnFailureListener { e ->
                    Log.w(TAG, "Error adding document", e)
                }



            val retrofit = Retrofit.Builder()
                .baseUrl("https://whispering-falls-79969-63bff78d2a8a.herokuapp.com/")
                .addConverterFactory(GsonConverterFactory.create()) // Or other converter if needed
                .build()

            val service = retrofit.create(UserService::class.java)
            try {

                //val requestBody = RequestBody.create(MediaType.parse("application/json"),
                val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                val current = LocalDateTime.now().format(formatter)
                //   val comentario = rootView.findViewById<EditText>(R.id.etComment).text.toString()

                val response = service.getCitas()

                if (response.isSuccessful) {
                    // Handle successful response
                    val responseBody = response.body()
                    Log.d(TAG, responseBody.toString())
                    val sortedCitas = response.body()?.data!!.sortedBy { it.fecha }
                    var encontrado = false;
                    for (cita in sortedCitas) {
                        // Access properties of each Cita object
                        if(cita.idPaciente.toString() == Global.userId){
                            println("Cita ID: ${cita.idCita}")
                            println("Paciente ID: ${cita.idPaciente}")
                            //      findViewById<TextView>(R.id.ubicacion).text="Ubicacion : "+cita.ubicacion;
                            //      findViewById<TextView>(R.id.inicio).text="Fecha : "+cita.fecha;
                            //     findViewById<TextView>(R.id.fin).text= "Hora : "+cita.horaInicio +" - "+cita.horaFin;
                            //     findViewById<TextView>(R.id.detalles).text="Comentario : "+ cita.comentarios;
                            //      findViewById<TextView>(R.id.welcome).text="Bienvenido(a) a Psywell, "+Global.userMail;
                            Global.citaUbicacion ="Ubicacion : "+cita.ubicacion;
                            Global.citaFecha ="Fecha : "+cita.fecha;
                            Global.citaHorario ="Hora : "+cita.horaInicio +" - "+cita.horaFin;
                            Global.citaComentario ="Comentario : "+ cita.comentarios;
                            Global.citaTitulo ="Bienvenido(a) a Psywell, "+Global.userMail;

                            var inicio = findViewById<TextView>(R.id.inicio) as TextView
                            var fin = findViewById<TextView>(R.id.fin) as TextView
                            var ubicacion = findViewById<TextView>(R.id.ubicacion) as TextView
                            var detalles = findViewById<TextView>(R.id.detalles) as TextView
                            var welcome = findViewById<TextView>(R.id.welcome) as TextView

                            Global.citaId=cita.idCita.toString();

                            ubicacion.text=Global.citaUbicacion;
                            inicio.text=Global.citaFecha
                            fin.text=Global.citaHorario;
                            detalles.text=Global.citaComentario;
                            welcome.text="¡Bienvenido, Paciente!";

                            // Global.userMail = email

                            encontrado = true;
                            break;
                        }
                        // ... access other properties ...
                    }
                    if(!encontrado){
                        findViewById<TextView>(R.id.inicio).text="No se encontraron citas";
                    }
//                    var con = rootView.findViewById<LinearLayout>(R.id.keywordsContainer)
                    //   con.removeAllViews()
                    //   val comentario = rootView.findViewById<EditText>(R.id.etComment)
                    //  comentario.setText("")


                    // ... process responseBody ...
                } else {
                    Log.d("error", "post error")
                    findViewById<TextView>(R.id.inicio).text="No se encontraron citas";


                    // ...
                }
            } catch (e: Exception) {
                // Handle network or other errors
                Log.d("error", e.message.toString())

            }











        }



        // val googleCredential = oneTapClient.getSignInCredentialFromIntent(data)
        // val idToken = googleCredential.googleIdToken



    }

    suspend fun readStepsByTimeRange ( healthConnectClient: HealthConnectClient): List<StepsRecord> {
        val endTime = LocalDateTime.now()
        val startTime = endTime.minusDays(1)
        return try {
            val response =
                healthConnectClient.readRecords(
                    ReadRecordsRequest(
                        StepsRecord::class,
                        timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                    )
                )
            response.records
        } catch (e: Exception) {
            emptyList()
        }
    }
    suspend fun readStepsDataForLastWeek(healthConnectClient: HealthConnectClient): List<StepsRecord> {
        val endTime = LocalDateTime.now()
        val startTime = endTime.minusDays(7) // Last 7 days

        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }
    suspend fun readHeartRateDataForLastWeek(healthConnectClient: HealthConnectClient): List<HeartRateRecord> {
        val endTime = LocalDateTime.now()
        val startTime = endTime.minusDays(7) // Last 7 days

        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }
    suspend fun readHeartRateDataForLastDay(healthConnectClient: HealthConnectClient): List<HeartRateRecord> {
        val endTime = LocalDateTime.now()
        val startTime = endTime.minusDays(1) // Last 24 hours

        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }
    suspend fun readStepsData(healthConnectClient: HealthConnectClient, startTime: LocalDateTime, endTime: LocalDateTime): List<StepsRecord> {
        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            Log.e(TAG, "Error reading steps data: ${e.message}", e)
            emptyList()
        }
    }




    suspend fun readOxygenSaturationData(healthConnectClient: HealthConnectClient): List<OxygenSaturationRecord> {
        val endTime =  Instant.now()
        val startTime = endTime.minus(1,ChronoUnit.DAYS)
        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    OxygenSaturationRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }
    suspend fun readOxygenSaturationDataWeek(healthConnectClient: HealthConnectClient): List<OxygenSaturationRecord> {
        val endTime = LocalDateTime.now()
        val startTime = endTime.minusDays(7)
        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    OxygenSaturationRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }
    suspend fun readWeeklySleepData(healthConnectClient: HealthConnectClient): List<SleepSessionRecord> {
        val endTime =  Instant.now()
        val startTime =  Instant.now().minus(1, ChronoUnit.DAYS) // Last 7 days

        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            return response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }
    suspend fun readWeeklySleepDataWeeK(healthConnectClient: HealthConnectClient): List<SleepSessionRecord> {
        val endTime = LocalDateTime.now()
        val startTime = endTime.minusDays(7) // Last 7 days

        return try {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records
        } catch (e: Exception) {
            // Handle errors, e.g., log the error or display a message to the user
            emptyList()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when(item.itemId) {
            R.id.navigation_notifications -> {

                return true

            }

        }

        return super.onOptionsItemSelected(item)
    }


    private fun bioDatosCargar() {
        Global.a = averageHeartRate.toString();
        Global.aa = averageHeartRateWeek.toString();
        Global.b = totalSteps;
        Global.bb = totalStepsWeek;
        Global.c = oxygen;
        Global.cc = oxygenWeek;
        Global.d = sleep;
        Global.dd = sleepWeek;
    }





}