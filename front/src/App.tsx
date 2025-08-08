import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import styles from "./app.module.css"
import HabitsSelection from "./components/habitsSelection/habitsSelection";
import ComplexHabits from "./components/complex habits/complex-habits";
import ReadingDashboard from "./components/reading/reading";
import Books from "./components/reading/book/books";

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/">
      <div className={styles.container}>
      {/* <CreateHabits/> */}
      <Routes>
        <Route path="/Complex" element={<ComplexHabits />} />
        <Route path="/Reading/" element={<ReadingDashboard/>}/>
        <Route path="/Reading" element={<ReadingDashboard/>}/>
        <Route path="/books" element={<Books/>}/>
        <Route path="/" element={<HabitsSelection />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
