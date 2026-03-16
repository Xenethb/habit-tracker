import { useState } from "react";
// @ts-ignore
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [habitName, setHabitName] = useState("");

  async function addHabit() {
    const { data, error } = await supabase
      .from('habits')
      .insert([{ name: habitName }]);

    if (error) console.error("Error:", error);
    else {
      alert("Habit saved to Supabase!");
      setHabitName("");
    }
  }

  return (
    <div className="container">
      <h1>Simon's Habit Tracker</h1>
      <input 
        value={habitName} 
        onChange={(e) => setHabitName(e.target.value)}
        placeholder="Enter a habit..." 
      />
      <button onClick={addHabit}>Add Habit</button>
    </div>
  );
}

export default App;