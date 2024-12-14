package com.psywell.app.ui.notifications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.psywell.app.Global
import com.psywell.app.R
import com.psywell.app.databinding.FragmentNotificationsBinding

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private lateinit var bpmTextView: TextView
    private lateinit var bpmWeekTextView: TextView
    private lateinit var stepsTextView: TextView
    private lateinit var stepsWeekTextView: TextView
    private lateinit var oxygenTextView: TextView
    private lateinit var oxygenWeekTextView: TextView
    private lateinit var sleepTextView: TextView
    private lateinit var sleepWeekTextView: TextView



    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {




        // Inflates the custom fragment layout
        val view: View = inflater.inflate(R.layout.fragment_notifications, container, false)

        // Finds the TextView in the custom fragment
        bpmTextView = view.findViewById<View>(R.id.bpm) as TextView
        bpmWeekTextView = view.findViewById<View>(R.id.bpmWeek) as TextView
        stepsTextView = view.findViewById<View>(R.id.steps) as TextView
        stepsWeekTextView = view.findViewById<View>(R.id.stepsWeek) as TextView
        oxygenTextView  = view.findViewById<View>(R.id.oxygeno) as TextView
        oxygenWeekTextView  = view.findViewById<View>(R.id.oxygenoWeek) as TextView
        sleepTextView  = view.findViewById<View>(R.id.sleep) as TextView
        sleepWeekTextView  = view.findViewById<View>(R.id.sleepWeek) as TextView

        bpmTextView.text = Global.a;
        bpmWeekTextView.text = Global.aa;
        stepsWeekTextView.text = Global.bb;
        stepsTextView.text = Global.b;
        oxygenTextView.text  =  Global.c;
        oxygenWeekTextView.text  =  Global.cc;
        sleepTextView.text  =  Global.d;
        sleepWeekTextView.text  =  Global.dd;



        return view
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}